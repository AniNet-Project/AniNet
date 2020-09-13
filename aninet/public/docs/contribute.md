## 1 网络的创建与修改

网络的创建可以通过两种方式：

### 1.1 通过页面内编辑器创建与修改

在视图页面中可以通过点击视图上方的 tab 切换到：
`节点`、`边`、`节点类别` 三种类型数据的编辑器，
通过编辑内部的表格就可以实现对于数据的创建与修改。
修改完成后记得点击页面内的**保存数据**按钮进行保存，
最好在编辑过程中多次保存，以免切换页面导致结果丢失。

### 1.1.1 边标记语言

AniNet 支持使用一种简单的语法对边进行描述。
对于边的操作，使用标记语言相较于直接编辑表格是一种更
便捷的方式。

示例：

引入无向边：
```
迪奥-敌人-承太郎
花京院-朋友-承太郎
```

引入有向边：
```
乔瑟夫-祖父->承太郎
承太郎<-父亲-徐伦
```

使用节点ID精准定位：
```
(id:1)-朋友-(id:2)
```

### 1.1.2 导入预定义数据

由于考虑到创建节点的工作量较大，AniNet 支持从外部
导入程序生存的预定义数据。只需要点击视图右上方的
导入预定义数据按钮，然后弹出对话框，选择合适的数据源
和要导入的数据，点击确定即可。

当然也支持用户自行创建数据源，以目前支持的从 bgm.tv
上爬取到的数据为例子。需要一系列爬取到的数据，以
JSON 格式进行存储（见数据格式小节）。另外还需要一个
index.json 文件来对这些数据进行索引。详情可以参考
[该仓库](https://github.com/AniNet-Project/crawler)。

### 1.2 通过 JSON 文件

在视图页面保存得到的文件为 JSON 格式，它是一个文本文件，
你也可以通过直接编辑或通过程序生成这个 JSON 文件来实现
对于网络的创建与更改。JSON 的具体格式标准参考下文的数据格式一节。

## 2 发布到 AniNet

AniNet 目前是一个 Host 在 GitHub Pages 上的静态网站，
对网站内容本身的修改只能通过 GitHub 工作流完成。

在调整得到合适的 JSON 文件后请将其放置在 [`public/data`](https://github.com/AniNet-Project/AniNet/tree/master/aninet/public/data) 路径下，
如果有图片资源请放置于 [`public/imgs`](https://github.com/AniNet-Project/AniNet/tree/master/aninet/public/imgs) 路径下。

### 2.1 修改 network.json

此外为了使得 AniNet app 能够找到 JSON 文件，
还需要更改 [`network.json`](https://github.com/AniNet-Project/AniNet/blob/master/aninet/public/networks.json)
文件，具体格式请仿照其中的项目配置。

> TODO: CI, CD 尚未搭建

在完成修改后，请通过 PR 方式进行提交，通过后内容会更新到 AniNet。

## 3 数据格式
AniNet 目前使用 [JSON](https://www.json.org/json-en.html) 作为数据的存储格式，每个作品对应于一个 JSON 文件，
其中存储了网络中的边、节点、节点的类别等信息。 JSON 的 TypeScript 类型定义如下：

```typescript
type ItemInfo = {
  categories: Record<string, CatType>,
  data: {
    nodes: Array<NodeType>,
    edges: Array<EdgeType>,
  }
}

type NodeType = {
  id: number,
  label: string,
  image: string,
  categorie: string,
  info: string,
  link: string,
}

type EdgeType = {
  id: number,
  label: string,
  from: number,
  to: number,
  direction: boolean,
}

type CatType = {
  label: string,
  color: string
}

``` 

希望上面的定义能够清晰说明 JSON 应该如何定义，在此之上补充说明几点：

1. `ItemInfo` 定义了 JSON 的类型，`categories` 存储节点的类别（比如：人物、组织、章节），
`nodes` 与 `edge` 存储节点与边。
2. `node` 与 `edge` 中的`id`是唯一标识符，在同一网络内应保存唯一性（`node` 与 `edge` 间也不能重复）。
而 `label` 为展示出的标签，可以重复。
3. `node` 中的 `image` 为该节点对应图片的 URL，`link` 为该节点对应的一个链接。这两个属性可以留空。
4. `edge` 中的 `direction` 表示该边是否有向。

以其中一个作品[《魔法使之夜》](#/network/魔法使之夜)为例，
它的完整 JSON 定义可以参考[此处](https://github.com/Nanguage/AniNet/blob/master/aninet/public/data/MahouTsukaiNoYoru.json)。
