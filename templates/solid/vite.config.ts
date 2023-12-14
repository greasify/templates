import { defineConfig } from 'vite'
import Solidjs from 'vite-plugin-solid'
import Userscript from 'vite-userscript-plugin'

import { homepage, license, name, version } from './package.json'

export default defineConfig((config) => {
  return {
    plugins: [
      Solidjs(),
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
