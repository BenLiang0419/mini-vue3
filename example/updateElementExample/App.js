
import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        const count = ref(0)
        const onClick = () => {
            count.value++;
        }
        return {
            username: 'BoLi-luyi',
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
                h("div", {}, "count:" + this.count), // 收集依赖
                h("button", { onClick: this.onClick }, "click")
            ]
        )
    }
};
