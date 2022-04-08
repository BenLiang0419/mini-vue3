import { createVNode } from "../vnode";

export const renderSlot = ($slots, name, props) => {
    // return vnode
    // return createVNode("div", {}, $slots)
    const slot = $slots[name]

    if (slot) {
        if (typeof slot === 'function') {
            return createVNode("div", {}, slot(props))
        }
    }
};
