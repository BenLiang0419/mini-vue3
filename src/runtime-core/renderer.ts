import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export const createRenderer = (options: any) => {

    const {
        createElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    const render = (n2, container) => {
        // 调用patch
        patch(null, n2, container, null, null)
    };

    const patch = (n1, n2, container, parent, anchor) => {

        // 判断 是不是 element类型
        // 如果是Component，type => Object
        // 如果是element类型，type => div等标签
        const { shapeFlag, type } = n2

        switch (type) {
            case Fragment: {
                processFragment(n1, n2, container, parent, anchor)
                break;
            }
            case Text: {
                processText(n1, n2, container)
                break;
            }
            default: {
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理Element
                    processElement(n1, n2, container, parent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processComponent(n1, n2, container, parent, anchor)
                }
            }
        }
    };

    const processComponent = (n1, n2, container, parent, anchor) => {
        // 挂载组件
        mountComponent(n2, container, parent, anchor)
    };

    const processFragment = (n1, n2, container, parent, anchor) => {
        mountChildren(n2.children, container, parent, anchor)
    };

    const processText = (n1, n2, container) => {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountElement(n2, container, parent, anchor)
        } else {
            patchElement(n1, n2, container, parent, anchor)
        }
    }

    function mountElement(vnode, container, parent, anchor) {
        const { type, props, children, shapeFlag } = vnode

        // 创建对应的el
        // vnode -> element -> div
        const el = (vnode.el = createElement(type))

        // 处理props => 普通属性 和 注册事件
        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }

        // 处理children --> string, Array
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.innerText = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parent, anchor)
        }

        hostInsert(el, container, anchor)
    }

    function patchElement(n1, n2, container, parent, anchor) {
        console.log("n1", n1)
        console.log("n2", n2)

        const oldProps = n1.props
        const newProps = n2.props

        // 需要把 el 挂载到新的 vnode
        // n1: 旧的 => n2: 新的
        const el = (n2.el = n1.el);

        // 对比props
        patchProps(el, oldProps, newProps)

        // 对比children
        patchChildren(n1, n2, el, parent, anchor)

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

    function patchChildren(n1, n2, container, parent, anchor) {
        // 获取shapeFlags 来判断类型
        const prevShapeFlag = n1.shapeFlag
        const shapeFlag = n2.shapeFlag

        // 新节点是 Text 时候
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 老节点是 Children 
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 清空老的 Array子节点
                unmountChildren(n1.children)
            }
            // 新老节点都不相同， 新节点需要是Text
            if (n1.children !== n2.children) {
                // 插入新的 Text节点
                hostSetElementText(container, n2.children)
            }
        } else {
            // 新节点是 Children 时候
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 老节点是 Text
                hostSetElementText(container, "")
                mountChildren(n2.children, container, parent, anchor)
            } else {
                // 老节点是 Children
                patchKeyedChildren(n1.children, n2.children, container, parent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parent, anchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;

        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key
        }

        // 1. 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parent, anchor)
            } else {
                break;
            }
            i++
        }
        console.log('左侧之后i', i)

        // 2. 右侧
        while (e1 >= i && e2 >= i) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parent, anchor)
            } else {
                break;
            }
            e1--;
            e2--;
        }
        console.log('右侧之后e1', e1)
        console.log('右侧之后e2', e2)

        // 3.新的比老的长, 新的进行创建
        // i > 旧的 证明旧的已经diff完了
        // 1 <= 新的 属于diff后需要新增的范围

        // 左侧 -> 新增
        // a b 
        // a b c d
        // i = 2  >   e1 = 2
        // i = 2  <=  e2 = 3

        // 左侧 -> 删除
        // a b c
        // a b 
        // i = 2  >   e1 = 3
        // i = 2  <=  e2 = 2

        // 右侧
        //     a b
        // c d a b
        // i = 0  >   e1 = -1
        // i = 0  <=  e2 = 1
        if (i > e1) {
            if (i <= e2) {
                const nextProp = e2 + 1
                const anchor = nextProp < c2.length ? c2[nextProp].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            // 4. i值大于新节点长度e2, 进行remove
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        } else {

            // 5. 中间进行对比

            let s1 = i;
            let s2 = i;

            // 新节点需要对比的节点数
            let toBePatched = e2 - s2 + 1
            let patched = 0

            // 新节点获取key值
            const keyToNewIndexMap = new Map()
            for (let j = s2; j <= e2; j++) {
                const nextChild = c2[j]
                keyToNewIndexMap.set(nextChild.key, j)
            }

            // 进行移动
            // 定一个长度为 新节点需要对比的节点数量
            const newIndexToOldIndexMap = new Array(toBePatched)
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0
            }

            // 旧节点进行循环
            for (let index = s1; index <= e1; index++) {

                const pervChild = c1[index]
                const pervKey = pervChild.key
                let nextIndex

                // 旧节点长度比旧节点的要长 且已经不需要对比了 直接删除
                if (patched >= toBePatched) {
                    hostRemove(pervChild.el)
                    continue
                }

                if (pervKey !== null) {
                    // 获取新节点的对应的keyindex
                    nextIndex = keyToNewIndexMap.get(pervKey)
                } else {
                    for (let j = s2; j < e2; j++) {
                        if (isSomeVNodeType(pervChild, c2[j])) {
                            nextIndex = j
                            break
                        }
                    }
                }

                if (nextIndex !== undefined) {
                    // +1 的原因是 在使用最长递增子序列算法时候，0是用于判断
                    newIndexToOldIndexMap[nextIndex - s2] = index + 1
                    patch(pervChild, c2[nextIndex], container, parent, null)
                    patched++
                } else {
                    // 旧的节点 不存在新的里面，需要删除
                    hostRemove(pervChild.el)
                }

                const newIndexSequence = getSequence(newIndexToOldIndexMap)
                let j = newIndexSequence.length - 1; // 索引 -1

                // 为了稳定的锚点，需要倒序
                for (let i = toBePatched -1 ; i >= 0; i--) {

                    const nextIndex = i + s2
                    const nextChild = c2[nextIndex].el
                    const nextAnchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null

                    if(i !== newIndexSequence[j]) {
                        console.log("需要移动位置")
                        hostInsert(nextChild, container, parent, nextAnchor)
                    } else {
                        j++
                    }
                }

            }
        }
    }

    function unmountChildren(children) {
        for (const key in children) {
            hostRemove(children[key].el)
        }
    }

    function mountChildren(vnodes = [], container, parent, anchor) {
        vnodes.forEach(element => {
            patch(null, element, container, parent, anchor)
        });
    }

    const mountComponent = (n2, container, parent, anchor) => {
        console.log('parent', parent)
        // 创建组件实例， 收集数据
        const instance = createComponentInstance(n2, parent)

        // 初始化 props, slots, setup
        setupComponent(instance)

        // 进行拆箱
        setupRenderEffect(instance, n2, container, anchor)

    };

    const setupRenderEffect = (instance, n2, container, anchor) => {
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
                patch(null, subTree, container, instance, anchor)

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
                patch(prevSubTree, subTree, container, instance, anchor)

            }

        })
    };

    return {
        createApp: createAppAPI(render)
    }

}

/**
 * 最长子序列算法LIS
 * @param arr 
 * @returns 
 */
function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}






