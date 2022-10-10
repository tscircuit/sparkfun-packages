import { parseEagleXML } from "@tscircuit/eagle-xml-converter"
import gitClone from "git-clone/promise"
import path from "path"
import * as fs from "fs"
import rmfr from "rmfr"
import mkdirp from "mkdirp"
import { packageToFile } from "../lib/package-to-file"

async function main() {
  const { pkgUp } = await import("pkg-up")
  const pkgPath = await pkgUp()
  if (!pkgPath) throw new Error("Could not find package.json")
  const srcPath = path.resolve(pkgPath, "../src")
  const sfPath = path.resolve(pkgPath, "../sparkfun")

  if (!fs.existsSync(sfPath)) {
    await gitClone(
      "https://github.com/sparkfun/SparkFun-Eagle-Libraries.git",
      sfPath
    )
  }
  const eagleLibFiles = fs.readdirSync(sfPath).filter((f) => f.endsWith(".lbr"))

  // Clear source directory
  await rmfr(srcPath)
  await mkdirp(srcPath)
  await mkdirp(path.resolve(srcPath, "parsed-eagle"))

  for (const file of eagleLibFiles) {
    const lib = parseEagleXML(
      fs.readFileSync(path.resolve(sfPath, file)).toString()
    )

    fs.writeFileSync(
      path.resolve(srcPath, `parsed-eagle/${file.split(".")[0]}.json`),
      JSON.stringify(lib, null, 2)
    )

    const tsDir = path.resolve(
      srcPath,
      file.split("/").slice(-1)[0].split("-")[1].split(".")[0].toLowerCase()
    )
    await mkdirp(tsDir)

    for (const pkg of lib.library.packages) {
      try {
        const { fileContent, componentName } = await packageToFile(pkg, lib)
        fs.writeFileSync(
          path.resolve(tsDir, `${componentName}.tsx`),
          fileContent
        )
      } catch (e) {
        console.warn(
          `Failed to convert package in ${file.split("/").slice(-1)[0]}`
        )
      }
    }
  }
}

main()
