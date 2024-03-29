const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialUsers = [
  {
    username: 'admin',
    name: 'Administrator',
    password: 'dummyPass',
  },
  {
    username: 'secretary',
    name: 'Secretary',
    password: 'secretWord',
  }
]

const createDummyUsers = async () => {
  await User.deleteMany({})
  const saltRounds = 10
  const users = await Promise.all(
    initialUsers.map(async u => ({
      username: u.username,
      name: u.name,
      blogs: [],
      passwordHash: await bcrypt.hash(u.password, saltRounds)
    }))
  )
  await User.insertMany(users)
  return await User.find({})
}

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

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { id:1, name:1, username:1 })
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const nonexistentId = async () => {
  const tempBlog = { title: 'temp', author: 'temp', url: 'temp', likes: 0 }
  const blogObject = new Blog(tempBlog)
  await blogObject.save()
  await blogObject.deleteOne()
  return blogObject._id.toString()
}

module.exports = {
  createDummyUsers,
  initialBlogs,
  blogsInDb,
  usersInDb,
  nonexistentId
}