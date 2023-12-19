const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
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

    expect(response.body).toHaveLength(3)
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
    await api
      .post('/api/blogs')
      .send(newEntry)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.length).toBe(initialNoteCount + 1)

    const titles = blogsInDb.map(blog => blog.title)
    expect(titles).toContain('A New Start')
  })

  test('when likes is missing, sets default value', async () => {
    const entry = {
      title: 'How To Cut Onions',
      author: 'R. U. Sharp',
      url: 'http://127.0.0.1/tor'
    }

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
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

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
    
    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.find(blog => blog.id === blogToDelete.id)).not.toBeDefined()
  })

  test('With invalid ID fails (bad request)', async () => {
    await api
      .delete('/api/blogs/BAD_ID')
      .expect(400)
  })

  test('With nonexistent ID fails (not found)', async () => {
    const noSuchId = await helper.nonexistentId()
    await api
      .delete(`/api/blogs/${noSuchId}`)
      .expect(404)
  })

})

describe('Updating a blog entry', () => {

  test('Updating likes works', async () => {
    const blogsInDb = await helper.blogsInDb();
    const blogToUpdate = blogsInDb[1];
    const originalLikes = blogToUpdate.likes;
    const newBlog = {...blogToUpdate, likes: originalLikes + 99}

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body).toEqual(newBlog)

    const blogsNowInDb = await helper.blogsInDb();
    const updatedBlog = blogsNowInDb.find(b => b.id === blogToUpdate.id)
    expect(updatedBlog).toEqual(newBlog)
  })

  test('With invalid ID fails (bad request)', async () => {
    const blog = {title: 'foo', author: 'bar', url: 'foobar'}
    await api
      .put('/api/blogs/BAD_ID')
      .send(blog)
      .expect(400)
  })

  test('With nonexistent ID fails (not found)', async () => {
    const blog = {title: 'foo', author: 'bar', url: 'foobar'}
    const noSuchId = await helper.nonexistentId()
    await api
      .put(`/api/blogs/${noSuchId}`)
      .send(blog)
      .expect(404)
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})