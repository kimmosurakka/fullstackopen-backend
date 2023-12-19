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

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonexistentId = async () => {
  const tempBlog = { title: 'temp', author: 'temp', url: 'temp', likes: 0 }
  const blogObject = new Blog(tempBlog)
  await blogObject.save()
  await blogObject.deleteOne()
  return blogObject._id.toString()
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonexistentId
}