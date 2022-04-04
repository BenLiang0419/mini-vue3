
// rollup无法解析TS, 需要使用plugin
import typescript from "@rollup/plugin-typescript"
import pkg from "./package.json"

export default {
    input: './src/index.ts',
    output: [
        // 输出两种模式
        // cjs --> node commonjs
        // esm --> es module
        {
            format: 'cjs',
            file: pkg.main
        },
        {
            format: 'es',
            file: pkg.module
        }
    ],
    plugins: [typescript()]
}