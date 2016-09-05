var rollup = require('rollup')
var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')
var npm = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')
var config = require('./config')
var assign = require('lodash.assign')

var mdName = process.argv[2] || 'all'
generate(mdName)

function generate (mdName) {
  if (mdName === 'all') {
    Object.keys(config).forEach((key) => {
      console.log(key)
      generate(key)
    })
  }
  if (!mdName || !config[mdName] || mdName === 'global') return
  build(assign({}, config.global, config[mdName]))
}


function build(options) {
  var banner =
  '/*!\n' +
  ' * ' + options.name + '.js v' + options.version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' Myron Liu\n' +
  ' * Released under the MIT License.\n' +
  ' */'
  rollup.rollup({
    entry: options.entry,
    external: options.external,
    plugins: [
      npm({
        jsnext: true,
        main: true
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['es2015-rollup']
      })
    ]
  }).then(function (bundle) {
    bundle.write({
      format: options.format,
      banner: banner,
      moduleName: 'jQuery',
      globals: options.globals,
      dest: 'dist/' + options.name + '.js'
    })
    rollup.rollup({
      entry: 'src/index.js',
      external: options.external,
      plugins: [
        npm({
          jsnext: true,
          main: true
        }),
        uglify(),
        commonjs(),
        babel({
          exclude: 'node_modules/**',
          babelrc: false,
          presets: ['es2015-rollup']
        })
      ]
    }).then(function (bundle) {
      bundle.write({
        // output format - 'amd', 'cjs', 'es6', 'iife', 'umd'
        format: options.format,
        banner: banner,
        moduleName: 'jQuery',
        sourceMap: true,
        globals: options.globals,
        dest: 'dist/' + options.name + '.min.js'
      })
    })
  }).catch(function (err) {
    console.log(err)
  })
}
