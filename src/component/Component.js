import siLog from 'si-log'
import $ from 'jquery'
import * as utils from '../utils'
const log = siLog.create('Component.js')

function Component () {}
const noop = function () {}
/*eslint-disable*/
let initializing = false
const fnTest = /xyz/.test(function () {
  xyz
}) ? /\b_super\b/ : /.*/
/*eslint-enable*/
Component.extend = function (obj) {
  if (!obj && typeof obj !== 'object') {
    log.warn('Parameter is null or not Object, not registered')
    return
  }
  var _super = this.prototype
  initializing = true
  var prototype = new this()
  initializing = false
  // minxins处理
  if (obj.mixins && $.isArray(obj.mixins) && obj.mixins.length > 0) {
    $.each(obj.mixins, function (i, item) {
      if ($.isPlainObject(item)) {
        obj = $.extend({}, item, obj)
      }
    })
    delete obj.mixins
  }
  obj.options = $.extend({}, _super.options, obj.options)
  // 对象继承处理
  for (var name in obj) {
    prototype[name] = typeof obj[name] === 'function' &&
    typeof _super[name] === 'function' && fnTest.test(obj[name])
      ? (function (name, fn) {
        return function () {
          var tmp = this._super

          this._super = _super[name]

          var ret = fn.apply(this, arguments)
          this._super = tmp

          return ret
        }
      })(name, obj[name]) : obj[name]
  }

  function Class (targetElement, options) {
    if (targetElement && this._create) {
      this._create(targetElement, options)
    }
  }
  Class.prototype = prototype
  Class.prototype.constructor = Component
  Class.extend = Component.extend
  return Class
}
Component.prototype = {
  componentName: 'component', // 组件名称
  options: {
    onDestory: null,
    onCreate: null
  },
  _create: function (targetElement, options) {
    this.options = $.extend({}, this.options, options) // 存储options
    this.targetElement = targetElement
    $(targetElement).data(this._getDataKey(), this) // 缓存对象
    $(this.targetElement).on('remove', this._call(function (e) {
      if (e.target === this.targetElement) {
        this._destory()
      }
    }))
    if (this.create && $.isFunction(this.create)) this.element = this.create(targetElement, this.options)
    if (!this.element) this.element = this.targetElement
    this.$target = $(this.targetElement)
    this.$element = $(this.element)
    this._initListener(this.options) // 初始化options中的事件监听
    this._trigger('create', this.element) // 触发create事件
    this._init(this.element, this.options)
  },
  _init: function (element, options) {
    this.init(element, options)
  },
  _getDataKey: function () {
    return this.fullName
  },
  option: function (key, value) {
    var options
    if ($.isPlainObject(key)) {
      options = key
    } else if (value === undefined) {
      return this.options[key]
    } else {
      options = {}
      options[key] = value
    }
    this._setOptions(options)
    // return this
  },
  _setOptions: function (options) {
    for (var key in options) {
      this._setOption(key, options[key])
    }
    return this
  },
  _setOption: function (key, value) {
    this.options[key] = value
    return this
  },
  create: noop,
  init: noop,
  refresh: noop,
  _initListener: function (options) {
    $.each(options, this._call(function (key, val) {
      if (utils.startWith(key, 'on') && $.isFunction(val)) {
        var event = utils.toLowerFirst(key.substring(2))
        var temp = val
        val = function () {
          var arr = []
          if (arguments && arguments.length > 0) {
            arr = utils.slice(arguments, 1)
          }
          return temp.apply(this, arr)
        }
        this._on(event, val)
      }
    }))
  },
  _trigger: function (event, data) {
    var eventName = this.componentName + '.' + event
    $(this.targetElement).trigger(eventName, data)
  },
  _on: function (event, func) {
    var eventName = this.componentName + '.' + event
    $(this.targetElement).on(eventName, this._call(func, this.targetElement))
  },
  _off: function (event) {
    var eventName = this.componentName + '.' + event
    $(this.targetElement).off(eventName)
  },
  _call: function (func, ctx) {
    if (!func || !$.isFunction(func)) return
    var context = ctx || this
    return function () {
      var arr = []
      if (arguments && arguments.length > 0) {
        arr = utils.slice(arguments)
      }
      if (this !== context) arr.push(this)
      return func.apply(context, arr)
    }
  },
  _bindEvents: function (selector, event, handlder) {
    var binds = []
    if (arguments.length === 1) {
      binds = arguments[0]
    } else {
      binds.push({
        selector: selector,
        event: event,
        handlder: handlder
      })
    }
    var _this = this
    $.each(binds, function (i, item) {
      $(_this.element).on(item.event, item.selector, _this._call(item.handler))
    })
  },
  destory: noop,
  _destory: function () {
    this.destory()
    this._trigger('destory')
    $(this.element).off().removeData(this._getDataKey()).remove()
    $(this.targetElement).off().removeData(this._getDataKey())
  }
}

export default Component
