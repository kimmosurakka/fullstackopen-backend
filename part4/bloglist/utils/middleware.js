const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')
const { AccessDeniedError } = require('../utils/errors')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:', request.path)
  logger.info('Body:', request.body)
  logger.info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  try {
    if (request.token) {
      const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)
      if (!decodedToken.id) {
        throw new jwt.JsonWebTokenError('Invalid token')
      }
      const user = await User.findById(decodedToken.id)
      if (!user) {
        throw new AccessDeniedError('Invalid user')
      }
      request.user = user
    }
    next()
  }
  catch(error) {
    next(error)
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError' || error.name === 'TypeError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError' || error.name === 'AccessDeniedError') {
    return response.status(401).json({ error: error.message })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token expired' })
  } else if (error.name === 'PageNotFoundError') {
    return response.status(404).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  errorHandler,
  requestLogger,
  tokenExtractor,
  userExtractor,
  unknownEndpoint
}