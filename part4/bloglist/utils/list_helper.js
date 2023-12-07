const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((a, b) => a + b.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((a, b) => a?.likes > b?.likes ? a : b, undefined)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}