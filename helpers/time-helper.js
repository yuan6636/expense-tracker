const dayjs = require('dayjs')

const timeArray = () => {
  const year = dayjs().year()
  const yearArray = Array.from({ length: 5 }, (_, i) => year - i)
  const monthArray = Array.from({ length: 12 }, (_, i) => i + 1)
  return { yearArray, monthArray }
}

module.exports={ 
  timeArray 
}