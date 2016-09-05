import $ from 'jquery'

export const slice = function (arr, start, end) {
  var newArr = []
  if (!arr) return newArr
  if (!start) start = 0
  if (!end || end > arr.length - 1) end = arr.length - 1
  for (var i = 0; i < arr.length; i++) {
    if (i < start) continue
    if (i > end) break
    newArr.push(arr[i])
  }
  return newArr
}

export const startWith = function (str, exp) {
  if (!str || !exp || str.length < exp.length) return
  return str.indexOf(exp) === 0
}

export const toLowerFirst = function (str) {
  if (!str) return
  var first = str.substring(0, 1)
  return first.toLowerCase() + str.substring(1)
}

export const toUpperFirst = function (str) {
  if (!str) return
  var first = str.substring(0, 1)
  return first.toUpperCase() + str.substring(1)
}

export const toClassStyle = function (str) {
  if (!str) return
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const toCamelCase = function (str) {
  if (!str) return
  return str.toLowerCase().replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}

export const arrIndexOf = function (arr, val) {
  if (!arr || !$.isArray(arr) || arr.length === 0) return -1
  var flag = -1
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === val) return i
  }
  return flag
}
