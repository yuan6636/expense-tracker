const recordController = {
  getRecords: (req, res, next) => {
    return res.render('records')
  }
}

module.exports = recordController