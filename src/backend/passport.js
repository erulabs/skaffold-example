// @flow

/* flow-include import express from 'express' */

const passport = require('passport')
const { BasicStrategy } = require('passport-http')
const passportSocketIo = require('passport.socketio')
const logger = require('./logger')

// Authenticates APIs keys based on their association - ie: key an api key for a user or repo
passport.use(
  new BasicStrategy(async function(key, secret, done) {
    let dbApiKey
    try {
      dbApiKey = await ApiKeyModel.findOne({ where: { key }, include: [UserModel, RepoModel] })
      if (!dbApiKey || dbApiKey.secret() !== secret) {
        logger.debug('API BasicStrategy dbApiKey not found')
        return done(null, null)
      }
    } catch (err) {
      logger.error('passport BasicStrategy() error', { key, errMsg: err.message })
      return done(err, null)
    }

    const authObj = {
      user: dbApiKey.user && dbApiKey.user.get({ plain: true }),
      repo: dbApiKey.repo && dbApiKey.repo.get({ plain: true })
    }

    done(null, authObj)
  })
)

// We simply pass the user object around as a serialized token
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// And then decode it by... passing it.
passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findOne({
    where: { id },
    include: {
      model: NamespaceModel,
      include: [DomainModel, ClusterModel]
    }
  })

  if (!user) {
    done(null, null)
  } else {
    done(null, user.get({ plain: true }))
  }
})

module.exports = { passport, passportSocketIo }
