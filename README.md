# vite-plugin-sea

Vite plugin for [Node.js SEA (single executable applications)](https://nodejs.org/api/single-executable-applications.html).

## Installation

**Requires**:

- NodeJS v18+
- signtool _(Windows only)_
  - Install [Windows SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/)
  - Ensure signtool is available on your PATH
- XCode _(MacOS only)_

```bash
npm install --save vite-plugin-sea
```

## Example

```js
// vite.config.sea.ts

import { mergeConfig } from 'vite'
import base from './vite.config.ts'

export default mergeConfig(base, {
  plugins: [sea({ entry: './src/index.ts' })],
})
```

```
npx vite build -c vite.config.sea.ts
```

It's recommended to use a separate vite.config to avoid SEA's constraints and for speed with normal builds.
