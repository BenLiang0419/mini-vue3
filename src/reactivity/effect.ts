class ReactiveEffect {
    fn: Function;
    constructor(fn: Function) {
        this.fn = fn
    }
    run() {
        activeEffect = this
        return this.fn()
    }
}

// 收集依赖
// target -> key -> dep
const targetKeyMap = new Map();
export const track = (target, key) => {
    let depMap;
    let dep;
    if (!targetKeyMap.has(target)) {
        depMap = new Map()
        targetKeyMap.set(target, depMap)
    }
    
    depMap = targetKeyMap.get(target)
    
    if (!depMap.has(key)) {
        dep = new Set()
        depMap.set(key, dep)
    }

    dep = depMap.get(key)

    dep.add(activeEffect)
    
};

// 触发依赖
export const trigger = (target, key) => {
    let depsMap = targetKeyMap.get(target)
    let dep = depsMap.get(key)
    for (const effect of dep) {
        effect.run()
    }
};

let activeEffect;
export const effect = (fn: Function) => {
    const reactiveEffect = new ReactiveEffect(fn);
    reactiveEffect.run();
    return reactiveEffect.run.bind(reactiveEffect);
};
