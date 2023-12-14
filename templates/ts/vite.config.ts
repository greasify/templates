import { defineConfig } from 'vite'
import Userscript from 'vite-userscript-plugin'

import { homepage, license, name, version } from './package.json'

export default defineConfig((config) => {
  return {
    plugins: [
      Userscript({
        fileName: name,
        entry: 'src/index.ts',
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
