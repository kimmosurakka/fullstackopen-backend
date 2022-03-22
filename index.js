const express = require('express')
const morgan = require('morgan')

const app = express()

morgan.token('post-body', (req, rest) =>
  req.method === 'POST' ? JSON.stringify(req.body) : undefined
)

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

const PORT = 3001

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendick',
    number: '39-23-6423122'
  }
]

const generateId = () => {
  do {
    const id = Math.floor(Math.random() * 500000) + 1
    if (! persons.some(p => p.id === id)) {
      return id
    }
  } while (true)
}

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name not given'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number not given'
    })
  } else if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.status(201).json(person)
})

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people.<p>${new Date()}`
  )
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})