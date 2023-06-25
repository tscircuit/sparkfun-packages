import { Package } from "@tscircuit/eagle-xml-converter"

export const getComponentName = async (pkg: Package) => {
  const camelcase = (await import("camelcase")).default

  const { name, description } = pkg

  const componentName = camelcase(name.toString().replace(/[^a-zA-Z0-9]/g, ""))

  return componentName
}
