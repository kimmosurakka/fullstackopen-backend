const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  })

  const result = await blog.save()
  response.status(201).json(result)
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