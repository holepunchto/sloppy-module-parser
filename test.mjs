import { init, parse } from './parse.js'
import test from 'brittle'

await init()

test('basic script', function (t) {
  {
    const res = parse(`
      require   ("hello" );require('world')
    `, 'script')

    t.is(res.type, 'script')
    t.alike(res.resolutions.map(r => r.input), ['hello', 'world'])
  }

  {
    const res = parse(`
      require('hello')
      require('world')
    `, 'script')

    t.is(res.type, 'script')
    t.alike(res.resolutions.map(r => r.input), ['hello', 'world'])
  }
})

test('basic module', function (t) {
  const res = parse(`
    import hello from 'world'
    await import('dynamic')
  `)

  t.is(res.type, 'module')
  t.alike(res.resolutions.map(r => r.input), ['world', 'dynamic'])
})

test('spread require output', function (t) {
  const res = parse(`
      const b = [...require("./def/pear" )]
    `, 'script')

  t.is(res.type, 'script')
  t.alike(res.resolutions.map(r => r.input), ['./def/pear'])
})

test('script that falls back', function (t) {
  const res = parse(`
    import hello from 'world'
  `, 'script', false)

  t.is(res.type, 'module')
  t.alike(res.resolutions.map(r => r.input), ['world'])
})

test('detects addons', function (t) {
  const res = parse(`
    const some = require('something')
    const addon = require.addon()'
    const addon2 = require.addon('./here')
  `, 'script')

  t.alike(res.addons.map(a => a.input), ['.', './here'])
})

test('detects assets', function (t) {
  const res = parse(`
    const some = require('something')
    const asset2 = require.asset('./here')
  `, 'script')

  t.alike(res.assets.map(a => a.input), ['./here'])
})
