/*!
 * jquery.render-compoent.js v1.0.0
 * (c) 2016 Myron Liu
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('si-log')) :
  typeof define === 'function' && define.amd ? define(['jquery', 'si-log'], factory) :
  (factory(global.$,global.siLog));
}(this, (function ($,siLog) { 'use strict';

$ = 'default' in $ ? $['default'] : $;
siLog = 'default' in siLog ? siLog['default'] : siLog;

var toLowerFirst = function toLowerFirst(str) {
  if (!str) return;
  var first = str.substring(0, 1);
  return first.toLowerCase() + str.substring(1);
};

var toCamelCase = function toCamelCase(str) {
  if (!str) return;
  return str.toLowerCase().replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
};

var render = $.render.regist('component');
var componentMap = $.components;
var log = siLog.create('render-component.js');
// 扩展配置
var config = render.config({
  prefix: 'cop-',
  exclude: 'no-render',
  options: '{name}-options' // options属性
});

var INTERCEPTOR = {
  LOAD: 'LOAD',
  BEFORE_LOAD: 'BEFORE_LOAD',
  DESTORY: 'DESTORY'
};

render.interceptor(INTERCEPTOR);
// 拦截器处理
render.addInterceptor({
  ELEMENT: function ELEMENT(element) {
    if (!canLoadComp(element)) return;
    var componentNames = getComponentNames(element);
    $.each(componentNames, function (i, name) {
      name = toCamelCase(name); // 转驼峰式
      if (!componentMap.hasOwnProperty(name)) {
        log.warn(name + '这个组件未注册');
        return;
      }
      var Instance = componentMap[name];
      var fullName = Instance.prototype.fullName || name;
      var options = getOptions(element, name);
      $.data(element, fullName, new Instance(element, options));
    });
  }
});
render.proxy('get', function () {
  var data = this.data();
  var map = {};
  if (!data) return null;
  $.each(data, function (key, object) {
    if (key.indexOf('component') !== -1) {
      var name = toLowerFirst(key.substring(key.indexOf('component') + 'component'.length));
      map[name] = object;
    }
  });
  return map;
});

function canLoadComp(element) {
  if ($(element).hasClass(config.exclude)) return false;
  var classes = $(element).attr('class');
  return classes && classes.indexOf(config.prefix) !== -1;
}

function getComponentNames(element) {
  var className = $(element).attr('class');
  var classes = className ? className.split(' ') : false;
  var componentNames = [];
  if (classes) {
    $.each(classes, function (i, str) {
      if (str && str.indexOf(config.prefix) !== -1) {
        componentNames.push(str.substring(str.indexOf(config.prefix) + config.prefix.length));
      }
    });
  }
  return componentNames;
}

function getOptions(element, name) {
  var optionsAttr = config.options.replace(/\{name\}/g, name);
  var str = $(element).attr(optionsAttr) || '';
  try {
    str = '{' + str + '};';
    /*eslint-disable*/
    var tempFunc = new Function('return ' + str);
    /*eslint-enable*/
    return tempFunc();
  } catch (e) {
    log.error('option解析出错 ：' + str, e);
  }
}

})));