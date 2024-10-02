const CALL_WITH_STRING = /^\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*\)/
const IS_EXTENSION = /^\s*\.(addon|asset)\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)?\s*\)/

module.exports = parseCJS

function parseCJS (src, result) {
  const seen = []
  const seenAddons = []
  const seenAssets = []

  let i = src.indexOf('require')
  let j = i > -1 ? src.indexOf('/*') : -1

  while (i > -1) {
    if (j > -1 && i > j) {
      j = src.indexOf('*/', j + 2)
      if (j === -1) continue
      if (i < j) i = src.indexOf('require', j + 2)
      j = src.indexOf('/*', j + 2)
      continue
    }

    if (newWord(src, i) && !inComment(src, i)) {
      const suffix = src.slice(i + 7)
      const m = suffix.match(CALL_WITH_STRING)

      if (m) {
        const req = m[1].slice(1, -1)
        if (seen.indexOf(req) === -1) {
          seen.push(req)
          result.resolutions.push({ isImport: false, position: null, input: req, output: null })
        }
      } else {
        const m = suffix.match(IS_EXTENSION)
        if (m) {
          const isAddon = m[1] === 'addon'
          const req = m[2] ? m[2].slice(1, -1) : '.'

          if (isAddon) {
            if (seenAddons.indexOf(req) === -1) {
              seenAddons.push(req)
              result.addons.push({ input: req, output: null })
            }
          } else if (m[2]) {
            if (seenAssets.indexOf(req) === -1) {
              seenAssets.push(req)
              result.assets.push({ input: req, output: null })
            }
          }
        }
      }
    }

    i = src.indexOf('require', i + 7)
  }
}

function newWord (src, i) {
  const s = i > 0 ? src.slice(i - 1, i) : ''
  return !/^\w|["'`._]/.test(s)
}

function inComment (src, i) {
  const pre = src.slice(i > 100 ? i - 100 : 0, i)
  return pre.indexOf('//', Math.max(pre.lastIndexOf('\n'), 0)) > -1 && src.slice(i, i + 100).indexOf('\n') > -1
}
