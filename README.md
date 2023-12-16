# sloppy-module-parser

Parse imports/exports/requires with a focus on speed over 100% correctness

```
npm install sloppy-module-parser
```

Sometimes it might report requires that are indeed not requires but tries to not miss any.
This limitation gives it a massive speed boost compared to other parsers.

## Usage

``` js
const { init, parse } = require('sloppy-module-parser')

await init() // needed to init the async esm parser used

console.log(parse(src))
```

## API

#### `async parser.init()`

Init the async esm parser. Call this before using the module.

#### `const res = parser.parse(src, type = 'module', strictMode = true)`

Parses imports/requires from the source. `type` helps it understand what it should parse for.

Type should be one of the following: `module` / `script` / `json`.

If strict mode is false, and type is not `module`, it autodetects if any `import` / `export` statements
are used and if so auto corrects the type. This is useful for module interop.

The returned result looks like this

```js
{
  type: 'module',
  resolutions: [
    {
      isImport: boolean, // is it an import or a require
      isAddon: boolean, // is this import / require pointing to a native addon
      position: [statementStart, inputStart, inputEnd], // where is the statement, might be null
      input: string, // the input to import / require, `null` is if it is unknown at parse time
      output: null // what it should resolve to, just set for conveinience
    },
    ...
  ],
  namedImports: [
    {
      isWildcard: boolean, // is it a wildcard import
      isExport: boolean, // reexports the import
      names: [string, ...], // the named imports,
      from: referenceToRelevantResolution
    }
  ],
  exports: [string, ...] // only default populated for esm
}
```

#### `const exports = parser.exports(src, type)`

Get the exports from a module. Type is the same as in parse.

## License

Apache-2.0
