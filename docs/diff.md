
# Diff

ToBePathed: 新节点需要进行对比的长度

newIndexToOldIndexMap: 获取新节点需要进行中间对比的index索引

0 1  2 3 4  5
a b (e f d) g
a b (d e f) g 

diff

* 经过左侧对比，index的位置是2
* 经过右侧对比，新节点位置是 e1 = 4, e2 = 4
* index位置大于e1，且 index少于等e2，证明着新节点比旧节点的要多，所以要新增节点
* index位置大于新节点e1，证明新节点少于旧节点，需要减少旧节点上的。
* 两种情况都不是的话，需要进行中间对比

diff middle

* 获取`新节点`需要对比的节点长度toBePatched = e2 - s2 + 1 (索引需要加1)
* 获取新节点中需要中间对比的节点的key和索引关系 -> keyToNewIndexMap
* 生成新节点需要映射索引的Array(toBePatched) -> newIndexToOldIndexMap
* 循环需要中间对比的旧节点
* 利用旧节点的key值去keyToNewIndexMap找相对应的key值，获取对应的索引nextIndex
* 如果旧节点是没有这个key值的，就需要在新节点上进行遍历isSomeVNodeType(n1, n2)，知道对应的索引nextIndex
* 如果nextIndex为空，证明着新节点里面不需要用到，需要进行删除hostRemove()
* 如果nextIndex不为空，此时需要新旧节点进行patch一下
* 此时也需要把新节点的索引假加入到对应的newIndexToOldIndexMap中。
* 旧节点循环后，此时会得到了newIndexToOldIndexMap
* 利用算法最长子序列算法LIS得到对应的索引列表
  
