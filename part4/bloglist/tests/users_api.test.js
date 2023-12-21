const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('When database already contains a user', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('Salasana123', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('Can create user with valid data', async () => {
    const initialUsers = await helper.usersInDb()

    const newUser = {
      username: 'kilroy',
      name: 'Was Here',
      password: 'RoyRoy'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(initialUsers.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('Can not create user with existing username', async () => {
    const initialUsers = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Was Here',
      password: 'RoyRoy'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('validation failed')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(initialUsers)
  })

  test('Can not create user with too short username', async () => {
    const initialUsers = await helper.usersInDb()

    const newUser = {
      username: 'ki',
      name: 'Was Here',
      password: 'RoyRoy'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('validation failed')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(initialUsers)
  })

  test('Can not create user with too short password', async () => {
    const initialUsers = await helper.usersInDb()

    const newUser = {
      username: 'kilroy',
      name: 'Was Here',
      password: 'Ro'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('Password must be')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(initialUsers)
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})