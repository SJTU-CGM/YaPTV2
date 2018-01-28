# YaPTV2： Yet another Phylogenetic Tree Viewer II

YaPTV2是一款系统发生树可视化WebApp。它的前身是YaPTV。YaPTV2基于WebPhyloTree开发，因此比YaPTV多了许多功能，主要有：

* 新增圆形和无根两种展示类型
* 丰富的展示参数，而且可以通过WebPhyloTree的可视化参数调整器进行可视化配置


## 使用方法


### 配置YaPTV2

配置本程序需要3个配置文件：
1. 中心配置文件，文件名必须是`conf.json`，必须与YaPTV2放置于同一个文件夹中。此文件描述了树的展示类型（矩、圆、无根）和另外两个配置文件的文件路径。
2. 树描述文件。JSON格式，描述树的结构（拓扑结构、节点间距、叶节点名称等）。
3. 展示参数文件。JSON格式，描述展示参数，一般由WebPhyloTree的可视化参数调整器导出。

树加载完成的标志是全局变量`HANDLE`已经被定义，而且`HANDLE.ready()`返回`true`。


#### 中心配置文件之格式

```
{
    "tree" : <指向树描述文件的相对路径>,
    "layout": <展示类型，"rectangular"或"circular"或"unrooted">,
    "layout_parameters": <指向展示参数文件的相对路径>
}
```


#### 树描述文件之格式

此文件的格式为JSON。大致的描述如下（如果看不懂请告诉我）

```
Node ::= {
    branch_length : <Float>,
    children : Array< <Node> | <Leaf> >
}

Leaf ::= {
    name : <String>,
    branch_length : <Non-negative Number>
}
```


#### 展示参数文件之格式

虽然是人类可读的，但是一般由WebPhyloTree的可视化参数调整器导出，无需手动编写。


### 连接YaPTV2和你的程序

YaPTV2是作为一个独立的网页而实现的。因此它一般需要搭配<iframe>HTML元素使用。所有此类互动都通过调用绑定至全局变量`HANDLE`的对象的方法进行。


#### 控制选取的叶节点

```TypeScript
HANDLE.setSelection(names : (Array<String> | Set<String>))
HANDLE.getSelection() : Set<String>
```


#### 控制展示区域

```TypeScript
HANDLE.focus(x : float, y : float)
HANDLE.focusItem(itemName : string)
```


#### 控制选区提交

```
HANDLE.setSubmitHandle(handle : procedure)
```
