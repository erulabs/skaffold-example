// @flow

const Redis = require('ioredis')
const {
  REDIS_GAME_SERVERS,
  REDIS_SESSION_SERVERS
} = require('./config')

/* flow-include
type redisTargets = 'SESSION'|'GAME'
*/

const redisOptions = {}

const redises = {
  SESSION: { handle: undefined, servers: REDIS_SESSION_SERVERS },
  GAME: { handle: undefined, servers: REDIS_GAME_SERVERS }
}

module.exports = function redis(target /*: redisTargets */, forceNew /*: boolean */ = false) {
  if (!redises[target]) throw new Error(`No such redis "${target}" defined!`)
  if (redises[target].handle && !forceNew) return redises[target].handle
  else {
    let handle
    if (redises[target].servers.length > 1) {
      handle = new Redis.Cluster(redises[target].servers, { redisOptions })
    } else if (redises[target].servers.length === 1) {
      handle = Redis.createClient(
        redises[target].servers[0].port,
        redises[target].servers[0].host,
        redisOptions
      )
    } else {
      // Dummy, for testing - errors on use
      handle = new Redis({
        lazyConnect: true,
        enableOfflineQueue: false,
        reconnectOnError: () => false
      })
    }
    if (forceNew) return handle
    else {
      redises[target].handle = handle
      return redises[target].handle
    }
  }
}
