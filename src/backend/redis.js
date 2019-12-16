// @flow

const Redis = require('ioredis')
const {
  REDIS_RATELIMIT_SERVERS,
  REDIS_CACHE_SERVERS,
  REDIS_EVENTS_SERVERS,
  REDIS_SESSION_SERVERS
} = require('./config')

/* flow-include
type redisTargets = 'RATELIMIT'|'CLUSTERSTATE'|'SESSION'|'CACHE'|'PUB'|'SUB'
*/

const redisOptions = {}

const redises = {
  RATELIMIT: { handle: undefined, servers: REDIS_RATELIMIT_SERVERS },
  CLUSTERSTATE: { handle: undefined, servers: REDIS_CACHE_SERVERS },
  SESSION: { handle: undefined, servers: REDIS_SESSION_SERVERS },
  CACHE: { handle: undefined, servers: REDIS_CACHE_SERVERS },
  PUB: { handle: undefined, servers: REDIS_EVENTS_SERVERS },
  SUB: { handle: undefined, servers: REDIS_EVENTS_SERVERS }
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
