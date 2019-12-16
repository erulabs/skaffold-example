// @flow

const authRequired = require('./authRequired')
const { passport } = require('../_shared/passport')
const logger = require('../_shared/logger')

// const { cacheControl } = require('./../_shared/server')
const asyncMiddleware = fn => {
  return (req /*: express$Request */, res /*: express$Response */, next /*: express$NextFunction */) => {
    Promise.resolve(fn(req, res)).catch(next)
  }
}

function _debugMiddleware (req /*: express$Request */, res /*: express$Response */, next /*: express$NextFunction */) {
  logger.warn('Debug Middleware', { body: req.body, headers: req.headers })
  next()
}

function configureAppRoutes (server /*: Object */) {
  // Foo
}

module.exports = { configureAppRoutes }
