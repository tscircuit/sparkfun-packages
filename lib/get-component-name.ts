import { Package } from "@tscircuit/eagle-xml-converter"

export const getComponentName = async (pkg: Package) => {
  const { snakeCase } = await import("change-case")
  const { name, description } = pkg

  const componentName = snakeCase(name.toString().replace(/[^a-zA-Z0-9]/g, ""))

  // Add leading prefixes to some components that don't have them
  if (componentName === "402") return "0402"
  if (componentName === "603") return "0603"
  if (componentName === "805") return "0805"
  if (componentName === "806") return "0806"

  return componentName
}
