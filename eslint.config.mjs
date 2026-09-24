import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals,...nextTs,{files:['*.cjs'],rules:{'@typescript-eslint/no-require-imports':'off'}},globalIgnores(['.next/**','research/**','scrollcraft/**','.venv/**','test-results/**','playwright-report/**']),{rules:{'@next/next/no-img-element':'off'}}]);
