
import { h, ref, getCurrentInstance, nextTick } from '../../lib/mini-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        const count = ref(0)
        const instance = getCurrentInstance()
        const onClick = () => {
            for (let index = 0; index < 100; index++) {
                count.value = index
            }
            console.log('app', instance)

            nextTick(() => {
                console.log('app - nextTick', instance)
            })
        }
        return {
            count,
            onClick
        }
    },
    render() {
        return h(
            'div',
            {
                id: "root"
            },
            [
                h("p", {}, "nextTick Example"),
                h("div", {}, "count:" + this.count), // 收集依赖
                h("button", { onClick: this.onClick }, "click")
            ]
        )
    }
};
