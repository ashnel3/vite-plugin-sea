# vite-plugin-sea

> [!WARNING]  
> Node SEA is still experimental.

Vite plugin for [Node.js SEA (single executable applications)](https://nodejs.org/api/single-executable-applications.html).

## RoadMap

- [x] cross-platform support
- [ ] executable signing
- [ ] resource hacker *(Windows only)*

## Installation

**Requires**:

- [NodeJS v20+](https://nodejs.org)
- signtool _(Windows only)_
  - Install [Windows SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/).
  - Ensure signtool is available on your PATH.
- codesign _(MacOS only)_

```bash
npm install --save vite-plugin-sea
```

## Usage

It's recommended to use a separate vite.config to avoid SEA's constraints and for speed with normal builds.

```js
// vite.config.sea.ts

import { mergeConfig } from 'vite'
import base from './vite.config.ts'

export default mergeConfig(base, {
  plugins: [sea({ entry: '{entrypoint}', output: '{filename}' })],
})
```

```sh
npx vite build -c vite.config.sea.ts
```
