export type NetItem = {
  name: string,
  titleImg: string,
  url: string | Array<TimePoint>,
}

export type TimePoint = {
  label: string,
  url: string,
}

export type NodeType = {
  id: number,
  label: string,
  image: string,
  categorie: string,
  info: string,
  link: string,
}

export type EdgeType = {
  id: number,
  label: string,
  from: number,
  to: number,
  direction: boolean,
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

export type SourceItem = {
  id: string,
  name: string,
  data: string,
}
