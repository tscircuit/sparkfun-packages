import { parseEagleXML } from "@tscircuit/eagle-xml-converter"
import gitClone from "git-clone/promise"
import path from "path"
import * as fs from "fs"
import rmfr from "rmfr"
import mkdirp from "mkdirp"
import { packageToFile } from "../lib/package-to-component-file"
import { getComponentName } from "../lib/get-component-name"
import prettier from "prettier"
import minimist from "minimist"

async function main() {
  const args = minimist(process.argv.slice(2))
  const { pkgUp } = await import("pkg-up")
  const pkgPath = await pkgUp()
  if (!pkgPath) throw new Error("Could not find package.json")
  const srcJsDir = path.resolve(pkgPath, "../src")
  const jsonPath = path.resolve(pkgPath, "../json")
  const sfPath = path.resolve(pkgPath, "../sparkfun")

  if (!fs.existsSync(sfPath)) {
    await gitClone(
      "https://github.com/sparkfun/SparkFun-Eagle-Libraries.git",
      sfPath
    )
  }
  const eagleLibFiles = fs.readdirSync(sfPath).filter((f) => f.endsWith(".lbr"))

  // Clear source directory
  await rmfr(srcJsDir)
  await rmfr(jsonPath)
  await mkdirp(srcJsDir)
  await mkdirp(jsonPath)
  await mkdirp(path.resolve(srcJsDir, "parsed-eagle"))

  const export_modules = {}
  for (const file of eagleLibFiles) {
    const lib = parseEagleXML(
      fs.readFileSync(path.resolve(sfPath, file)).toString()
    )

    fs.writeFileSync(
      path.resolve(srcJsDir, `parsed-eagle/${file.split(".")[0]}.json`),
      JSON.stringify(lib, null, 2)
    )

    const eagleLibDirName = file
      .split("/")
      .slice(-1)[0]
      .split("-")[1]
      .split(".")[0]
      .toLowerCase()

    const srcJsLibDir = path.resolve(srcJsDir, eagleLibDirName)
    const jsonDir = path.resolve(jsonPath, eagleLibDirName)

    if (eagleLibDirName === "retired" || eagleLibDirName === "aesthetics")
      continue

    console.log(`Processing eagle lib: ${eagleLibDirName}`)

    await mkdirp(srcJsLibDir)
    await mkdirp(jsonDir)

    let whitelist: null | string[] = null
    if (args.whitelist) {
      whitelist = fs
        .readFileSync(args.whitelist)
        .toString()
        .split("\n")
        .filter((l) => !l.startsWith("#"))
    }

    for (const pkg of lib.library.packages) {
      const componentName = await getComponentName(pkg)
      if (
        whitelist &&
        !whitelist.includes(componentName) &&
        !whitelist
          ?.filter((w) => w.endsWith("*"))
          .some((w) => componentName.startsWith(w.slice(0, -1)))
      ) {
        continue
      }
      try {
        // Generate TSCircuit Component File
        // const { fileContent, componentName } = await packageToFile(pkg, lib)
        // fs.writeFileSync(
        //   path.resolve(srcJsLibDir, `${componentName}.tsx`),
        //   fileContent
        // )

        // Generate JSON File
        const jsonFileContent = JSON.stringify(pkg, null, 2)
        fs.writeFileSync(
          path.resolve(jsonDir, `${componentName}.json`),
          jsonFileContent
        )
        const jsPath = path.resolve(srcJsLibDir, `${componentName}.js`)
        // successfulJsPaths.push(jsPath)
        export_modules[componentName] = `./${eagleLibDirName}/${componentName}`
        export_modules[
          `${eagleLibDirName}/${componentName}`
        ] = `./${eagleLibDirName}/${componentName}`
        fs.writeFileSync(jsPath, `module.exports = ${jsonFileContent}`)
      } catch (e: any) {
        console.warn(
          `Failed to convert "${componentName}" package in ${
            file.split("/").slice(-1)[0]
          }: ${e.toString()}`
        )
      }
    }
  }

  // Generate index.js
  const indexJsContent = `module.exports = {${Object.keys(export_modules).map(
    (k) => `\n  "${k}": require("${export_modules[k]}")`
  )}}`
  fs.writeFileSync(path.resolve(srcJsDir, "index.js"), indexJsContent)

  const typefile = `
type SparkfunComponentId = ${Object.keys(export_modules)
    .map((a) => `"${a}"`)
    .join(" | ")}

type Package = {
  name: string;
  description?: string;
  circle?: Array<{
      x: number;
      y: number;
      radius: number;
      width: number;
      layer: number;
  }>;
  rectangle?: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      layer: number;
  }>;
  text?: Array<{
      "#text": string;
      x: number;
      y: number;
      size: number;
      layer: number;
      align: "top-left";
  }>;
  wire?: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      layer: number;
  }>;
  smd?: Array<{
      name: string;
      x: number;
      y: number;
      dx: number;
      dy: number;
      layer: number;
      roundness: number;
  }>;
}

declare module "@tscircuit/sparkfun-packages" {
  const moduleExports: Record<SparkfunComponentId, Package>;
  export = moduleExports;
}
`.trim()
  const prettyTypefile = prettier.format(typefile, { parser: "typescript" })
  fs.writeFileSync(path.resolve(srcJsDir, "index.d.ts"), prettyTypefile)
}

main()
