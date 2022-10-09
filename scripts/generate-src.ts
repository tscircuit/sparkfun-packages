import { parseEagleXML } from "@tscircuit/eagle-xml-converter"
import gitClone from "git-clone/promise"
import path from "path"
import * as fs from "fs"
import rmfr from "rmfr"
import mkdirp from "mkdirp"

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

  for (const file of eagleLibFiles) {
    const lib = parseEagleXML(
      fs.readFileSync(path.resolve(sfPath, file)).toString()
    )
    fs.writeFileSync(
      path.resolve(srcPath, `${lib.name}.json`),
      JSON.stringify(lib, null, 2)
    )
  }

  console.log(files)
}

main()
