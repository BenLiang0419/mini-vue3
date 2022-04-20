
import { h } from '../../lib/mini-vue.esm.js'

export const Child = {
    name: 'Child',
    setup() {},
    render() {
        return h("div", {}, [h("div", {}, "child: " + this.$props.msg)]);
    }
};
