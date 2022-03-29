// target -> key -> dep
const targetKeyMap = new Map();
let activeEffect;
// 是否应该收集
let shouldTrack = false;

class ReactiveEffect {
    fn: Function;
    deps = []
    state = true
    onStop?: () => void
    constructor(fn: Function, public scheduler?: Function) {
        this.fn = fn
        this.scheduler = scheduler
    }
    run() {
        // 判断是不是被stop
        if (!this.state) {
            return this.fn()
        }

        // 如果不是被stop，可被收集依赖
        // shouldTrack 打开
        shouldTrack = true
        activeEffect = this
        const runner = this.fn()

        // shouldTrack 是全局，所以需要被reset
        shouldTrack = false
        
        return runner
    }
    stop() {
        if (this.state) {
            if (this.onStop) {
                this.onStop()
            }
            cleanDeps(this)
            this.state = false
        }

    }
}

/**
 * 清除所有依赖dep
 * @param effect
 */
const cleanDeps = (effect) => {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
};

/**
 * 收集依赖
 * @param target 
 * @param key 
 * @returns 
 */
export const track = (target, key) => {
    // 判断是否可以被收集依赖
    // 1. shouldTrack 是否放通
    // 2. activeEffect 在run时候是否有被赋值
    if(!isTracking()) return

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
    activeEffect.deps.push(dep)
};

/**
 * 触发依赖
 * @param target 
 * @param key 
 */
export const trigger = (target, key) => {
    let depsMap = targetKeyMap.get(target)
    let dep = depsMap.get(key)
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
};

export const effect = (fn: Function, options: any = {}) => {
    const reactiveEffect = new ReactiveEffect(fn, options.scheduler);
    reactiveEffect.onStop = options.onStop
    reactiveEffect.run();
    const runner: any = reactiveEffect.run.bind(reactiveEffect);
    runner.effect = reactiveEffect
    return runner
};

export const stop = (runner) => {
    runner.effect.stop()
};

/**
 * 可以被收集依赖
 * @returns 
 */
export const isTracking = () => {
    return shouldTrack && activeEffect != undefined
};


