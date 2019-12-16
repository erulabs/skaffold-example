// @flow

const { getRelease } = require('./node')
const { parseUris } = require('../lib/helpers')
const release = getRelease().substr(0, 7)

const APP_ENV = process.env.APP_ENV || 'local'
const LOGGING_LABEL = process.env.LOGGING_LABEL || 'unlabeled'

let EMAIL_ADDRESSES_DEV /*: Array<string> */ = []
if (process.env.EMAIL_ADDRESSES_DEV) {
  EMAIL_ADDRESSES_DEV = process.env.EMAIL_ADDRESSES_DEV.split(',').map(email => email.trim())
}

const config = {
  // HTTPS Server configuration
  TLS_KEY_PATH: process.env.TLS_KEY_PATH || `${process.cwd()}/../inf/secrets/selfsigned.key.pem`,
  TLS_CERT_PATH: process.env.TLS_CERT_PATH || `${process.cwd()}/../inf/secrets/selfsigned.crt.pem`,
  TLS_CHAIN_PATH: process.env.TLS_CHAIN_PATH,
  API_CORS_ALLOWED_ORIGINS: process.env.API_CORS_ALLOWED_ORIGINS || '',
  // HTTPS Access logging format
  LOG_FORMAT: `{"type":"ACCESS","date":":date[iso]","addr":":remote-addr","status"::status,"method":":method","path":":url","responseTime"::response-time,"length"::res[content-length],"user":":userId","agent":":user-agent","app":"${LOGGING_LABEL}","env":"${APP_ENV}","release":"${release}"}`,

  API_LISTEN_PORT: parseInt(process.env.API_LISTEN_PORT, 10) || 4000,

  METRICS_LISTEN_PORT: process.env.METRICS_LISTEN_PORT || '5000',

  // Logging configuration
  LOG_FILE: process.env.LOG_FILE,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOGGING_LABEL,
  APP_ENV,

  WWW_TARGET: process.env.WWW_TARGET || 'https://localhost:3000',
  API_TARGET: process.env.API_TARGET || 'https://localhost:4000',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',

  // Session config
  // Login sessions and OAUTH credentials
  SESSION_LIFETIME: parseInt(process.env.SESSION_LIFETIME, 10) || 86400 * 30,
  SESSION_SECRET: process.env.SESSION_SECRET || 'some_dev_secret',
  SESSION_KEY: 'sid',

  // Redis configuration
  REDIS_GAME_SERVERS: parseUris(process.env.REDIS_GAME_URIS || 'redis:6379'),
  REDIS_SESSION_SERVERS: parseUris(process.env.REDIS_SESSION_URIS || 'redis:6379'),

  // Email config
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM_ADDR: process.env.EMAIL_FROM_ADDR || 'donotreply@fake.com',
  EMAIL_ADDRESSES_DEV:
    EMAIL_ADDRESSES_DEV.length > 0 ? EMAIL_ADDRESSES_DEV : ['seandonmooy@gmail.com'],

  API_SHUTDOWN_TIMEOUT: parseInt(process.env.API_SHUTDOWN_TIMEOUT, 10) || 10
}

if (process.env.NODE_ENV === 'development') {
  config.LOG_FORMAT =
    ':date[iso] :method :url :status :response-time user=:userId'
}

module.exports = config
