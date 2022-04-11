
// vue3的基本启动配置
import { createRenderer } from '../../lib/mini-vue.esm.js';
import { App } from './App.js';

console.log(PIXI)
let app = new PIXI.Application({ width: 640, height: 360 });

document.body.appendChild(app.view)

const renderer = createRenderer({
    createElement(type) {
        if (type === 'com') {
            const grap = new PIXI.Graphics()
            grap.beginFill(0xff0000);
            grap.drawRect(0, 0, 200, 100);
            grap.endFill()
            return grap
        }
    },
    patchProps(el, key, value) {
        el[key] = value
    },
    insert(el, container) {
        container.addChild(el)
    }
})

renderer.createApp(App).mount(app.stage)
// const container = document.querySelector('#app');
// createApp(App).mount(container);