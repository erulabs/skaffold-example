// @flow

const exitHook = require('async-exit-hook')
const { getRelease } = require('../_shared/node')
const logger = require('../_shared/logger')
const {
  listenHttps,
  server,
  serverErrorHandler,
  cacheControl
} = require('../_shared/server')
const redis = require('../_shared/redis')
const {
  API_SHUTDOWN_TIMEOUT,
  API_LISTEN_PORT
} = require('../_shared/config')
const { initProm } = require('../_shared/prom')

if (!process.env.ENCRYPTION_KEY) {
  throw new Error('No ENCRYPTION_KEY provided! Exiting!')
}

let shuttingDown = false

server.use(cacheControl.nocache)
server.use(function shuttingDownHandler(
  _req /*: express$Request */,
  res /*: express$Response */,
  next /*: express$NextFunction */
) {
  if (shuttingDown) {
    logger.warn('Got request while shutting down')
    return res.sendStatus(503)
  } else {
    next()
  }
})

const release = getRelease()
const releaseHash = release.substr(0, 7)
const redisGame = redis('GAME')

function healthCheckHandler(req /*: express$Request */, res /*: express$Response */) {
  // Note that internal liveliness tests do not respect cache headers
  // This header is for external access to the /health endpoint via CDN
  // IE: Do not check the backend health more often than this from the internet
  if (shuttingDown) {
    return res.sendStatus(503)
  } else if (
    (redisGame.ready || redisGame.status === 'ready')
  ) {
    res.setHeader('Cache-Control', 'public, max-age=15')
    return res.send(`${releaseHash} ${new Date().toString()}`)
  } else {
    logger.error('Redis connections not ready:', {
      redisGame: redisGame.ready
    })
    return res.sendStatus(503)
  }
}

server.get('/health', healthCheckHandler)
server.get('/healthz', healthCheckHandler)
server.get('/', (req /*: express$Request */, res /*: express$Response */) => {
  res.setHeader('Cache-Control', 'max-age=60, max-stale=60')
  return res.sendStatus(200)
})

// Must come last!
server.use(serverErrorHandler)

async function MatchMaker() {
  initProm()
  await Promise.all([ redisGame.ping() ])
  listenHttps(API_LISTEN_PORT, err => {
    if (err) {
      logger.error('httpsServer failed to listen', { API_LISTEN_PORT, errMsg: err.message })
      throw err
    }
    logger.info('MatchMaker ready!', { release })
  })
}

exitHook(callback => {
  if (process.env.EXIT_IMMEDIATE) return callback()
  shuttingDown = true
  logger.info(`MatchMaker Shutting down in ${API_SHUTDOWN_TIMEOUT}ms`)
  setTimeout(async () => {
    await Promise.all([redisGame.quit()])
    callback()
  }, API_SHUTDOWN_TIMEOUT)
})

module.exports = MatchMaker
