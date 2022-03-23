class ReactiveEffect {
    fn: Function;
    constructor(fn: Function) {
        this.fn = fn
    }
    run() {
        this.fn()
    }
}

export const effect = (fn: Function) => {
    const reactiveEffect = new ReactiveEffect(fn);
    reactiveEffect.run()
};
