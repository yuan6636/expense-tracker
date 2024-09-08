const chai = require('chai')
const should = chai.should()
const sinon = require('sinon')

const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')
const helper = require('../helpers/auth-helper')

let mockRecordData = [{
    id: 1,
    name: '餐費',
    date: '2024/05/08',
    amount: 300,
    totalAmount: 300,
    categoryId: 1,
    userId: 1
}]

let mockCategoryData = [{
    id: 1,
    name: '餐飲食品'
}]

const authenticate = (path, method, result) => {
    return sinon.stub(path, method).returns(result)
}

describe('# record-controller', () => {
  beforeEach(() => {
    this.ensureAuthenticated = authenticate(helper, 'ensureAuthenticated', true)
    this.getUser = authenticate(helper, 'getUser', { id: 1 })
  })

  afterEach(() => {
    // 清除驗證資料
    this.ensureAuthenticated.restore()
    this.getUser.restore()
  })

  context('# 渲染頁面測試', () => {
    // 前置準備
    before(() => {
      this.RecordMock = createModelMock('Record', mockRecordData)

      this.CategoryMock = createModelMock('Category', mockCategoryData)

      this.recordController = createControllerProxy('../controllers/record-controller', {
        Record: this.RecordMock,
        Category: this.CategoryMock
      })
    })
    it('#1 [渲染頁面測試](成功): GET /records', async () => {
      const req = mockRequest({
        query: { categoryId: 1, limit: 1, page: 1 },
        user: { id: 1 }
      })
      const res = mockResponse()
      const next = mockNext

      await this.recordController.getRecords(req, res, next)

      res.render.getCall(0).args[0].should.equal('records')

      // 檢查 res.render 傳入的參數是否正確
      // 因為 sequelize.mock 沒有子查詢的方法，直接在 RecordMock 的屬性上附註結果
      res.render.firstCall.args[1].records[0].name.should.equal('餐費')
      res.render.firstCall.args[1].totalAmount.should.equal(300)
      res.render.firstCall.args[1].categories[0].id.should.equal(1)
      res.render.firstCall.args[1].categoryId.should.equal(req.query.categoryId)
      res.render.firstCall.args[1].pagination.should.be.a('object')
    })

    it('#2 [渲染頁面測試](失敗): GET /records', async () => {
      const req = mockRequest({
        query: { categoryId: 1, limit: 1, page: 1 },
        user: { id: 1 }
      })
      const res = mockResponse()
      const next = mockNext

      sinon.stub(this.RecordMock, 'findAndCountAll').rejects(new Error('DB Error'))

      await this.recordController.getRecords(req, res, next)

      // 測試是否呼叫 res.status 和 res.json 方法，res.status 的參數是 422
      res.status.calledWith(422).should.be.true
      res.json.calledOnce.should.be.true
    })
  })

  context('# 渲染建立支出頁', () => {
    // 前置準備
    before(() => {

      this.CategoryMock = createModelMock('Category', mockCategoryData)

      this.recordController = createControllerProxy('../controllers/record-controller', {
        Category: this.CategoryMock
      })
    })
    it('# [渲染建立支出頁]: GET /records/create', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const next = mockNext

      await this.recordController.createRecord(req, res, next)
      
      // 檢查 res.render 的參數是否有傳入需要的 data
      res.render.getCall(0).args[0].should.equal('create-record')
      res.render.getCall(0).args[1].categories[0].name.should.equal('餐飲食品')
    })
  })

  context('# 渲染支出編輯頁', () => {
    // 前置準備
    before(() => {
      this.RecordMock = createModelMock('Record', mockRecordData)

      this.CategoryMock = createModelMock('Category', mockCategoryData)

      this.recordController = createControllerProxy('../controllers/record-controller', {
        Record: this.RecordMock,
        Category: this.CategoryMock
      })
    })
    it('# [渲染支出編輯頁]: GET /records/:id/edit', async () => {
      const req = mockRequest({ params: { id: 1 } })
      const res = mockResponse()
      const next = mockNext

      await this.recordController.editRecord(req, res, next)

      res.render.getCall(0).args[0].should.equal('edit-record')
      
      // 測試 res.render 傳入的第二個參數是否有 CategoryMock 和 RecordMock 的資料
      res.render.getCall(0).args[1].categories[0].name.should.equal('餐飲食品')
      res.render.getCall(0).args[1].record.name.should.equal('餐費')
    })
  })

  context('# 新增/刪除 支出測試', () => {
    // 前置準備
    before(() => {
      this.RecordMock = createModelMock('Record', [])

      this.recordController = createControllerProxy('../controllers/record-controller', {
        Record: this.RecordMock
      })
    })
    it('# [新增支出測試]: POST /records', async () => {
      const req = mockRequest({
        body: {
          name: '排骨便當',
          date: '2024/05/08',
          amount: 100,
          categoryId: 1
        },
        user: { id: 1 }
      })
      const res = mockResponse()
      const next = mockNext

      await this.recordController.postRecord(req, res, next)
      const record = await this.RecordMock.findAll()

      // 應該要查出一筆支出紀錄
      // 支出紀錄中，第一筆資料的名字應該是排骨便當
      record.should.have.lengthOf(1)
      record[0].name.should.equal('排骨便當')

      req.flash.calledWith('success_messages', '成功建立一筆支出！').should.be.true
      res.redirect.calledWith('/records').should.be.true
    })
    it('# [刪除支出測試]: DELETE /records/:id', async () => {
      const req = mockRequest({ params: { id: 1 } })
      const res = mockResponse()
      const next = mockNext

      await this.recordController.deleteRecord(req, res, next)
      await this.RecordMock.destroy({ where: { id: 1 } })
      const records = await this.RecordMock.findAll()

      // 刪除後，this.RecordMock 內部沒有資料，陣列長度為 0
      records.should.have.lengthOf(0)

      req.flash.calledWith('success_messages', '成功刪除一筆支出！').should.be.true
      res.redirect.calledWith('/records').should.be.true
    })
  })

  context('# 修改支出測試', () => {
    before(() => {
      this.RecordMock = createModelMock('Record', mockRecordData)

      this.recordController = createControllerProxy('../controllers/record-controller', {
        Record: this.RecordMock
      })
    })
    it('# [修改支出測試]: PUT /records/:id', async() => {
      const req = mockRequest({
        body: {
          name: '三餐費用',
          date: '2024/05/08',
          amount: 300,
          categoryId: 1
        },
        params: { id: 1 }
      })
      const res = mockResponse()
      const next = mockNext

      await this.recordController.putRecord(req, res, next)

      const record = await this.RecordMock.findOne({ where: { id: 1 } })
      // 修改後的支出名稱應為'三餐費用'
      record.name.should.equal('三餐費用')
      
      req.flash.calledWith('success_messages', '成功修改一筆支出！').should.be.true
      res.redirect.calledWith('/records')
    })
  })
})