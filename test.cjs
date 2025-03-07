const { parse } = require('./parse')
const test = require('brittle')

const mjs = require('es-module-lexer')
mjs.initSync()

test('basic script', function (t) {
  {
    const res = parse(
      `
      require   ("hello" );require('world')
    `,
      'script'
    )

    t.is(res.type, 'script')
    t.alike(
      res.resolutions.map((r) => r.input),
      ['hello', 'world']
    )
  }

  {
    const res = parse(
      `
      require('hello')
      require('world')
    `,
      'script'
    )

    t.is(res.type, 'script')
    t.alike(
      res.resolutions.map((r) => r.input),
      ['hello', 'world']
    )
  }
})

test('basic module', function (t) {
  const res = parse(`
    import hello from 'world'
    await import('dynamic')
  `)

  t.is(res.type, 'module')
  t.alike(
    res.resolutions.map((r) => r.input),
    ['world', 'dynamic']
  )
})

test('spread require output', function (t) {
  const res = parse(
    `
      const b = [...require("./def/pear" )]
      const c = { ...require("./obj" ) }
      const d = {
        ...require("./newline-obj" )
      }
    `,
    'script'
  )

  t.is(res.type, 'script')
  t.alike(
    res.resolutions.map((r) => r.input),
    ['./def/pear', './obj', './newline-obj']
  )
})

test('script that falls back', function (t) {
  const res = parse(
    `
    import hello from 'world'
  `,
    'script',
    false
  )

  t.is(res.type, 'module')
  t.alike(
    res.resolutions.map((r) => r.input),
    ['world']
  )
})

test('detects addons', function (t) {
  const res = parse(
    `
    const some = require('something')
    const addon = require.addon()'
    const addon2 = require.addon('./here')
    const addon3 = require.addon('./referred', __filename)
  `,
    'script'
  )

  t.alike(
    res.addons.map((a) => a.input),
    ['.', './here', './referred']
  )
})

test('detects assets', function (t) {
  const res = parse(
    `
    const some = require('something')
    const asset2 = require.asset('./here')
  `,
    'script'
  )

  t.alike(
    res.assets.map((a) => a.input),
    ['./here']
  )
})
