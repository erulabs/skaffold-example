// @flow

// const { prom } = require('../_shared/prom')
const logger = require('../_shared/logger')
// const redis = require('../_shared/redis')
// const redisCache = redis('CACHE')
// const redisSub = redis('SUB')

module.exports = function socketConnectionHandler(socket /*: Socket */) {
  if (!socket.request.user) {
    return socket.disconnect()
  }
  const username = socket.request.user.username

  socket.on('error', err => {
    logger.warn('Socket error!', { username, errMsg: err.message, stack: err.stack })
  })

  socket.on('disconnect', function unbindSocket() {
    logger.silly('user unsubscribed from event stream', { username })
  })
}
