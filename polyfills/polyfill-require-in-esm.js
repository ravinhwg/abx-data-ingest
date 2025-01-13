// File: "polyfill-require-in-esm.mjs"

/**
 * This ESM module polyfills "require".
 * It is needed e.g. when bundling ESM scripts via "@vercel/ncc" because of https://github.com/vercel/ncc/issues/791.
 */
import { createRequire } from 'node:module';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
globalThis.require = createRequire(__filename);
