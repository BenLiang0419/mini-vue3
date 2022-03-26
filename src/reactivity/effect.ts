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
        activeEffect = this
        return this.fn()
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

const cleanDeps = (effect) => {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
};


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

    if (!activeEffect) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
};

// 触发依赖
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

let activeEffect;
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

