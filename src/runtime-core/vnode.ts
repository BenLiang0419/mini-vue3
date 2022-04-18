import { isObject, isString } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export const createVNode = (type, props?, children?) => {

    const vnode = {
        type,
        props,
        shapeFlag: getShapeFlags(type),
        key: props && props.key,
        children,
        el: null
    }

    // 使用二进制来进行判断
    if (isString(children)) {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    // 初始化slot
    // 组件 + children => object
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (isObject(children)) {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode

};

export const createTextVNode = (str: string) => {
    return createVNode(Text, {}, str)
};


function getShapeFlags(type) {
    return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
