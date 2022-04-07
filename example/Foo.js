import { h } from "../lib/mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup(props, { emit }) {
        // 1. setup能获取到props
        console.log(props)

        // 3. props是一个shallow Readonly 无法修改
        // props.count++
        console.log(props)

        // 事件
        const emitAdd = () => {
            console.log('emitAdd')
            emit('add')
            emit('add-count', 123)
        }

        return {
            emitAdd
        }
    },
    render() {
        // 2. 能够调用到props
        return h('div', {}, [
            h('h', {}, 'count: ' + this.count),
            h('button', { onClick: this.emitAdd}, "emitAdd")
        ])
    }
};
