module.exports = {
  generalErrorHandler (err, req, res, next) {
    // 若是使用者的錯誤，顯示快閃訊息，若是伺服器錯誤，呈現錯誤畫面，記錄錯誤訊息
    if (err instanceof Error) {
      req.flash('error_messages', `${err.message}`)
      res.redirect('back')
    } else {
      console.error(err)
      res.render('error', { message: err.message })
    }
  }
}