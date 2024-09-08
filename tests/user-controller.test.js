const request = require('supertest')
const chai = require('chai')
const should = chai.should()
const sinon = require('sinon')

const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')
const app = require('../app')
const helper = require('../helpers/auth-helper')

// 測試所有 userController 邏輯是否正確 
describe('# user-controller', () => {
  context('# 渲染頁面測試', () => {
    // 前置準備
    before(async () => {
      this.UserMock = createModelMock('User', [])

      this.userController = createControllerProxy('../controllers/user-controller', { User: this.UserMock })
    })
    // 驗證是否能渲染註冊頁面
    it('#1 GET /signup', () => {
      const req = mockRequest()
      const res = mockResponse()

      this.userController.signUpPage(req, res)

      res.render.calledWith('signup').should.be.true
    })

    // 驗證是否能渲染登入頁面
    it('#2 GET /signin', () => {
      const req = mockRequest()
      const res = mockResponse()

      this.userController.signInPage(req, res)

      res.render.calledWith('signin').should.be.true
    })
  })

  context('# 註冊使用者測試: POST /signup', () => {
    // 前置準備
    before(async () => {
      this.UserMock = createModelMock('User', [])

      this.userController = createControllerProxy('../controllers/user-controller', { User: this.UserMock })
    })
    it('# 註冊成功', async () => {
      const req = mockRequest({ body: {
        name: 'user1', 
        email: 'user1@example.com', 
        password: '12345678', 
        passwordCheck: '12345678' 
      }})
      const res = mockResponse()
      const next = mockNext

      await this.userController.signUp(req, res, next)
      
      // 重新從 UserMock 查詢 user 資料，判斷是否 user 資料是否存在
      const user = await this.UserMock.findOne({ where: { email: 'user1@example.com' }})
      user.email.should.equal('user1@example.com')

      req.flash.calledWith('success_messages', '註冊成功!').should.be.true
      res.redirect.calledWith('/signin').should.be.true
    })
  })

  context('# 登入測試： POST /signin', () => {
    // 前置準備
    before(async () => {
      this.UserMock = createModelMock('User', [{
        id: 1,
        name: 'user1',
        email: 'user1@example.com',
        password: '12345678'
      }])

      this.userController = createControllerProxy('../controllers/user-controller', { User: this.UserMock })
    })
    // 驗證輸入錯誤密碼時，是否會轉址到 /signin
    it('#1 密碼錯誤', (done) => {
      request(app)
        .post('/signin')
        .type('form')
        .send({
          email: 'user1@example.com',
          password: 123
        })
        .expect('Location', '/signin') //驗證 response header 的 Location 是否為 /signin
        .expect(302)
        .end((err) => {
          if (err) {
            done(err)
          } else {
            done()
          }
        })
    })

    // 驗證輸入錯誤帳號時，是否會轉址到 /signin
    it('#2 帳號錯誤', (done) => {
      request(app)
        .post('/signin')
        .type('form')
        .send({
          email: 'XXX@example.com',
          password: 12345678,
        })
        .expect('Location', '/signin')
        .expect(302)
        .end((err) => {
          if (err) {
            done(err)
          } else {
            done()
          }
        })
    })

    // 驗證成功登入時，是否會轉址到 /records
    it('#3 登入成功', (done) => {
      request(app)
        .post('/signin')
        .type('form')
        .send({
          email: 'user1@example.com',
          password: 12345678
        })
        .expect('Location', '/records')
        .expect(302)
        .end((err) => {
          if (err) {
            done(err)
          } else {
            done()
          }
        })
    })
  })

  context('# 登出測試:', () => {
    before(() => {
      // 模擬通過驗證的狀態
      this.ensureAuthenticated = sinon
        .stub(helper, 'ensureAuthenticated')
        .returns(true)
      
      this.UserMock = createModelMock('User', [])

      this.userController = createControllerProxy('../controllers/user-controller', { User: this.UserMock })
    })

    it('# GET /logout', async () => {
      const req = mockRequest()
      const res = mockResponse()  

      await this.userController.logout(req, res)

      req.flash.calledWith('success_messages', '成功登出!').should.be.true
      req.logout.called.should.be.true
      res.redirect.calledWith('/signin').should.be.true
    })

    after(async () => {
      // 清除驗證過的資料
      this.ensureAuthenticated.restore()
    })
  })
})