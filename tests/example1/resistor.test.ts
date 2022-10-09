import test from "ava"
import { packageToFile } from "../../lib/package-to-file"

const resistorPackage = {
  description:
    "<p><b>Generic 2012 (0805) package</b></p>\n<p>0.2mm courtyard excess rounded to nearest 0.05mm.</p>",
  smd: [
    {
      name: 1,
      x: -0.9,
      y: 0,
      dx: 0.8,
      dy: 1.2,
      layer: 1,
    },
    {
      name: 2,
      x: 0.9,
      y: 0,
      dx: 0.8,
      dy: 1.2,
      layer: 1,
    },
  ],
  text: [
    {
      "#text": ">NAME",
      x: 0,
      y: 0.889,
      size: 0.6096,
      layer: 25,
      font: "vector",
      ratio: 20,
      align: "bottom-center",
    },
    {
      "#text": ">VALUE",
      x: 0,
      y: -0.889,
      size: 0.6096,
      layer: 27,
      font: "vector",
      ratio: 20,
      align: "top-center",
    },
  ],
  wire: [
    {
      x1: -1.5,
      y1: 0.8,
      x2: 1.5,
      y2: 0.8,
      width: 0.0508,
      layer: 39,
    },
    {
      x1: 1.5,
      y1: 0.8,
      x2: 1.5,
      y2: -0.8,
      width: 0.0508,
      layer: 39,
    },
    {
      x1: 1.5,
      y1: -0.8,
      x2: -1.5,
      y2: -0.8,
      width: 0.0508,
      layer: 39,
    },
    {
      x1: -1.5,
      y1: -0.8,
      x2: -1.5,
      y2: 0.8,
      width: 0.0508,
      layer: 39,
    },
  ],
  name: 805,
  circle: [],
  rect: [],
}

test("resistor rendering", async (t) => {
  console.log(packageToFile(resistorPackage))
})
