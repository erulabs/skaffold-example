// @flow

const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const timeout = require('connect-timeout')
const expressSession = require('express-session')
const socketIO = require('socket.io')
const RedisSessionStore = require('connect-redis')(expressSession)
const socketIoRedis = require('socket.io-redis')
const morgan = require('morgan')
const helmet = require('helmet')

const logger = require('./logger')
const { passport, passportSocketIo } = require('./passport')
const {
  LOG_FORMAT,
  API_CORS_ALLOWED_ORIGINS,
  TLS_KEY_PATH,
  TLS_CERT_PATH,
  TLS_CHAIN_PATH,
  REDIS_SESSION_SERVERS,
  SESSION_SECRET,
  SESSION_LIFETIME,
  SESSION_KEY,
  COOKIE_DOMAIN
} = require('./config')
const redis = require('./redis')

const server = express()
server.use(bodyParser.urlencoded({ extended: false }))
const bodyParserRaw = bodyParser.raw({ type: '*/*' })
const bodyParserJson = bodyParser.json()

server.use(timeout(30000))
// $FlowIssue
server.use(cookieParser())
server.use((
  req /*: express$Request */,
  res /*: express$Response */,
  next /*: express$NextFunction */
) => {
  req.path === '/stripe-webhook' || req.get('content-type') === 'text/plain'
    ? bodyParserRaw(req, res, next)
    : bodyParserJson(req, res, next)
})
server.use(compression())

let ca
if (TLS_CHAIN_PATH && fs.existsSync(TLS_CHAIN_PATH)) ca = TLS_CHAIN_PATH // eslint-disable-line

const httpsServer = https.createServer(
  {
    key: fs.readFileSync(TLS_KEY_PATH), // eslint-disable-line
    cert: fs.readFileSync(TLS_CERT_PATH), // eslint-disable-line
    ca: ca,
    honorCipherOrder: true
  },
  // $FlowIssue
  server
)

function getRealIp(req /*: express$Request */) {
  let realIp =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    (req.connection && req.connection.remoteAddress) ||
    // $FlowIssue
    req.address // for websocket
  // Some proxies will append a list of ip addresses - the "remote ip" is the first in the list
  if (realIp && realIp.indexOf(',') > -1) {
    realIp = realIp.split(',')[0]
  }
  return realIp
}

const redisSessionStore = new RedisSessionStore({
  client: redis('SESSION')
})

// Don't spam the logs with health-check messages
function skipHealthCheckLogs(req, res) {
  return (req.path === '/health' || req.path === '/healthz') && res.statusCode === 200
}
server.use(morgan(LOG_FORMAT, { skip: skipHealthCheckLogs }))

const allowedOrigins = API_CORS_ALLOWED_ORIGINS.split(',')
server.use((
  req /*: express$Request */,
  res /*: express$Response */,
  next /*: express$NextFunction */
) => {
  const allowedCors = allowedOrigins.indexOf(req.headers.origin)
  if (allowedCors > -1) {
    res.header('Access-Control-Allow-Origin', allowedOrigins[allowedCors])
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
      'Access-Control-Allow-Headers',
      'content-type,x-commit-hash'
    )
  }
  res.header('X-Frame-Options', 'SAMEORIGIN')
  res.header('X-XSS-Protection', '1; mode=block')
  res.header('Referrer-Policy', 'same-origin')
  res.header('X-Content-Type-Options', 'nosniff')
  next()
})

server.use(
  expressSession({
    store: redisSessionStore,
    name: SESSION_KEY,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: COOKIE_DOMAIN,
      maxAge: SESSION_LIFETIME * 1000,
      httpOnly: true,
      secure: true,
      rolling: true
    }
  })
)

// Authentication
server.use(passport.initialize())
server.use(passport.session())

server.get('/robots.txt', (req /*: express$Request */, res /*: express$Response */) => {
  res.setHeader('Cache-Control', 'public, max-age=604800')
  res.setHeader('Content-Type', 'text/plain')
  res.send('User-Agent: *\nDisallow: /\n')
})

server.disable('x-powered-by')

// Always send JSON parsable objects
server.use(function alwaysSendObjects(
  _req /*: express$Request */,
  res /*: express$Response */,
  next /*: express$NextFunction */
) {
  // $FlowIssue
  res.sendStatus = function(code) {
    res.status(code).send({})
  }
  next()
})

// Additional access logging tokens
morgan.token('remote-addr', getRealIp)
morgan.token('url', function(req) {
  return escape(req.path)
})
morgan.token('userId', function(req) {
  return (req.user && req.user.username) || '-'
})

if (process.env.NODE_ENV !== 'development') {
  server.use(
    helmet.hsts({
      maxAge: 31536000000, // One year
      includeSubDomains: true,
      force: true
    })
  )
}

function requireAccessToken(
  req /*: express$Request */,
  res /*: express$Response */,
  next /*: express$NextFunction */
) {
  const { accessToken } = req.cookies
  // Token validation rule is based on an assumption that GitHub's access token
  // length will remain around the same (currently 40 characters).
  if (!accessToken || !/^[a-f0-9]{20,255}$/.test(accessToken)) {
    logger.debug('401 - no_access_token', { accessToken })
    res.status(401).send({
      error: 'no_access_token',
      error_description: 'Your request did not include an access token'
    })
    return
  }

  next()
}

// Note that we _do not call_ next() - this -correctly- sends a 500 forward
// This should be considered a critical error that should _never_ be reached.
// If you are troubleshooting this code being reached in production by bad user input, then
// FIX WHATEVER CONTROLLER REACHED THIS HANDLER!!
// 500s should _never ever_ be a result of bad input, user error, or malicious behavior
// 500s mean _we had an issue_, and we _should never have issues_! :)
function serverErrorHandler(
  err /*: Error|number */,
  _req /*: express$Request */,
  res /*: express$Response */,
  _next /*: express$NextFunction */
) {
  if (typeof err === 'number' && err !== 500) {
    logger.error(`serverErrorHandler reached with err status of: ${err}`)
    return res.sendStatus(err)
    // $FlowIssue
  } else if (err.type === 'entity.parse.failed') {
    logger.warn('Got invalid JSON!', { err })
    return res.sendStatus(400)
  } else {
    const errObj = {}
    if (typeof err === 'number') errObj.code = err
    else {
      errObj.message = err.message
      errObj.stack = err.stack && err.stack.split('\n')
    }
    logger.error('Unhandled serverErrorHandler: ', errObj)
    if (!res.headersSent) {
      return res.sendStatus(500)
    }
  }
}

const webSocketServer = socketIO(httpsServer, {
  handlePreflightRequest: function(req, res) {
    var headers = {
      'Access-Control-Allow-Origin': API_CORS_ALLOWED_ORIGINS,
      'Access-Control-Allow-Credentials': true
    }
    res.writeHead(200, headers)
    res.end()
  },
  origins: '*:*'
  // TODO enable rate-limiting by turning on a CDN that can provide us with the user's real IP.
  // Currently disabled because the AWS network load balancer prevents us from seeing the user's real IP.
  // allowRequest: function (req, next) {
  //   const address = getRealIp(req)
  //   const socketConnLimit = new Limiter({
  //     db: redis('RATELIMIT'),
  //     id: `auth:${address}`,
  //     max: process.env.NODE_ENV === 'development' ? 1000 : 30,
  //     duration: 3600 * 1000 // 1h
  //   })

  //   socketConnLimit.get(function (err, limit) {
  //     if (err) {
  //       logger.error('Error getting ratelimit socketConnLimit', { errMsg: err.message })
  //       return
  //     }

  //     if (!limit.remaining) {
  //       logger.info('Address has reached the loginAttemptLimit', { address })
  //       next(429, false)
  //     } else if (req.secure === false) {
  //       logger.warn('Only secure connections are allowed, use HTTPS!')
  //       next(400, false)
  //     } else {
  //       logger.debug('socketConnectionHandler()', { address, user: req.user.id })
  //       next(null, true)
  //     }
  //   })
  // }
})

webSocketServer.origins('*:*')

webSocketServer.adapter(
  socketIoRedis({ host: REDIS_SESSION_SERVERS[0].host, port: REDIS_SESSION_SERVERS[0].port })
)

webSocketServer.use(function(socket, next) {
  passportSocketIo.authorize({
    key: SESSION_KEY,
    secret: SESSION_SECRET,
    store: redisSessionStore,
    passport: passport,
    cookieParser: cookieParser,
    success: (_data, accept) => {
      accept(null, true)
    },
    fail: (data, msg, error, accept) => {
      const address = getRealIp(socket.request)
      if (error) {
        logger.error(msg, { data, address })
      } else {
        logger.info('Failed authentication for websocket', { msg, address })
      }
      accept(null, false)
    }
  })(socket, next)
})

const cacheControl = {
  nocache: function(
    _req /*: express$Request */,
    res /*: express$Response */,
    next /*: express$NextFunction */
  ) {
    res.setHeader('Surrogate-Control', 'no-store')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    next()
  },
  private: function(
    _req /*: express$Request */,
    res /*: express$Response */,
    next /*: express$NextFunction */
  ) {
    res.setHeader('Surrogate-Control', 'no-store')
    res.setHeader('Cache-Control', 'private, must-revalidate, max-age=60, max-stale=60')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '60')
    next()
  }
}

let listeningHttps = false
function listenHttps(port /*: number */, callback /*: Function */) {
  if (listeningHttps) {
    callback()
  } else {
    listeningHttps = true
    httpsServer.listen(port, callback)
  }
}

module.exports = {
  listenHttps,
  cacheControl,
  redisSessionStore,
  webSocketServer,
  httpsServer,
  server,
  requireAccessToken,
  serverErrorHandler,
  getRealIp
}
