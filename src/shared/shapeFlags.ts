
export const enum ShapeFlags {
    ELEMENT = 1,
    STATEFUL_COMPONENT = 1 << 1,
    TEXT_CHILDREN = 1 << 2, 
    ARRAY_CHILDREN = 1 << 3
};

// 二进制运算符
// 1        -->   0001   -->   1
// 1 >> 1   -->   0010   -->   2
// 1 >> 2   -->   0100   -->   4
// 1 >> 3   -->   1000   -->   8

// 修改
// 0001 | 1000  ==> 1001
// 0001 | 0100  ==> 0101

// 查找
// 1001 & 0001  ==> 0001