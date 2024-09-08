const request = require('supertest')
const app = require('../app')

describe('# 測試環境初始化', () => {
  context('# 第一次測試', () => {
    it (' GET /signin', (done) => {
      request(app)
        .get('/signin')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })
  })
})