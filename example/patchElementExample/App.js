
import { h } from '../../lib/mini-vue.esm.js'
import { Array2Text } from './Array2Text.js'
import { Text2Text } from './Text2Text.js'
import { Text2Array } from './Text2Array.js'

export const App = {
    name: 'App',
    setup() {
        return {
        }
    },
    render() {
        const button = h('div', {}, 'Change Ref')

        return h(
            'div',
            {
                id: "root"
            },
            [
                button,
                // 更新流程：Array更换成Text
                // h(Array2Text),
                // 更新流程：Text更换成Text
                // h(Text2Text)
                // 更新流程：Text更换成Array
                h(Text2Array)
            ]
        )
    }
};
