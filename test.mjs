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

test('script that falls back', function (t) {
  const res = parse(`
    import hello from 'world'
  `, 'script', false)

  t.is(res.type, 'module')
  t.alike(res.resolutions.map(r => r.input), ['world'])
})
