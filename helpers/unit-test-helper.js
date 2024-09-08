const SequelizeMock = require('sequelize-mock')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

// 模擬 sequelize model
const dbMock = new SequelizeMock() 

// 定義建立 dbMock 的方法
const createModelMock = (name, data, joinedTableName) => {
  const defaultValue = data[0]
  // 模擬 Sequelize Instances 中 Model 內建的方法
  const modelMock = dbMock.define(name, defaultValue, {
      instanceMethods: {
          update: async function (changes) {
            const objIndex = data.findIndex(d => d.id === this.get('id'))
            // 更新 data 中，和 model 相同 id 的資料
            data[objIndex] = {
              ...data[objIndex],
              ...changes
            }
            const ThisModel = dbMock.model(name)
            return ThisModel.build(data[objIndex])
          },
          destroy: async function () {
            data = data && data.filter(d => d.userId !== this.get('userId'))
          }
      }
  })

  // 模擬 Sequelize 行為
  // 因為 sequelize mock 的 create 方法有問題，將 create 方法轉向 upsert 方法
  modelMock.create = modelMock.upsert
  
  // 將 db 的 findByPk 使用 findOne 取代 (sequelize mock沒有 findByPk 的 query)
  modelMock.findByPk = id => modelMock.findOne({ where: { id } })

  // modify middleware
  modelMock.$queryInterface.$useHandler((query, queryOptions) => {
    if (query === 'upsert') {
       data.push(queryOptions[0])
       return Promise.resolve(modelMock.build(data))

    } else if (query === 'findAll') {
      if (!data) return modelMock.build(defaultValue)
      return Promise.resolve(data ? data.map(d => modelMock.build(d)) : [])
    
    } else if (query === 'findOne') {
      let item
      if (queryOptions[0].id) {
        item = data.find(d => d.id === queryOptions[0].id)
      } else {
        item = data.find(d => d.email === queryOptions[0].where.email)
      }
      if (!item) return null

      const result = modelMock.build(item)
      return Promise.resolve(result)
    } else if (query === 'findAndCountAll') {
      if (!data) return Promise.resolve({ count: 0, rows: [modelMock.build(defaultValue)] })

      return Promise.resolve({ count: data.length, rows: data.map(d => modelMock.build(d)) })
    } else if (query === 'destroy') {
        const { id } = queryOptions[0].where.id
        const filteredData = data.filter(d => d.id !== id)
        return Promise.resolve(modelMock.build(filteredData))
    }
  })
  return modelMock
}

// 模擬 controller，path 為 controller 的檔案路徑，切換依賴的模組
const createControllerProxy = (path, model) => {
  const controller = proxyquire(path, {
    '../models': model
  })
  return controller
}


// 模擬 req
const mockRequest = query => {
  return {
    ...query,
    flash: sinon.spy(),
    logout: sinon.spy(callback => callback())
  }
}

// 模擬 res
const mockResponse = () => {
  return {
    render: sinon.spy(),
    redirect: sinon.spy(),
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
}

// 模擬 next
const mockNext = err => console.log('[ERROR]:', err)

module.exports = {
  createModelMock,
  createControllerProxy,
  mockRequest,
  mockResponse,
  mockNext
}
