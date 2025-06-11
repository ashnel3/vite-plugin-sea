import fs from 'node:fs/promises'
import { spawn, type SpawnOptions } from 'node:child_process'
import { join, basename, dirname } from 'node:path'
import type { Plugin } from 'vite'

/** vite-plugin-sea options */
export interface SeaOptions {
  /** script file path */
  entry: string
  /** sea config overrides */
  config?: Omit<SeaConfig, 'main' | 'output'>
  /** executable output path (default: dist/out.exe) */
  output?: string
  /** use recommended vite configuration (default: true) */
  useRecommendedConfig?: boolean
}

/**
 * node-js sea config
 * @see https://nodejs.org/api/single-executable-applications.html#generating-single-executable-preparation-blobs
 */
export interface SeaConfig {
  main: string
  output: string
  assets?: Record<string, string>
  disableExperimentalSEAWarning?: boolean
  useSnapshot?: false
  useCodeCache?: false
}

export const spawner = (options: SpawnOptions) => {
  return async (command: string, args: string[] = [], overrides?: SpawnOptions): Promise<void> =>
    await new Promise((resolve, reject) => {
      const child = spawn(command, args, overrides || options)
      let error: any = null

      const onLog = (stream: NodeJS.WritableStream) => {
        return (chunk: Buffer) =>
          stream.write(`[vite:sea](${command}) ${chunk.toString().trimEnd()}\n`)
      }

      // process events
      child
        .on('error', (err) => (error = err))
        .on('exit', (code) => {
          if (code !== 0) {
            return reject(error)
          } else {
            return resolve()
          }
        })
      // console events
      child.stdout?.on('data', onLog(process.stdout))
      child.stderr?.on('data', onLog(process.stderr))
    })
}

/**
 * vite node-js sea plugin
 * @see https://nodejs.org/api/single-executable-applications.html
 * @param options - plugin options
 * @returns vite plugin
 */
export const sea = (options: SeaOptions): Plugin => ({
  name: 'vite:sea',
  enforce: 'post',
  version: VERSION,
  config() {
    if (options.useRecommendedConfig === false) {
      return
    }
    // plugin recommended settings
    return {
      build: {
        lib: {
          entry: { [basename(options.entry).split('.')[0]]: options.entry },
          formats: ['cjs'],
        },
        rollupOptions: {
          output: { inlineDynamicImports: true },
        },
        ssr: true,
      },
      ssr: { noExternal: true, target: 'node' },
    }
  },
  async writeBundle(outOpts, bundle) {
    const root = join(this.environment.config.root, 'node_modules/.sea')
    const config: SeaConfig = {
      disableExperimentalSEAWarning: true,
      main: join(outOpts.file ? dirname(outOpts.file) : outOpts.dir!, Object.keys(bundle)[0]),
      output: join(root, 'sea-prep.blob'),
    }
    const configPath = join(root, 'sea-config.json')
    const out = options.output || join(this.environment.config.root, 'out.exe')
    const node = join(root, 'node.exe')
    const spawn = spawner({ shell: true })

    // ensure workspace
    await Promise.all([
      fs.mkdir(root, { recursive: true }),
      fs.copyFile(process.execPath, node),
      fs.writeFile(configPath, JSON.stringify(config)),
    ])

    // bundle script
    await spawn('node', ['--experimental-sea-config', configPath])

    // remove executable signature
    if (process.platform === 'darwin') {
      await spawn('codesign', ['--remove-signature', node])
    }
    if (process.platform === 'win32') {
      await spawn('signtool', ['remove', '/s', node])
    }

    // inject sea blob
    await spawn('node', [
      join(this.environment.config.root, 'node_modules/postject/dist/cli.js'),
      node,
      'NODE_SEA_BLOB',
      config.output,
      '--sentinel-fuse',
      'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    ])

    // create finished executable
    await fs.mkdir(dirname(out), { recursive: true })
    await fs.copyFile(node, out)

    console.log(`[vite:sea] executable created at "${out}"!`)
  },
})
