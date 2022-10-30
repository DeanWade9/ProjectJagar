// const koa = require('koa')
// const path = require('path')
import koa from 'koa'
import path from 'path'
const app = new koa()
// const helmet = require('koa-helmet')
// const statics = require('koa-static')
import helmet from 'koa-helmet'
import statics from 'koa-static'

console.log('1111')

app.use(helmet())
app.use(statics(path.join(__dirname, '../public')))

app.listen(8989, () => {
  console.log('running at port 8989...')
})
