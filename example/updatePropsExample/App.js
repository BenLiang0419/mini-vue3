
import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        const obj = ref({
            foo: 'foo',
            bar: 'bar'
        })

        // 场景1: 修改props值
        const onClickOne = () => {
            obj.value.foo = 'foo-new'
        }

        // 场景2: 删除props值 ==> undefined
        const onClickTwo = () => {
            obj.value.bar = undefined
        }

        // 场景3: 在新的props没有
        const onClickThree = () => {
            obj.value = {
                foo: 'foo-three'
            }
        }

        return {
            username: 'BoLi-luyi',
            obj,
            onClickOne,
            onClickTwo,
            onClickThree
        }
    },
    render() {
        return h(
            'div',
            {
                id: "root",
                ...this.obj
            },
            [
                h("button", { onClick: this.onClickOne }, "场景1: 修改props值"),
                h("button", { onClick: this.onClickTwo }, "场景2: 删除props值"),
                h("button", { onClick: this.onClickThree }, "场景3: 在新的props没有")
            ]
        )
    }
};
