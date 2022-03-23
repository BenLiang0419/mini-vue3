
# effect

功能：收集依赖（观察者 -> 收集依赖），通知收集的依赖（通知观察者 -> 触发依赖）

提供三个重要的Function

effect是将传入的函数转化为reactiveEffect格式的函数

track主要功能是将reactiveEffect添加为`target[key]`的观察者

trigger主要功能是通知`target[key]`的观察者（将观察者队列函数一一取出来执行）
