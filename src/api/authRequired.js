// @flow

/* flow-include import express from 'express' */

const logger = require('../_shared/logger')

module.exports = function authRequired(
  req /*: express$Request */,
  res /*: express$Response */,
  next /*: express$NextFunction */
) {
  // $FlowIssue (added by PassportJS)
  if (req.isAuthenticated() && typeof req.user === 'object' && req.user.username) {
    next()
  } else {
    logger.debug('Unauthenticated request!')
    res.sendStatus(401)
  }
}
