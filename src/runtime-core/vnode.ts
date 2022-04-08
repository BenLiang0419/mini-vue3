import { isObject, isString } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";

export const createVNode = (type, props?, children?) => {

    const vnode = {
        type,
        props,
        shapeFlags: getShapeFlags(type),
        children,
        el: null
    }

    // 使用二进制来进行判断
    if (isString(children)) {
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN
    } else {
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN
    }

    // 初始化slot
    // 组件 + children => object
    if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        if (isObject(children)) {
            vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode

};

function getShapeFlags(type) {
    return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
