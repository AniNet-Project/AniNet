import React from 'react'
import { Network, Node, Edge } from 'react-vis-network'
import { dragElement } from './utils'
import { ItemInfo, NodeType, EdgeType, CatType } from './datatypes'

const createInfoBoard = (pos: Pos2d, node: NodeType, cats: Record<string, CatType>) => {
  let board = document.createElement("div")
  board.setAttribute("class", "infoBoard")
  board.setAttribute("style", "top:"+pos.y+"px; left:"+pos.x+"px")
  let cat = cats[node.categorie]
  board.innerHTML = `
  <div class="content">
    <img src="${('image' in node) ? node.image : ''}" alt=""/>
    <div class="title">
      <div class="name">
        ${node.label}
      </div>
      <div class="categorie" style="${(cat !== undefined) && ('color' in cat) ? 'color:'+ cat.color : ''}">
        ${(cat !== undefined) ? cat.label : ""}
      </div>
    </div>
    <div class="describe">
      ${node.info}
    </div>
    ${'link' in node ? '<a class="link" href="'+node.link+'">' + "链接</a>": ""}
  </div>
  `
  dragElement(board)
  document.getElementsByClassName("canvas-wrap")[0].appendChild(board)
  return board
}

type NetViewPorps = {
  info: ItemInfo
}

type NetViewState = {
  infoBoard: HTMLDivElement | null
}

type Pos2d = {
  x: number,
  y: number
}

const DefaultNetStyle = {
  NodeColor: "#66bbff",
  NodeBorderWidth: 3,
}


const createNode = (n: NodeType, catgories: Record<string, CatType>) => {
  let cat = catgories[n.categorie]
  let color;
  if (cat) {
    color = cat.color
  } else {
    color = DefaultNetStyle.NodeColor
  }
  return (
    <Node key={n.id}
      id={n.id} label={n.label}
      shape="circularImage"
      image={n.image}
      color={color}
      borderWidth={DefaultNetStyle.NodeBorderWidth}
    />
  )
}

const createEdge = (e: EdgeType) => {
  let arrows = ""
  if (('direction' in e) && (e['direction'] === true)) { arrows = "to" }
  return (
    <Edge key={e.id} id={e.id} arrows={arrows}
          from={e.from} to={e.to} label={e.label}
    />
  )
}

export default class NetView extends React.Component<NetViewPorps, NetViewState> {
  constructor(props: NetViewPorps) {
    super(props)
    this.state = {
      infoBoard: null,
    }
  }

  handlePopup(params: any) {
    let board = this.state.infoBoard
    const select_node = (params.nodes.length > 0)
    let pos: Pos2d = params.pointer.DOM
    const _pading: Pos2d = {x: 30, y: -30}
    pos = {x: pos.x+_pading.x, y: pos.y+_pading.y}

    let create_board = () => {
      let node_id = params.nodes[0]
      let node = this.props.info.data.nodes.find((n) => (n.id === node_id))
      return createInfoBoard(pos, node as NodeType, this.props.info.categories)
    }

    if (select_node && (board === null)) {
      board = create_board()
      this.setState({'infoBoard': board})
    } else if (select_node && (board !== null)) {
      board.remove()
      board = create_board()
      this.setState({'infoBoard': board})
    } else if (board !== null) {
      board.remove()
      this.setState({'infoBoard': null})
    }
  }

  render() {
    let info = this.props.info
    return (
      <div className="netView">
        <div className="canvas-wrap">
          <Network
            onClick={(params: any) => {this.handlePopup(params)}}
          >
            {info.data.nodes.map(n => createNode(n, info.categories))}
            {info.data.edges.map((e) => createEdge(e))}
          </Network>
        </div>
      </div>
    )
  }
}
