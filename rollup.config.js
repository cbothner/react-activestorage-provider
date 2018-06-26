import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

import pkg from './package.json'

export default {
  input: 'src/index.js',

  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],

  external: ['react', 'react-dom'],

  plugins: [
    babel({ exclude: 'node_modules/**' }),

    resolve({ jsnext: true, main: true }),

    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/activestorage/app/assets/javascripts/activestorage.js': [
          'start',
          'DirectUpload',
        ],
      },
    }),
  ],
}
