# @tscircuit/sparkfun-packages

> [!CAUTION]
> This library is no longer supported inside of tscircuit, for string footprints, you can use
> a [footprinter string](https://github.com/tscircuit/footprinter), you can convert most footprints
> to a compatible footprinter string using [AI text-to-footprint](https://text-to-footprint.tscircuit.com)

> [!INFO]
> You may want to consider using [@tscircuit/footprints](https://github.com/tscircuit/footprints)
> instead of the "sparkfun strings"

The Sparkfun Eagle Component footprints can easily be used with tscircuit by
providing a string to your `footprint` parameter for a `bug` like so:

```ts
export const MyCircuit = () => <bug footprint="sparkfun:0402" />
```
