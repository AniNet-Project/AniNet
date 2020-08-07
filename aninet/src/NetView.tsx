import React, { useState } from 'react'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

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


const ViewControl = () => {
  const [fullScreenMode, setFullScreenMode] = useState(false)
  let oriHeight = 300

  const enterFullScreen = () => {
    let canvas = document.getElementsByTagName("canvas")[0]
    let fullRegion = document.getElementById("full-screen-region")
    fullRegion?.requestFullscreen()
    oriHeight = canvas.clientHeight
    canvas.style.height = window.screen.height + "px";
    setFullScreenMode(true)
    document.addEventListener('fullscreenchange', (event) => {
      if (!(document.fullscreenElement)) {
        turnBackSize()
        setFullScreenMode(false)
      }
    });
  }

  const turnBackSize = () => {
    let canvas = document.getElementsByTagName("canvas")[0]
    canvas.style.height = oriHeight + "px"
  }

  const exitFullScreen = () => {
    document.exitFullscreen()
    turnBackSize()
    setFullScreenMode(false)
  }

  return (
    <div className="viewControl">
      {fullScreenMode
      ? <FullscreenExitIcon onClick={exitFullScreen}/>
      : <FullscreenIcon onClick={enterFullScreen}/>
      }
    </div>
  )
}

const DEFAULT_NETWORK_OPTIONS = {
  autoResize: false,
  nodes: {
    shape: "dot",
  },
  physics: {
    stabilization: false,
    solver: 'forceAtlas2Based',
    forceAtlas2Based: {
      gravitationalConstant: -20,
      centralGravity: 0.002,
      springLength: 100,
      springConstant: 0.01
    },
  },
  edges: {
    width: 0.3,
  },
  interaction: {
    hideEdgesOnDrag: false,
    hover: true,
  }
}

type NetViewProps = {
  info: ItemInfo
}

type NetViewState = {
  infoBoard: HTMLDivElement | null,
  netRef: any,
}

export default class NetView extends React.Component<NetViewProps, NetViewState> {
  constructor(props: NetViewProps) {
    super(props)
    this.state = {
      infoBoard: null,
      netRef: React.createRef()
    }
  }

  handlePopup (params: any) {
    const select_node = (params.nodes.length > 0)
    let pos: Pos2d = params.pointer.DOM
    const _pading: Pos2d = {x: 30, y: -30}
    pos = {x: pos.x+_pading.x, y: pos.y+_pading.y}

    const create_board = () => {
      let node_id = params.nodes[0]
      let node = this.props.info.data.nodes.find((n) => (n.id === node_id))
      return createInfoBoard(pos, node as NodeType, this.props.info.categories)
    }

    let board = this.state.infoBoard
    if (select_node && (board === null)) {
      this.setState({infoBoard: create_board()})
    } else if (select_node && (board !== null)) {
      (board as HTMLDivElement).remove()
      this.setState({infoBoard: create_board()})
    } else if (board !== null ) {
      board.remove()
      this.setState({infoBoard: null})
    }
  }

  componentDidMount() {
    let network = this.state.netRef.current.network
    network.setOptions(DEFAULT_NETWORK_OPTIONS)
  }

  createNetwork() {
    let info = this.props.info
    return (
      <Network ref={this.state.netRef} onClick={(params: any) => {this.handlePopup(params)}} >
        {info.data.nodes.map(n => createNode(n, info.categories))}
        {info.data.edges.map((e) => createEdge(e))}
      </Network>
    )
  }

  render() {
    return (
      <div className="netView">
        <div className="canvas-wrap" id="full-screen-region">
          {this.createNetwork()}
          <ViewControl/>
        </div>
      </div>
    )
  }
}
