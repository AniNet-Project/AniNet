export type NetItem = {
  name: string,
  title_img: string,
  data: string
}

export type NodeType = {
  label: string,
  image: string,
  id: Number,
  categories: [string],
  info: string,
  link: string,
}

export type EdgeType = {
  id: Number,
  label: string,
  from: Number,
  to: Number
}

export type ItemInfo = {
  categories: object,
  data: {
    nodes: [NodeType],
    edges: [EdgeType],
  }
}
