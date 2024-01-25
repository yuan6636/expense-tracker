const getOffset = (limit = 6, page = 1) => (page - 1) * limit

const getPagination = (limit = 6, page = 1, total = 30, displayedPages = 3) => {
  const totalPage = total > 0 ? Math.ceil(total / limit) : 1
  
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1

  let startPage
  let endPage
  // 總頁數 <= 展示頁數，起始頁數為 1 ，最終頁數為總頁數
  if(totalPage <= displayedPages) {
    startPage = 1
    endPage = totalPage
  // 以下是總頁數 > 展示頁數
  } else if (currentPage <= Math.ceil(displayedPages/2)) {
    // 目前頁數 <= 展示頁數一半
    startPage = 1
    endPage = displayedPages

  } else if (currentPage + Math.floor(displayedPages/2) >= totalPage) {
    // 最終頁數為totalPage的分頁器情況
    // currentPage >= totalPage - Math.floor(displayedPages/2)
    startPage = totalPage - displayedPages + 1
    endPage = totalPage

  } else {
    // 目前頁數在中間區域時
    startPage = currentPage - 1
    endPage = currentPage + 1
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
  return {
    totalPage,
    pages,
    currentPage,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}