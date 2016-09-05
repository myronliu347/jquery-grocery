import $ from 'jquery'
import siLog from 'si-log'
import {slice} from '../utils'

const log = siLog.create('render.js')

$.fn.render = function (type) {
  var ignoreSelf = type === true
  if (!type || ignoreSelf === true) {
    this.each(function () {
      $.render(this, ignoreSelf)
    })
  } else {
    var args = slice(arguments, 1)
    var func = render.proxys[type]
    if (func && $.isFunction(func)) return func.apply(this, args)
  }
  return this
}

var render = $.render = function (element, ignoreSelf) {
  if (!ignoreSelf) $.render.doInterceptor($.render.interceptorName.ELEMENT, element)
  $(element).children().each(function () {
    $.render(this)
  })
  $.render.doInterceptor($.render.interceptorName.ELEMENT_AFTER, element)
}

render.config = {
  auto: true // 自动渲染
}
render.interceptorName = {
  ELEMENT: 'ELEMENT',
  ELEMENT_AFTER: 'ELEMENT_AFTER'
}
var interceptors = render.interceptors = []

render.addInterceptor = function (obj) {
  if (obj && $.isPlainObject(obj)) interceptors.push(obj)
}
// 执行拦截器
render.doInterceptor = function (eventName) {
  var params = Array.prototype.slice.call(arguments, 1)
  $.each(interceptors, function (i, interceptor) {
    if (interceptor[eventName] && $.isFunction(interceptor[eventName])) {
      try {
        interceptor[eventName].apply(interceptor, params)
      } catch (e) {
        log.error(e)
      }
    }
  })
}

render.proxys = {}
render.proxy = function (name, func) {
  if (!name || !func || !$.isFunction(func)) return
  render.proxys[name] = func
}
/**
 * 递归渲染的扩展
 */
render.plugins = {}
// 注册一个render插件
render.regist = function (name) {
  if (!name) return
  if (render.plugins[name]) return render.plugins[name]
  render.plugins[name] = new Plugin(name)
  return render.plugins[name]
}

function Plugin (ns) {
  this.ns = ns
}

$.extend(Plugin.prototype, {
  proxy: function (name, func) {
    var fullName = this.ns + '.' + name
    render.proxy(fullName, func)
  },
  // 扩展名称
  interceptor: function (obj) {
    if (!obj || !$.isPlainObject(obj)) return
    $.each(obj, function (key, val) {
      render.interceptorName[this.ns.toUpperCase() + '_' + key.toUpperCase()] = this.ns.toUpperCase() + '_' + val.toUpperCase()
    })
    return render.interceptorName
  },
  addInterceptor: function (obj) {
    render.addInterceptor(obj)
  },
  doInterceptor: function (eventName) {
    var fullName = this.ns.toUpperCase() + '_' + eventName.toUpperCase()
    render.doInterceptor(fullName)
  },
  config: function (obj) {
    var config = render.config[this.ns] || (render.config[this.ns] = {})
    return $.extend(config, obj)
  }
})

$(function () {
  if (render.config.auto) $('body').render() // 自动渲染
})
