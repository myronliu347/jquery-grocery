import $ from 'jquery'
import Form from './Form'

$.form = function (selector, options) {
  return new Form(selector, options)
}

export default $
