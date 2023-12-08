const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((a, b) => a + b.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((a, b) => a?.likes > b?.likes ? a : b, undefined)
}

const mostBlogs = (blogs) => {
  let counts = new Map()
  blogs.forEach(blog => {
    counts.set(blog.author, (counts.get(blog.author)||0) + 1)
  });
  const sorted = Array.from(counts, ([auth, count]) => {
    return {"author": auth, "blogs": count}
  }).sort((a,b) => b.blogs - a.blogs)
  return sorted[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}