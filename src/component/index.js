import siLog from 'si-log'
import $ from 'jquery'
import * as utils from '../utils'
import Component from './Component'
const log = siLog.create('jquery.component.js')

$.cleanData = (function (orig) {
  return function (elems) {
    var events, elem, i
    for (i = 0; (elem = elems[i]) !== null; i++) {
      try {
        // Only trigger remove when necessary to save time
        events = $._data(elem, 'events')
        if (events && events.remove) {
          $(elem).triggerHandler('remove')
        }
        // Http://bugs.jquery.com/ticket/8235
      } catch (e) {}
    }
    orig(elems)
  }
})($.cleanData)
$.components = $.components || {} // 存储组件集合
$.component = function (name) {
  if (!name || $.trim(name) === '' || arguments.length < 2) {
    log.error('创建组件参数有误')
  }
  name = utils.toCamelCase($.trim(name))
  var parentName = null
  var fun = null
  if (arguments.length === 2) {
    fun = arguments[1]
  } else {
    parentName = arguments[1]
    fun = arguments[2]
  }
  var prop = typeof fun === 'function' ? fun() : typeof fun === 'object' ? fun : undefined // 执行方法返回render对象
  prop.componentName = name // 组件名称
  prop.fullName = 'component' + utils.toUpperFirst(name)
  if (parentName && !$.components.hasOwnProperty(parentName)) {
    log.error('没有这个父组件[' + parentName + ']')
    return
  }
  if ($.components.hasOwnProperty(name)) {
    log.warn('[' + name + ']这个组件已经被注册了！')
  }
  var componentClass = parentName ? $.components[parentName].extend(prop) : Component.extend(prop)
  $.components[name] = componentClass
  $.component.bridge(name, componentClass)
  return componentClass
}
$.component.bridge = function (name, Obj) {
  var fullName = Obj.prototype.fullName || name
  var pluginName = name
  if ($.fn[pluginName]) {
    log.warn('无法注册为jquery插件,这个插件已经存在')
    return
  }
  $.fn[pluginName] = function (options) {
    var isMethodCall = typeof options === 'string'
    var args = Array.prototype.slice.call(arguments, 1)
    var returnValue = this

    if (isMethodCall) {
      this.each(function () {
        var methodValue
        var instance = $.data(this, fullName)

        if (options === 'instance') {
          returnValue = instance
          return false
        }

        if (!instance) {
          return log.error('cannot call methods on ' + name + ' prior to initialization; ' +
            'attempted to call method "' + options + '"')
        }

        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
          return log.error('no such method "' + options + '" for ' + name + ' component instance')
        }

        methodValue = instance[options].apply(instance, args)

        if (methodValue !== instance && methodValue !== undefined) {
          returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue
          return false
        }
      })
    } else {
      this.each(function () {
        var instance = $.data(this, fullName)
        if (instance) {
          if (instance.refresh) {
            instance.refresh(options)
          }
        } else {
          $.data(this, fullName, new Obj(this, options))
        }
      })
    }
    return returnValue
  }
}
