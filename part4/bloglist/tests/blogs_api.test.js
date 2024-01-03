process.env.JWT_SECRET = 'TestSecret'

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Blog = require('../models/blog')

const getToken = async(username, password) => {
  const response = await api
    .post('/api/login')
    .send({ username: username, password: password })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const body = response.body
  return body.token
}

beforeEach(async () => {
  await Blog.deleteMany({})
  const dummyUsers = await helper.createDummyUsers()
  const secretary = dummyUsers.find(user => user.username === 'secretary')
  const blogs = helper.initialBlogs.map(b => ({ ...b, user: secretary._id }) )
  await Blog.insertMany(blogs)
})

describe('Get all blogs', () => {
  test('returns blogs as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns correct amount of blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs have ID', async () => {
    const response = await api.get('/api/blogs')
    const a_blog = response.body[0]

    expect(a_blog.id).toBeDefined()
  })
})

describe('Post new blog', () => {
  test('can create new blog', async () => {
    const initialNoteCount = (await helper.blogsInDb()).length

    const newEntry = {
      title: 'A New Start',
      author: 'Edgar',
      url: 'http://go.to/start',
      likes: 1234
    }
    const token = await getToken('secretary', 'secretWord')
    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newEntry)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.length).toBe(initialNoteCount + 1)

    const titles = blogsInDb.map(blog => blog.title)
    expect(titles).toContain('A New Start')
  })

  test('can not create new blog if not logged in', async () => {
    const initialNoteCount = (await helper.blogsInDb()).length

    const newEntry = {
      title: 'A New Start',
      author: 'Edgar',
      url: 'http://go.to/start',
      likes: 1234
    }
    await api
      .post('/api/blogs')
      .send(newEntry)
      .expect(401)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.length).toBe(initialNoteCount)

    const titles = blogsInDb.map(blog => blog.title)
    expect(titles).not.toContain('A New Start')
  })

  test('when likes is missing, sets default value', async () => {
    const entry = {
      title: 'How To Cut Onions',
      author: 'R. U. Sharp',
      url: 'http://127.0.0.1/tor'
    }

    const token = await getToken('secretary', 'secretWord')
    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(entry)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDb = await helper.blogsInDb()
    const createdBlog = blogsInDb.find(blog => blog.title === 'How To Cut Onions')
    expect(createdBlog).toBeDefined()
    expect(createdBlog.likes).toBe(0)
  })

  test('when title is missing, fails with 400', async () => {
    const entry = {
      author: 'R. U. Sharp',
      url: 'http://127.0.0.1/tor'
    }

    const token = await getToken('secretary', 'secretWord')
    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(entry)
      .expect(400)

    const blogsInDb = await helper.blogsInDb()
    const createdBlog = blogsInDb.find(blog => blog.author === 'R. U. Sharp')
    expect(createdBlog).not.toBeDefined()
  })

  test('when url is missing, fails with 400', async () => {
    const entry = {
      title: 'How To Cut Onions',
      author: 'R. U. Sharp',
      likes: 10
    }

    const token = await getToken('secretary', 'secretWord')
    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(entry)
      .expect(400)

    const blogsInDb = await helper.blogsInDb()
    const createdBlog = blogsInDb.find(blog => blog.author === 'R. U. Sharp')
    expect(createdBlog).not.toBeDefined()
  })
})

describe('Deleting a blog entry', () => {

  test('With valid ID succeeds', async () => {
    const blogToDelete = (await helper.blogsInDb())[0]
    const token = await getToken('secretary', 'secretWord')
    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .auth(token, { type: 'bearer' })
      .expect(204)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.find(blog => blog.id === blogToDelete.id)).not.toBeDefined()
  })

  test('With wrong user ID fails', async () => {
    const blogToDelete = (await helper.blogsInDb())[0]
    const token = await getToken('admin', 'dummyPass')
    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .auth(token, { type: 'bearer' })
      .expect(401)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.find(blog => blog.id === blogToDelete.id)).toBeDefined()
  })

  test('With invalid ID fails (bad request)', async () => {
    const token = await getToken('secretary', 'secretWord')
    await api
      .delete('/api/blogs/BAD_ID')
      .auth(token, { type: 'bearer' })
      .expect(400)
  })

  test('With nonexistent ID fails (not found)', async () => {
    const noSuchId = await helper.nonexistentId()
    const token = await getToken('secretary', 'secretWord')
    await api
      .delete(`/api/blogs/${noSuchId}`)
      .auth(token, { type: 'bearer' })
      .expect(404)
  })

})

describe('Updating a blog entry', () => {

  test('Updating likes works', async () => {
    const blogsInDb = await helper.blogsInDb()
    const blogToUpdate = blogsInDb[1]
    const originalLikes = blogToUpdate.likes
    const newBlog = { ...blogToUpdate, likes: originalLikes + 99 }

    const token = await getToken('secretary', 'secretWord')
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body).toEqual(newBlog)

    const blogsNowInDb = await helper.blogsInDb()
    const updatedBlog = blogsNowInDb.find(b => b.id === blogToUpdate.id)
    expect(updatedBlog).toEqual(newBlog)
  })

  test('With invalid ID fails (bad request)', async () => {
    const blog = { title: 'foo', author: 'bar', url: 'foobar' }
    const token = await getToken('secretary', 'secretWord')
    await api
      .put('/api/blogs/BAD_ID')
      .auth(token, { type: 'bearer' })
      .send(blog)
      .expect(400)
  })

  test('With nonexistent ID fails (not found)', async () => {
    const blog = { title: 'foo', author: 'bar', url: 'foobar' }
    const noSuchId = await helper.nonexistentId()
    const token = await getToken('secretary', 'secretWord')
    await api
      .put(`/api/blogs/${noSuchId}`)
      .auth(token, { type: 'bearer' })
      .send(blog)
      .expect(404)
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})