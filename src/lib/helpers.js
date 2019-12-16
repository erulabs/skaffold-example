// @flow

// Parses a string of URIs like: "host:port,host:port..."
// into an array of objects like: [ { host: "host", port: "port" }]
function parseUris(urisStr /*: any */) /*: Array<{ host: string, port: number }> */ {
  if (typeof urisStr !== 'string') return []
  const uris = urisStr.split(',')
  const out = []
  for (let i = 0; i < uris.length; i++) {
    const [host, port] = uris[i].split(':')
    out.push({ host, port: parseInt(port, 10) })
  }
  return out
}

function sampleArray(arr /*: Array<any> */) {
  if (!arr || !arr.length) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min /*: number */, max /*: number */) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

// extremely strict UUID validation is required
// because we often ship UUID creation out to clients :)
// 4e394a2f-866c-4e2a-a829-983625eb8f27
function isUUID(uuid /*: any */) {
  return (
    typeof uuid === 'string' &&
    uuid.length === 36 &&
    uuid[8] === '-' &&
    uuid[13] === '-' &&
    uuid[18] === '-' &&
    uuid[23] === '-' &&
    // Must be lower case
    uuid === uuid.toLowerCase() &&
    // Must be alphanumeric other than the '-' characters
    uuid.replace(/-/g, '').match(/^[a-z0-9]+$/i) &&
    // At most, - dashes (which we identified above)
    // $FlowIssue (we know we will match, because of the conditions above)
    uuid.match(/-/g).length === 4
  )
}

function setPTimeout(ms /*: number */) /*: Promise<void> */ {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function hasOwnProperty(obj /*: Object */, key /*: string */) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

module.exports = {
  parseUris,
  sampleArray,
  getRandomInt,
  isUUID,
  setPTimeout,
  hasOwnProperty
}
