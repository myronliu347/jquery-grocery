/*!
 * jquery.component.js v1.0.0
 * (c) 2016 Myron Liu
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('si-log'), require('jquery')) :
  typeof define === 'function' && define.amd ? define(['si-log', 'jquery'], factory) :
  (factory(global.siLog,global.$));
}(this, (function (siLog,$) { 'use strict';

siLog = 'default' in siLog ? siLog['default'] : siLog;
$ = 'default' in $ ? $['default'] : $;

var slice = function slice(arr, start, end) {
  var newArr = [];
  if (!arr) return newArr;
  if (!start) start = 0;
  if (!end || end > arr.length - 1) end = arr.length - 1;
  for (var i = 0; i < arr.length; i++) {
    if (i < start) continue;
    if (i > end) break;
    newArr.push(arr[i]);
  }
  return newArr;
};

var startWith = function startWith(str, exp) {
  if (!str || !exp || str.length < exp.length) return;
  return str.indexOf(exp) === 0;
};

var toLowerFirst = function toLowerFirst(str) {
  if (!str) return;
  var first = str.substring(0, 1);
  return first.toLowerCase() + str.substring(1);
};

var toUpperFirst = function toUpperFirst(str) {
  if (!str) return;
  var first = str.substring(0, 1);
  return first.toUpperCase() + str.substring(1);
};

var toCamelCase = function toCamelCase(str) {
  if (!str) return;
  return str.toLowerCase().replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var log$1 = siLog.create('Component.js');

function Component() {}
var noop = function noop() {};
/*eslint-disable*/
var initializing = false;
var fnTest = /xyz/.test(function () {
  xyz;
}) ? /\b_super\b/ : /.*/;
/*eslint-enable*/
Component.extend = function (obj) {
  if (!obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
    log$1.warn('Parameter is null or not Object, not registered');
    return;
  }
  var _super = this.prototype;
  initializing = true;
  var prototype = new this();
  initializing = false;
  // minxins处理
  if (obj.mixins && $.isArray(obj.mixins) && obj.mixins.length > 0) {
    $.each(obj.mixins, function (i, item) {
      if ($.isPlainObject(item)) {
        obj = $.extend({}, item, obj);
      }
    });
    delete obj.mixins;
  }
  obj.options = $.extend({}, _super.options, obj.options);
  // 对象继承处理
  for (var name in obj) {
    prototype[name] = typeof obj[name] === 'function' && typeof _super[name] === 'function' && fnTest.test(obj[name]) ? function (name, fn) {
      return function () {
        var tmp = this._super;

        this._super = _super[name];

        var ret = fn.apply(this, arguments);
        this._super = tmp;

        return ret;
      };
    }(name, obj[name]) : obj[name];
  }

  function Class(targetElement, options) {
    if (targetElement && this._create) {
      this._create(targetElement, options);
    }
  }
  Class.prototype = prototype;
  Class.prototype.constructor = Component;
  Class.extend = Component.extend;
  return Class;
};
Component.prototype = {
  componentName: 'component', // 组件名称
  options: {
    onDestory: null,
    onCreate: null
  },
  _create: function _create(targetElement, options) {
    this.options = $.extend({}, this.options, options); // 存储options
    this.targetElement = targetElement;
    $(targetElement).data(this._getDataKey(), this); // 缓存对象
    $(this.targetElement).on('remove', this._call(function (e) {
      if (e.target === this.targetElement) {
        this._destory();
      }
    }));
    if (this.create && $.isFunction(this.create)) this.element = this.create(targetElement, this.options);
    if (!this.element) this.element = this.targetElement;
    this.$target = $(this.targetElement);
    this.$element = $(this.element);
    this._initListener(this.options); // 初始化options中的事件监听
    this._trigger('create', this.element); // 触发create事件
    this._init(this.element, this.options);
  },
  _init: function _init(element, options) {
    this.init(element, options);
  },
  _getDataKey: function _getDataKey() {
    return this.fullName;
  },
  option: function option(key, value) {
    var options;
    if ($.isPlainObject(key)) {
      options = key;
    } else if (value === undefined) {
      return this.options[key];
    } else {
      options = {};
      options[key] = value;
    }
    this._setOptions(options);
    // return this
  },
  _setOptions: function _setOptions(options) {
    for (var key in options) {
      this._setOption(key, options[key]);
    }
    return this;
  },
  _setOption: function _setOption(key, value) {
    this.options[key] = value;
    return this;
  },
  create: noop,
  init: noop,
  refresh: noop,
  _initListener: function _initListener(options) {
    $.each(options, this._call(function (key, val) {
      if (startWith(key, 'on') && $.isFunction(val)) {
        var event = toLowerFirst(key.substring(2));
        var temp = val;
        val = function val() {
          var arr = [];
          if (arguments && arguments.length > 0) {
            arr = slice(arguments, 1);
          }
          return temp.apply(this, arr);
        };
        this._on(event, val);
      }
    }));
  },
  _trigger: function _trigger(event, data) {
    var eventName = this.componentName + '.' + event;
    $(this.targetElement).trigger(eventName, data);
  },
  _on: function _on(event, func) {
    var eventName = this.componentName + '.' + event;
    $(this.targetElement).on(eventName, this._call(func, this.targetElement));
  },
  _off: function _off(event) {
    var eventName = this.componentName + '.' + event;
    $(this.targetElement).off(eventName);
  },
  _call: function _call(func, ctx) {
    if (!func || !$.isFunction(func)) return;
    var context = ctx || this;
    return function () {
      var arr = [];
      if (arguments && arguments.length > 0) {
        arr = slice(arguments);
      }
      if (this !== context) arr.push(this);
      return func.apply(context, arr);
    };
  },
  _bindEvents: function _bindEvents(selector, event, handlder) {
    var binds = [];
    if (arguments.length === 1) {
      binds = arguments[0];
    } else {
      binds.push({
        selector: selector,
        event: event,
        handlder: handlder
      });
    }
    var _this = this;
    $.each(binds, function (i, item) {
      $(_this.element).on(item.event, item.selector, _this._call(item.handler));
    });
  },
  destory: noop,
  _destory: function _destory() {
    this.destory();
    this._trigger('destory');
    $(this.element).off().removeData(this._getDataKey()).remove();
    $(this.targetElement).off().removeData(this._getDataKey());
  }
};

var log = siLog.create('jquery.component.js');

$.cleanData = function (orig) {
  return function (elems) {
    var events, elem, i;
    for (i = 0; (elem = elems[i]) !== null; i++) {
      try {
        // Only trigger remove when necessary to save time
        events = $._data(elem, 'events');
        if (events && events.remove) {
          $(elem).triggerHandler('remove');
        }
        // Http://bugs.jquery.com/ticket/8235
      } catch (e) {}
    }
    orig(elems);
  };
}($.cleanData);
$.components = $.components || {}; // 存储组件集合
$.component = function (name) {
  if (!name || $.trim(name) === '' || arguments.length < 2) {
    log.error('创建组件参数有误');
  }
  name = toCamelCase($.trim(name));
  var parentName = null;
  var fun = null;
  if (arguments.length === 2) {
    fun = arguments[1];
  } else {
    parentName = arguments[1];
    fun = arguments[2];
  }
  var prop = typeof fun === 'function' ? fun() : (typeof fun === 'undefined' ? 'undefined' : _typeof(fun)) === 'object' ? fun : undefined; // 执行方法返回render对象
  prop.componentName = name; // 组件名称
  prop.fullName = 'component' + toUpperFirst(name);
  if (parentName && !$.components.hasOwnProperty(parentName)) {
    log.error('没有这个父组件[' + parentName + ']');
    return;
  }
  if ($.components.hasOwnProperty(name)) {
    log.warn('[' + name + ']这个组件已经被注册了！');
  }
  var componentClass = parentName ? $.components[parentName].extend(prop) : Component.extend(prop);
  $.components[name] = componentClass;
  $.component.bridge(name, componentClass);
  return componentClass;
};
$.component.bridge = function (name, Obj) {
  var fullName = Obj.prototype.fullName || name;
  var pluginName = name;
  if ($.fn[pluginName]) {
    log.warn('无法注册为jquery插件,这个插件已经存在');
    return;
  }
  $.fn[pluginName] = function (options) {
    var isMethodCall = typeof options === 'string';
    var args = Array.prototype.slice.call(arguments, 1);
    var returnValue = this;

    if (isMethodCall) {
      this.each(function () {
        var methodValue;
        var instance = $.data(this, fullName);

        if (options === 'instance') {
          returnValue = instance;
          return false;
        }

        if (!instance) {
          return log.error('cannot call methods on ' + name + ' prior to initialization; ' + 'attempted to call method "' + options + '"');
        }

        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
          return log.error('no such method "' + options + '" for ' + name + ' component instance');
        }

        methodValue = instance[options].apply(instance, args);

        if (methodValue !== instance && methodValue !== undefined) {
          returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
          return false;
        }
      });
    } else {
      this.each(function () {
        var instance = $.data(this, fullName);
        if (instance) {
          if (instance.refresh) {
            instance.refresh(options);
          }
        } else {
          $.data(this, fullName, new Obj(this, options));
        }
      });
    }
    return returnValue;
  };
};

})));