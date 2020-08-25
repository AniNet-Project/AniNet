export type NetItem = {
  name: string,
  title_img: string,
  url: string
}

export type NodeType = {
  label: string,
  image: string,
  id: number,
  categorie: string,
  info: string,
  link: string,
}

export type EdgeType = {
  id: number,
  label: string,
  from: number,
  to: number,
  direction?: boolean,
}

export type ItemInfo = {
  categories: Record<string, CatType>,
  data: {
    nodes: Array<NodeType>,
    edges: Array<EdgeType>,
  }
}

export type CatType = {
  label: string,
  color: string
}

export type Pos2d = {
  x: number,
  y: number
}
