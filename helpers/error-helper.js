// 客製化錯誤訊息和狀態
const setError = (status, message) => {
  const err = new Error(message)
  err.status = status
  return err
}

// 處理伺服器錯誤，再傳到 error handler
const serverError = (err, errorTypes, next) => {
  err.status = errorTypes.status
  err.message = errorTypes.message
  next(err)
}

// 分開客戶端和伺服器端錯誤
const manageError = (err, errorTypes, next) => {
  if (err instanceof Error) {
    return next(err)
  }
  serverError(err, errorTypes, next)
}

module.exports = {
  setError,
  serverError,
  manageError
}