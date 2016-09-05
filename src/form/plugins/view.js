import $ from 'jquery'
import {arrIndexOf} from '../../utils'
export default {
  options: {
    VIEWTPL: '<span class=“form-tools-view”></span>',
    HIDE_CLASS: 'view-hide',
    VIEW_CLASS: 'form-tools-view'
  },
  view: function () {
    const VIEWTPL = this.options.VIEWTPL
    const HIDE_CLASS = this.options.HIDE_CLASS
    var skipNames = []
    var $context = this.$el
    this.parse(function (type, name, $el) {
      if (arrIndexOf(skipNames, name) !== -1) return
      var text = ''
      switch (type) {
        case 'hidden': // hidden跳过
          break
        case 'checkbox':
        case 'radio':
          text = []
          $context.find('[name=' + name + ']').each(function () {
            var $label = $(this).parent()
            $(this).is(':checked') ? text.push($label.text()) : ''
            $label.hide().addClass(HIDE_CLASS) // 影藏
            skipNames.push(name)
          })
          $(VIEWTPL).insertBefore($el.parent()).text(text.join(','))
          return
        case 'multiselect':
        case 'select':
          text = []
          $el.find('option').each(function () {
            if (this.selected) text.push(this.innerHTML)
          })
          text = text.join(',')
          break
        default:
          text = $el.val()
          break
      }
      $el.hide().addClass(HIDE_CLASS)
      $(VIEWTPL).insertBefore($el).text(text)
    })
  },
  edit: function () {
    var $context = this.$el
    const VIEW_CLASS = this.options.VIEW_CLASS
    const HIDE_CLASS = this.options.HIDE_CLASS
    $context.find(VIEW_CLASS).remove() // 移除view
    $context.find(HIDE_CLASS).show() // hideclass
  }
}
