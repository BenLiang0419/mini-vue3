import { createVNode } from "./vnode";

export const createAppAPI = (render) => {
    return function (rootComponent) {
        return {
            mount(rootContainer) {
                // 将component转换成vnode
                // 后续所有操作都会基于vnode 来进行操作
                const vnode = createVNode(rootComponent)
                render(vnode, rootContainer)
            }
        }
    };
}