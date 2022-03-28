require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

morgan.token('request-body', (req, rest) =>
  req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : undefined
)

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))

const PORT = process.env.PORT || 3001

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name not given'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number not given'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }  
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name not given'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number not given'
    })
  }

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }  
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(query => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.count()
    .then(number => {
      response.send(
        `<p>Phonebook has info for ${number} people.<p>${new Date()}`)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})