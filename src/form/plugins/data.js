import $ from 'jquery'

export default {
  options: {
    skipAttr: 'data-skip',
    skipNames: []
  },
  getData: function () {
    var formData = {}
    var skipAttr = this.options.skipAttr
    // var skipNames = this.options.skipNames
    var noType = this.options.noType
    this.parse(function (type, name, $el) {
      if ($el.attr(skipAttr + '-get') === 'true') return
      var val = ''
      switch (type) {
        case 'multiselect':
          val = []
          $el.find('option').each(function () {
            if (this.selected) val.push(this.value)
          })
          break
        case 'checkbox':
          val = formData[name] && $.isArray(formData[name]) ? formData[name] : []
          if ($el.is(':checked')) val.push($el[0].value)
          break
        case 'radio':
          val = formData[name]
          if ($el.is(':checked')) val = $el[0].value
          break
        case noType:
          val = $.trim($el.text())
          break
        default:
          val = $el.val()
          break

      }
      formData[name] = val
    })
    return formData
  },
  fill: function (data) {
    var skipAttr = this.options.skipAttr
    // var skipNames = this.options.skipNames
    var noType = this.options.noType
    this.parse(function (type, name, $el) {
      if ($el.attr(skipAttr + '-fill') === 'true') return
      var srcVal = data[name]
      switch (type) {
        case 'multiselect':
          srcVal = srcVal || ''
          $el.val($.isArray(srcVal) ? srcVal : srcVal.split(','))
          break
        case 'radio':
          $el.prop('checked', srcVal === $el[0].value)
          break
        case 'checkbox':
          srcVal = !srcVal ? '' : $.isArray(srcVal) ? srcVal : srcVal.split(',')
          var flag = false
          var val = $el[0].value
          $.each(srcVal, function (i, str) {
            if (str === val) return !(flag = true)
          })
          $el.prop('checked', flag)
          break
        case noType:
          $el.text(srcVal || '')
          break
        default:
          $el.val(srcVal || '')
          break
      }
    })
  },
  clear: function () {
    var skipAttr = this.options.skipAttr
    // var skipNames = this.options.skipNames
    var noType = this.options.noType
    this.parse(function (type, name, $el) {
      if ($el.attr(skipAttr + '-clear') === 'true') return
      switch (type) {
        case 'checkbox':
        case 'radio':
          $el.prop('checked', false)
          break
        case noType:
          $el.text('')
          break
        default:
          $el.val('')
          break
      }
    })
  }
}
