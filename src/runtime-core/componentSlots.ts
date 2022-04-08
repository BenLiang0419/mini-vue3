import { ShapeFlags } from "../shared/shapeFlags";

export const initSlots = (instance, children) => {
    // 1. 单个
    // 2. array
    // 3. key->value object
    // instance.slots = Array.isArray(children) ? children : [children]

    const { vnode } = instance
    if (vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
        normalizeObject(children, instance);
    }
};

function normalizeObject(children: any, instance: any) {
    const solts = {};
    for (const key in children) {
        const val = children[key];
        solts[key] = (props) => normalizeSlotValue(val(props));
    }
    instance.slots = solts;
}

function normalizeSlotValue(val) {
    return Array.isArray(val) ? val : [val]
}

