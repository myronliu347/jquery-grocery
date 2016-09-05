/*!
 * jquery.form.js v1.0.0
 * (c) 2016 Myron Liu
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global.jQuery = factory(global.$));
}(this, (function ($) { 'use strict';

$ = 'default' in $ ? $['default'] : $;

var data = {
  options: {
    skipAttr: 'data-skip',
    skipNames: []
  },
  getData: function getData() {
    var formData = {};
    var skipAttr = this.options.skipAttr;
    // var skipNames = this.options.skipNames
    var noType = this.options.noType;
    this.parse(function (type, name, $el) {
      if ($el.attr(skipAttr + '-get') === 'true') return;
      var val = '';
      switch (type) {
        case 'multiselect':
          val = [];
          $el.find('option').each(function () {
            if (this.selected) val.push(this.value);
          });
          break;
        case 'checkbox':
          val = formData[name] && $.isArray(formData[name]) ? formData[name] : [];
          if ($el.is(':checked')) val.push($el[0].value);
          break;
        case 'radio':
          val = formData[name];
          if ($el.is(':checked')) val = $el[0].value;
          break;
        case noType:
          val = $.trim($el.text());
          break;
        default:
          val = $el.val();
          break;

      }
      formData[name] = val;
    });
    return formData;
  },
  fill: function fill(data) {
    var skipAttr = this.options.skipAttr;
    // var skipNames = this.options.skipNames
    var noType = this.options.noType;
    this.parse(function (type, name, $el) {
      if ($el.attr(skipAttr + '-fill') === 'true') return;
      var srcVal = data[name];
      switch (type) {
        case 'multiselect':
          srcVal = srcVal || '';
          $el.val($.isArray(srcVal) ? srcVal : srcVal.split(','));
          break;
        case 'radio':
          $el.prop('checked', srcVal === $el[0].value);
          break;
        case 'checkbox':
          srcVal = !srcVal ? '' : $.isArray(srcVal) ? srcVal : srcVal.split(',');
          var flag = false;
          var val = $el[0].value;
          $.each(srcVal, function (i, str) {
            if (str === val) return !(flag = true);
          });
          $el.prop('checked', flag);
          break;
        case noType:
          $el.text(srcVal || '');
          break;
        default:
          $el.val(srcVal || '');
          break;
      }
    });
  },
  clear: function clear() {
    var skipAttr = this.options.skipAttr;
    // var skipNames = this.options.skipNames
    var noType = this.options.noType;
    this.parse(function (type, name, $el) {
      if ($el.attr(skipAttr + '-clear') === 'true') return;
      switch (type) {
        case 'checkbox':
        case 'radio':
          $el.prop('checked', false);
          break;
        case noType:
          $el.text('');
          break;
        default:
          $el.val('');
          break;
      }
    });
  }
};

var arrIndexOf = function arrIndexOf(arr, val) {
  if (!arr || !$.isArray(arr) || arr.length === 0) return -1;
  var flag = -1;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === val) return i;
  }
  return flag;
};

var view = {
  options: {
    VIEWTPL: '<span class=“form-tools-view”></span>',
    HIDE_CLASS: 'view-hide',
    VIEW_CLASS: 'form-tools-view'
  },
  view: function view() {
    var VIEWTPL = this.options.VIEWTPL;
    var HIDE_CLASS = this.options.HIDE_CLASS;
    var skipNames = [];
    var $context = this.$el;
    this.parse(function (type, name, $el) {
      if (arrIndexOf(skipNames, name) !== -1) return;
      var text = '';
      switch (type) {
        case 'hidden':
          // hidden跳过
          break;
        case 'checkbox':
        case 'radio':
          text = [];
          $context.find('[name=' + name + ']').each(function () {
            var $label = $(this).parent();
            $(this).is(':checked') ? text.push($label.text()) : '';
            $label.hide().addClass(HIDE_CLASS); // 影藏
            skipNames.push(name);
          });
          $(VIEWTPL).insertBefore($el.parent()).text(text.join(','));
          return;
        case 'multiselect':
        case 'select':
          text = [];
          $el.find('option').each(function () {
            if (this.selected) text.push(this.innerHTML);
          });
          text = text.join(',');
          break;
        default:
          text = $el.val();
          break;
      }
      $el.hide().addClass(HIDE_CLASS);
      $(VIEWTPL).insertBefore($el).text(text);
    });
  },
  edit: function edit() {
    var $context = this.$el;
    var VIEW_CLASS = this.options.VIEW_CLASS;
    var HIDE_CLASS = this.options.HIDE_CLASS;
    $context.find(VIEW_CLASS).remove(); // 移除view
    $context.find(HIDE_CLASS).show(); // hideclass
  }
};

var Form = function Form(selector, options) {
  this.$el = $(selector);
  this.options = $.extend({}, Form.defaults, options);
  this._init();
};

Form.defaults = {
  noType: 'HTML'
};

Form.use = function (obj) {};

$.extend(Form.prototype, {
  _init: function _init() {
    //
  },
  _destory: function _destory() {
    //
  },
  parse: function parse(func) {
    var $el = this.$el;
    var skipTypes = ['submit', 'reset', 'image', 'button', 'file'];
    var skipAttr = this.options.skipAttr;
    var $elements = $el.find('input[name],select[name],textarea[name],span[name]');
    $elements.each(function (i, el) {
      var $element = $(el);
      var type = $element.attr('type');
      if (arrIndexOf(skipTypes, type) >= 0 || $element.attr(skipAttr) === 'true') return;
      var name = $element.attr('name');
      if (!type) {
        var tag = this.nodeName.toLowerCase();
        switch (tag) {
          case 'select':
            type = $element.prop('multiple') ? 'multiselect' : 'select';
            break;
          case 'span':
            type = this.options.noType;
            break;
          case 'textarea':
            type = 'textarea';
            break;
        }
      }
      func(type, name, $element);
    });
  }
});

Form.use(data);
Form.use(view);

$.form = function (selector, options) {
  return new Form(selector, options);
};

return $;

})));