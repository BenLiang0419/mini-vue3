import { h } from "../lib/mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup(props) {
        // 1. setup能获取到props
        console.log(props)

        // 3. props是一个shallow Readonly 无法修改
        props.count++
        console.log(props)

        return {
            
        }
    },
    render() {
        // 2. 能够调用到props
        return h('div', {}, 'count: ' + this.count)
    }
};
