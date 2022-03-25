const mongoose = require('mongoose')

const listPersons = (personModel) => {
  return personModel
    .find({})
    .then(results => {
      console.log('phonebook:')
      results.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
    })
}

const addPerson = (personModel, name, number) => {
  const person = new personModel({name, number })
  return person
    .save()
    .then(result => {
      console.log('Person saved.')
    })
}

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.ojscm.mongodb.net/puhelimet?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 5) {
  addPerson(Person, process.argv[3], process.argv[4])
    .then(() => mongoose.connection.close())
} else {
  listPersons(Person)
    .then(() => mongoose.connection.close())
}
