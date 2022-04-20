
import { h, ref } from '../../lib/mini-vue.esm.js'
import { Child } from './Child.js'

export const App = {
    name: 'App',
    setup() {
        const count = ref(0)
        const onClick = () => {
            count.value++;
        }
        const usrname = ref('BoLi-luyi')

        const onClickComp = () => {
            usrname.value = 'luyi'
        }
        return {
            usrname,
            count,
            onClick,
            onClickComp
        }
    },
    render() {
        return h(
            'div',
            {
                id: "root"
            },
            [
                h(Child, { msg: this.usrname }),
                h("button", { onClick: this.onClickComp }, "click2"),
                h("div", {}, "count: " + this.count),
                h("button", { onClick: this.onClick }, "click")
            ]
        )
    }
};
