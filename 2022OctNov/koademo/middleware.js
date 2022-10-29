const Koa = require('koa')
const app = new Koa()

const middleware1 = async function (ctx, next) {
  console.log('this is a middleware1')
  console.log(ctx.request.path)
  next()
  console.log('middleware1 end')
}

const middleware2 = async function (ctx, next) {
  console.log('this is a middleware2')
  console.log(ctx.request.path)
  next()
  console.log('middleware2 end')
}

const middleware3 = async function (ctx, next) {
  console.log('this is a middleware3')
  console.log(ctx.request.path)
  next()
  console.log('middleware3 end')
}

app.use(middleware1)
app.use(middleware2)
app.use(middleware3)

app.listen(3000)