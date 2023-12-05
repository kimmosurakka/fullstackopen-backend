require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')

const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})