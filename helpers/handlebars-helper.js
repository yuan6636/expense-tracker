const categoryIcons = {
  Home: 'fa-solid fa-house',
  Transportation: 'fa-solid fa-van-shuttle',
  Entertainment: 'fa-solid fa-face-grin-beam',
  Food: 'fa-solid fa-utensils',
  Others: 'fa-solid fa-pen'
}

module.exports = {
  getIcons: (name) => categoryIcons[name],
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}