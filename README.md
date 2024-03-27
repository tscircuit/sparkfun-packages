# @tscircuit/sparkfun-packages

The Sparkfun Eagle Component footprints can easily be used with tscircuit by
providing a string to your `footprint` parameter for a `bug` like so:

```ts
export const MyCircuit = () => <bug footprint="sparkfun:0402" />
```
