import { Package } from "@tscircuit/eagle-xml-converter"

/**
 * Target output:

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

export const packageToFile = (pkg: Package) => {}
