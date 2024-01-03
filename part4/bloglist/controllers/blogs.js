const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { AccessDeniedError, PageNotFoundError }  = require('../utils/errors')

const validateUser = async (blogId, request) => {
  const user = request.user
  if (! user ) {
    throw new AccessDeniedError('Access denied')
  }
  const blog = await Blog.findById(blogId)
  if (!blog) {
    throw new PageNotFoundError('Blog not found')
  }
  if (!user._id.equals(blog.user)) {
    throw new AccessDeniedError('Access denied')
  }
  return { user, blog }
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { name: 1, username:1, id:1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const user = request.user
  if (!user ) {
    throw new AccessDeniedError('Access denied')
  }

  const body = request.body

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
  const { blog } = await validateUser(request.params.id, request)
  const body = request.body
  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: blog.user
  }
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    newBlog,
    { new: true, runValidators: true, context: 'query' }
  ).populate('user', { username: 1, name: 1, id:1 })
  if (!updatedBlog) {
    throw new PageNotFoundError('Blog not found')
  }
  response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { user, blog } = await validateUser(request.params.id, request, response)
  const deleted = await Blog.findByIdAndDelete(request.params.id)
  if (!deleted) {
    throw new PageNotFoundError('Blog not found')
  }
  user.blogs = user.blogs.filter(b => ! b._id.equals(blog._id))
  await user.save()
  response.status(204).end()
})

module.exports = blogsRouter