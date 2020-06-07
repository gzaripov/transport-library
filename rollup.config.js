import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const browser = {
  input: 'src/index.browser.ts',
  plugins: [typescript()],
  output: [
    {
      file: pkg.browser[pkg.main],
      format: 'cjs',
      exports: 'named',
      plugins: [terser()],
    },
    {
      file: pkg.browser[pkg.module],
      format: 'esm',
      exports: 'named',
      plugins: [
        terser({
          module: true,
        }),
      ],
    },
  ],
};

const node = {
  input: 'src/index.node.ts',
  plugins: [typescript()],
  external: ['url', 'http', 'https', 'stream'],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
    },
  ],
};

export default [browser, node];
