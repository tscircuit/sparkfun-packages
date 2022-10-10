import { Package, EagleJSON } from "@tscircuit/eagle-xml-converter"

/**
 * Target output example:

const ExampleComponent = () => (
  <component>
    <pad x="0" y="0" width="0.005in" height="0.005in" drill="0.002in" />
    <pad x="0.01in" y="0" width="0.005in" height="0.005in" drill="0.002in" />
    <schematic_symbol>
      <line x1="0in" y1="0in" x2="1in" y2="0in" />
      <line x1="1in" y1="0in" x2="1in" y2="1in" />
    </schematic_symbol>
  </component>
)

*/

/**
 * Convert eagle package JSON to a string representing a typescript
 * file for that component with tscircuit jsx
 *
 * TODO use ts-morph to generate the file, strings are hacky
 */
export const packageToFile = async (pkg: Package, eagle: EagleJSON) => {
  const camelcase = (await import("camelcase")).default

  const {
    smd = [],
    text = [],
    wire = [],
    name,
    circle = [],
    rectangle = [],
    description,
  } = pkg

  const componentName = camelcase(`sf${name.replace(/[^a-zA-Z0-9]/g, "")}`)

  const unit = eagle.grid.unit

  return {
    componentName,
    fileContent: `
import React from "react"

const ${componentName} = () => (
  <component description={"${JSON.stringify(description)}"}>
${smd.map(
    (smd) =>
      `    <pad x="${smd.x}${unit}" y="${smd.y}${unit}" width="${smd.dx}${unit}" height="${smd.dy}${unit}" />`
  ).join('\n')}
    <schematic_symbol>
    </schematic_symbol>
  </component>
)`,
  }
}
