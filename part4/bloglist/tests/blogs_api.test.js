const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'My first blog entry',
    author: 'Rob',
    url: 'http://foo.bar/1',
    likes: 0
  },
  {
    title: 'Why are there no followers?',
    author: 'Rob',
    url: 'http://foo.bar/2',
    likes: 0
  },
  {
    title: 'I quit this thing',
    author: 'Rob',
    url: 'http://foo.bar/3',
    likes: 10
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  const promises = initialBlogs
    .map(blog => new Blog(blog))
    .map(blog => blog.save())
    
  await Promise.all(promises)
})

test('returns blogs as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('returns correct amount of blogs', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(3)
})

afterAll(async () => {
  await mongoose.connection.close()
})