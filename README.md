# Tech Blog Site

> A Minimal Tech Blog built with [Vocs](https://vocs.dev)

## Technologies Used
- [Vocs](https://vocs.dev)
- [CodeSandbox Sandpack](https://sandpack.codesandbox.io/)
- [Stackblitz](https://stackblitz.com/)

## Libraries Used
- [useHooks](https://github.com/uidotdev/usehooks)
- [Feed Core](https://github.com/laudebugs/feed-core#readme)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)

## Scripts
### `prebuild`
> [!NOTE] This script is automatically run when you run `pnpm run build`
Generates the list of blog posts to be used in the home page.

## Twoslash

When using [twoslash](https://vocs.dev/docs/guides/twoslash#errors-num), i.e. the `// comments` must be at the start of the line as shown below:

```ts twoslash
function add(a: number, b: number): number {

// @noErrors
  return a + b; 
}