const CALL_WITH_STRING = /^\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*\)/
const IS_ADDON = /^\s*\.addon\s*\(/

module.exports = parseCJS

function parseCJS (src, resolutions = []) {
  const seen = []

  let addons = false
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
          resolutions.push(add(req, false))
        }
      } else if (addons === false && IS_ADDON.test(suffix)) {
        addons = true
        resolutions.push(add(null, true))
      }
    }

    i = src.indexOf('require', i + 7)
  }

  return resolutions
}

function add (input, isAddon) {
  return { isImport: false, isAddon, position: null, input, output: null }
}

function newWord (src, i) {
  const s = i > 0 ? src.slice(i - 1, i) : ''
  return !/^\w|["'`._]/.test(s)
}

function inComment (src, i) {
  const pre = src.slice(i > 100 ? i - 100 : 0, i)
  return pre.indexOf('//', Math.max(pre.lastIndexOf('\n'), 0)) > -1 && src.slice(i, i + 100).indexOf('\n') > -1
}
