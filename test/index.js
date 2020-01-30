const { KoaBestValidator } = require('../src/index')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

app.use(bodyParser())

/**
 * 获取用户信息的Validator
 */
class PersonValidator extends KoaBestValidator {
  constructor() {
    super()
    this.descriptor = {
      name: [
        { type: "string", required: true },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
      ],
      age: [
        {
          required: true, type: 'number', message: 'is error', validator: (rule, value) => {
            return value > 10
          }
        }
      ],
      grade: [
        {
          validator: (rule, value, callback) => {
            if (value) {
              callback()
            } else {
              callback(new Error('必填啊'))
            }
          }
        }
      ]
    };
  }
}



/**
 * 注册验证
 */
class RegistryValidator extends KoaBestValidator {
  constructor() {
    super()
    this.descriptor = {
      username: [
        {
          type: "string",
          required: true
        }
      ],
      passwd1: [
        {
          //自定义验证规则
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('请输入密码'))
            } else {
              cb()
            }
          }
        }
      ],
      passwd2: [
        {
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('请再次输入密码'))
            } else {
              //获取某一个字段
              const passwd1 = this.findParam('passwd1').value
              if (value !== passwd1) {
                cb(new Error('两次输入密码不一致!'));
              } else {
                cb();
              }
            }
          }
        }
      ]
    }
  }
}




router.get('/api/getuserinfo', async (ctx, next) => {
  const v = await (new PersonValidator()).validate(ctx)
  console.log(v);
  ctx.body = {
    code: 'success'
  }
})


router.post('/api/registry', async (ctx, next) => {
  const v = await (new RegistryValidator()).validate(ctx)
  ctx.body = {
    code: 'success'
  }
})
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3001)

