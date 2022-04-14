import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export const createRenderer = (options: any) => {

    const { createElement, patchProp: hostPatchProp, insert } = options

    const render = (n2, container) => {
        // 调用patch
        patch(null, n2, container)
    };

    const patch = (n1, n2, container, parent = null) => {

        // 判断 是不是 element类型
        // 如果是Component，type => Object
        // 如果是element类型，type => div等标签
        const { shapeFlags, type } = n2

        switch (type) {
            case Fragment: {
                processFragment(n1, n2, container, parent)
                break;
            }
            case Text: {
                processText(n1, n2, container)
                break;
            }
            default: {
                if (shapeFlags & ShapeFlags.ELEMENT) {
                    // 处理Element
                    processElement(n1, n2, container, parent)
                } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processComponent(n1, n2, container, parent)
                }
            }
        }
    };

    const processComponent = (n1, n2, container, parent) => {
        // 挂载组件
        mountComponent(n2, container, parent)
    };

    const processFragment = (n1, n2, container, parent) => {
        mountChildren(n2.children, container, parent)
    };

    const processText = (n1, n2, container) => {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processElement(n1, n2, container, parent) {
        if (!n1) {
            mountElement(n2, container, parent)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function mountElement(vnode, container, parent) {
        const { type, props, children, shapeFlags } = vnode

        // 创建对应的el
        // vnode -> element -> div
        const el = (vnode.el = createElement(type))

        // 处理props => 普通属性 和 注册事件
        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }

        // 处理children --> string, Array
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            el.innerText = children
        } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parent)
        }

        insert(el, container)
    }

    function patchElement(n1, n2, container) {
        console.log("n1", n1)
        console.log("n2", n2)

        const oldProps = n1.props
        const newProps = n2.props

        // 需要把 el 挂载到新的 vnode
        // n1: 旧的 => n2: 新的
        const el = (n2.el = n1.el);

        // 对比props
        patchProps(el, oldProps, newProps)

    }

    function patchProps(el, oldProps, newProps) {
        console.log('oldProps', oldProps)
        console.log('newProps', newProps)

        // 当不相同的时候才会去判断
        if (oldProps !== newProps) {
            // 遍历新值
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== newProps) {
                    // 对比属性值，如果不相同则需要进行更新
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            // 遍历旧值
            for (const key in oldProps) {
                const prevProp = oldProps[key]
                if (!(key in newProps)) {
                    // 判断新props没有的，没有的就去掉null
                    hostPatchProp(el, key, prevProp, null)
                }
            }
        }
    }

    function mountChildren(vnodes = [], container, parent) {
        vnodes.forEach(element => {
            patch(null, element, container, parent)
        });
    }

    const mountComponent = (n2, container, parent) => {
        console.log('parent', parent)
        // 创建组件实例， 收集数据
        const instance = createComponentInstance(n2, parent)

        // 初始化 props, slots, setup
        setupComponent(instance)

        // 进行拆箱
        setupRenderEffect(instance, n2, container)

    };

    const setupRenderEffect = (instance, n2, container) => {
        // 依赖收集
        effect(() => {
            const { isMounted } = instance
            if (!isMounted) {
                // 是否初始化
                // 指定代理对象 this.xxx
                const { proxy } = instance

                const subTree = instance.render.call(proxy)

                // subTree 虚拟节点树 n2 tree
                // n2 -> patch
                // n2 -> element -> mountElement
                patch(null, subTree, container, instance)

                // vnode节点存起来
                instance.subTree = subTree

                // 完成了所有的patch后
                n2.el = subTree.el

                // 初始化结束后，转换状态
                instance.isMounted = true

            } else {
                const { proxy } = instance

                // 当前（新）节点
                const subTree = instance.render.call(proxy)

                // 旧节点
                const prevSubTree = instance.subTree

                // vnode节点存起来
                instance.subTree = subTree

                // 新节点 和 旧节点 进行对比
                patch(prevSubTree, subTree, container, instance)

            }

        })
    };

    return {
        createApp: createAppAPI(render)
    }

}






