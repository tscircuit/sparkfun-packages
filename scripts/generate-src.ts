import { parseEagleXML } from "@tscircuit/eagle-xml-converter"
import gitClone from "git-clone/promise"
import path from "path"
import * as fs from "fs"
import rmfr from "rmfr"
import mkdirp from "mkdirp"
import { packageToFile } from "../lib/package-to-component-file"
import { getComponentName } from "../lib/get-component-name"

async function main() {
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

    await mkdirp(srcJsLibDir)
    await mkdirp(jsonDir)

    for (const pkg of lib.library.packages) {
      const componentName = await getComponentName(pkg)
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

  // Add leading prefixes to some components that don't have them
  export_modules["0402"] = export_modules["402"]
  export_modules["0603"] = export_modules["603"]
  export_modules["0805"] = export_modules["805"]
  export_modules["0806"] = export_modules["806"]

  // Generate index.js
  const indexJsContent = `module.exports = {${Object.keys(export_modules).map(
    (k) => `\n  "${k}": require("${export_modules[k]}")`
  )}}`
  fs.writeFileSync(path.resolve(srcJsDir, "index.js"), indexJsContent)
}

main()
