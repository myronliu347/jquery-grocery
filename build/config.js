module.exports = {
  global: {
    version: '1.0.0',
    external: ['jquery', 'si-log'],
    format: 'umd',
    globals: {
        jquery: '$',
        'si-log': 'siLog'
    }
  },
  grocery: {
    name: 'jquery.grocery',
    entry: 'src/index.js',
  },
  component: {
    name: 'jquery.component',
    entry: 'src/component/index.js'
  },
  render: {
    name: 'jquery.render',
    entry: 'src/render/index.js'
  },
  renderComponent: {
    name: 'jquery.render-compoent',
    entry: 'src/render/render-component.js'
  },
  form: {
    name: 'jquery.form',
    entry: 'src/form/index.js'
  }
}
