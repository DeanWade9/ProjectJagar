const Koa = require('koa')
const Router = require('@koa/router')
const cors = require('@koa/cors')
const {koaBody} = require('koa-body')
const json = require('koa-json')
const app = new Koa()
const router = new Router()

router.prefix('/api')

router.get('/', ctx => {
  console.log(ctx)
  ctx.body = 'hi dean!'
})

router.get('/api', ctx => {
  console.log(ctx)
  ctx.body = 'hi Api!'
})

router.get('/async', async (ctx) => {
  let result = await new Promise((resolve) => {
    setTimeout(() => {
      resolve('2s later')
    }, 2000)
  })
  ctx.body = result
})

router.post('/post', async (ctx) => {
  let { body } = ctx.request
  console.log(body)
  console.log(ctx.request)
  ctx.body = {
    ...body
  }
})

router.get('/about', ctx => {
  console.log(ctx.request.query)
  ctx.body = {
    ...ctx.request.query
  }
})

app.use(koaBody())
app.use(cors())
app.use(json({pretty: false, param: 'pretty'}))

app.use(router.routes())
  .use(router.allowedMethods())

app.listen(9240, () => {
  console.log('running...')
})