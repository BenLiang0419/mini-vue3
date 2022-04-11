import { getCurrentInstance } from "./component";

// 场景1： 父组件 存， 子组件 取 ==> 存到provides里面
// 场景2： 父组件 存， 子孙组件 取 ==> provides指定父类的provides
// 场景3:  当在中间层组件中使用了 provide

export const provide = (key, value) => {

    // 存值

    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        let { provides } = currentInstance

        // init
        if (provides === currentInstance.parent.provides) {
            // 原型指向父类的provides, 创建一个新的
            provides = currentInstance.provides = Object.create(currentInstance.provides)
        }

        provides[key] = value
    }
};

export const inject = (key) => {

    // 取值

    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        // 父类里面拿
        const { parent } = currentInstance
        const { provides } = parent

        return provides[key]
    }
};

