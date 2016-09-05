import $ from 'jquery'
import data from './plugins/data'
import view from './plugins/view'
import {arrIndexOf} from '../utils'
let Form = function (selector, options) {
  this.$el = $(selector)
  this.options = $.extend({}, Form.defaults, options)
  this._init()
}

Form.defaults = {
  noType: 'HTML'
}

Form.use = function (obj) {
}

$.extend(Form.prototype, {
  _init () {
    //
  },
  _destory () {
    //
  },
  parse (func) {
    const $el = this.$el
    const skipTypes = ['submit', 'reset', 'image', 'button', 'file']
    const skipAttr = this.options.skipAttr
    const $elements = $el.find('input[name],select[name],textarea[name],span[name]')
    $elements.each(function (i, el) {
      var $element = $(el)
      var type = $element.attr('type')
      if (arrIndexOf(skipTypes, type) >= 0 || $element.attr(skipAttr) === 'true') return
      var name = $element.attr('name')
      if (!type) {
        var tag = this.nodeName.toLowerCase()
        switch (tag) {
          case 'select':
            type = $element.prop('multiple') ? 'multiselect' : 'select'
            break
          case 'span':
            type = this.options.noType
            break
          case 'textarea':
            type = 'textarea'
            break
        }
      }
      func(type, name, $element)
    })
  }
})

Form.use(data)
Form.use(view)
export default Form
