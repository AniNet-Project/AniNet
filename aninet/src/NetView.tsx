import React, { useState, useEffect } from 'react'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { FullScreen, FullScreenHandle, useFullScreenHandle } from 'react-full-screen'

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

type ViewControlProps = {
  fullScreenHandle: FullScreenHandle
}

const ViewControl = (props: ViewControlProps) => {
  const [fullScreenMode, setFullScreenMode] = useState(false)
  let oriHeight = 300

  const enterFullScreen = () => {
    props.fullScreenHandle.enter()
    let canvas = document.getElementsByTagName("canvas")[0]
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
    props.fullScreenHandle.exit()
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

type NetViewPorps = {
  info: ItemInfo
}


export default (props: NetViewPorps) => {
  const [infoBoard, setInfoBoard] = useState<HTMLDivElement | null>(null)
  const [netRef, setNetRef] = useState<any>(React.createRef)
  const fullScreenHandle = useFullScreenHandle()

  const createNetwork = () => {
    let info = props.info
    return (
      <Network ref={netRef} onClick={(params: any) => {handlePopup(params)}} >
        {info.data.nodes.map(n => createNode(n, info.categories))}
        {info.data.edges.map((e) => createEdge(e))}
      </Network>
    )
  }

  const handlePopup = (params: any) => {
    let board = infoBoard
    const select_node = (params.nodes.length > 0)
    let pos: Pos2d = params.pointer.DOM
    const _pading: Pos2d = {x: 30, y: -30}
    pos = {x: pos.x+_pading.x, y: pos.y+_pading.y}

    let create_board = () => {
      let node_id = params.nodes[0]
      let node = props.info.data.nodes.find((n) => (n.id === node_id))
      return createInfoBoard(pos, node as NodeType, props.info.categories)
    }

    if (select_node && (board === null)) {
      board = create_board()
      setInfoBoard(board)
    } else if (select_node && (board !== null)) {
      board.remove()
      board = create_board()
      setInfoBoard(board)
    } else if (board !== null) {
      board.remove()
      setInfoBoard(null)
    }
  }

  useEffect(() => {
    let network = netRef.current.network
    network.setOptions({
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
        arrows: {
          scaleFactor: 0.5
        },
        alpha: 0.6
      },
      interaction: {
        hideEdgesOnDrag: (props.info.data.nodes.length > 20),
        hover: true,
      }
    })
    network.moveTo([100, 0])
  })

  return (
    <div className="netView">
      <FullScreen handle={fullScreenHandle}>
        <div className="canvas-wrap">
          {createNetwork()}
          <ViewControl fullScreenHandle={fullScreenHandle}/>
        </div>
      </FullScreen>
    </div>
  )
}
