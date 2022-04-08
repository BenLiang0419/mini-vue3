
// vue3的基本启动配置
import { createApp } from '../../lib/mini-vue.esm.js';
import { App } from './App.js';

const container = document.querySelector('#app');
createApp(App).mount(container);