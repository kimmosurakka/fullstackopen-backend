const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { name: 1, username:1, id:1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({})

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  await savedBlog.populate('user', { name: 1, username: 1, id:1 })
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = await User.findOne({})
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  }
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blog,
    { new: true, runValidators: true, context: 'query' }
  ).populate('user', { username: 1, name: 1, id:1 })
  if (!updatedBlog) {
    response.status(404).end()
  } else {
    // Probably should also remove from previous user
    if (!user.blogs.includes(updatedBlog._id)) {
      user.blogs = user.blogs.concat(updatedBlog._id)
      await user.save()
    }
    response.json(updatedBlog)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const deleted = await Blog.findByIdAndDelete(request.params.id)
  if (!deleted) {
    response.status(404).end()
  } else {
    response.status(204).end()
  }
})

module.exports = blogsRouter