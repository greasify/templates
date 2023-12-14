import { defineConfig } from 'vite'
import Preactjs from '@preact/preset-vite'
import Userscript from 'vite-userscript-plugin'

import { homepage, license, name, version } from './package.json'

export default defineConfig((config) => {
  return {
    plugins: [
      Preactjs(),
      Userscript({
        fileName: name,
        entry: 'src/index.tsx',
        header: {
          name,
          version,
          license,
          homepage,
          match: ['http://localhost:3000', 'https://example.com']
        },
        server: {
          port: 3000
        }
      })
    ]
  }
})
