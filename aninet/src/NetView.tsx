import React, { useState } from 'react'
import Draggable from 'react-draggable';
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Tooltip from '@material-ui/core/Tooltip';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import CloseIcon from '@material-ui/icons/Close';

import { EditOptionsDialog, SearchDialog } from './Dialogs'
import { shorterString } from './utils'
import { Network, Node, Edge } from 'react-vis-network'
import { ItemInfo, NodeType, EdgeType, CatType } from './datatypes'


const getCanvas = () => document.getElementsByTagName("canvas")[0]

type infoBoardProps = {
  pos: Pos2d,
  node: NodeType,
  cats: Record<string, CatType>,
  close: () => void,
}

const InfoBoard = (props: infoBoardProps) => {
  const node = props.node
  const pos = props.pos
  let cat = props.cats[node.categorie]
  const boardStyle = {
    top: pos.y + "px",
    left: pos.x + "px",
  }
  const catStyle = 'color' in cat ? {color: cat.color} : {}
  return (
    <Draggable>
      <div className="infoBoard" style={boardStyle}>
        <CloseIcon className="closeButton" onClick={() => props.close()} />
        <div className="content">
          <img src={('image' in node) ? node.image : ''} alt=""/>
          <div className="title">
            <div className="name">
              {node.label}
            </div>
            <div className="categorie" style={catStyle}>
              {(cat !== undefined) ? cat.label : ""}
            </div>
          </div>
          <div className="describe">
            { shorterString(node.info, 80) }
          </div>
          {
            'link' in node ?
            <a className="link" href={node.link}>链接</a> :
            null
          }
        </div>
      </div>
    </Draggable>
  )
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
  setOpt: (opt: any) => void,
  getOpt: () => any,
  captureImg: () => void,
  queryAndFocus: (q: string) => void,
}

const ViewControl = (props: ViewControlProps) => {
  const [fullScreenMode, setFullScreenMode] = useState(false)
  let oriHeight = 300

  const enterFullScreen = () => {
    let canvas = getCanvas()
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
    let canvas = getCanvas()
    canvas.style.height = oriHeight + "px"
  }

  const exitFullScreen = () => {
    document.exitFullscreen()
    turnBackSize()
    setFullScreenMode(false)
  }

  return (
    <div className="viewControl">
      <SearchDialog queryAndFocus={props.queryAndFocus}/>
      <Tooltip title="截图" placement="top"><PhotoCameraIcon onClick={() => props.captureImg()}/></Tooltip>
      <EditOptionsDialog setOpt={props.setOpt} getOpt={props.getOpt}/>
      {fullScreenMode
      ? <Tooltip title="退出全屏" placement="top"><FullscreenExitIcon onClick={exitFullScreen}/></Tooltip>
      : <Tooltip title="全屏" placement="top"><FullscreenIcon onClick={enterFullScreen}/></Tooltip>
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
    enabled: true,
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
  infoBoard: JSX.Element | null,
  netRef: any,
  netOptions: any,
}

export default class NetView extends React.Component<NetViewProps, NetViewState> {
  constructor(props: NetViewProps) {
    super(props)
    this.state = {
      infoBoard: null,
      netRef: React.createRef(),
      netOptions: null
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
      return <InfoBoard pos={pos} node={node as NodeType}
                        cats={this.props.info.categories}
                        close={() => (this.setState({infoBoard: null}))}/>
    }

    let board = this.state.infoBoard
    if (select_node && (board === null)) {
      this.setState({infoBoard: create_board()})
    } else if (select_node && (board !== null)) {
      this.setState({infoBoard: create_board()})
    } else if (board !== null ) {
      this.setState({infoBoard: null})
    }
  }

  setNetOptions(options: any) {
    let network = this.state.netRef.current.network
    network.setOptions(options)
    this.setState({netOptions: options})
  }

  getNetOptions() {
    return this.state.netOptions
  }

  componentDidMount() {
    this.setNetOptions(DEFAULT_NETWORK_OPTIONS)
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

  captureImg() {
    const canvas = getCanvas()
    // Fill the canvas background, see: 
    //   https://stackoverflow.com/questions/50104437/set-background-color-to-save-canvas-chart
    const context = canvas.getContext('2d')
    if (context !== null) {
      context.save()
      context.globalCompositeOperation = 'destination-over'
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.restore()
    }

    const img = canvas.toDataURL("image/png", 1.0)
    const url = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream')
    let a = document.createElement('a');
    a.download = "network.png";
    a.href = url
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  queryNodes(q:string) {
    let query_type = "label"
    let query_text = ""
    const items = q.split(":")
    if (items.length === 1) {
      query_text = items[0]
    } else if (items.length === 2) {
      query_type = items[0]
      query_text = items[1].trim()
    } else {
      return []
    }
    let res = []
    const nodes = this.props.info.data.nodes
    const pattern = new RegExp(query_text)
    for (let n of nodes) {
      if (!(query_type in n)) {continue}
      const val = (n as any)[query_type]
      if (query_type === "id") {
        if (val === parseInt(query_text)) {
          res.push(n)
        }
      } else {
        if (pattern.test(String(val))) {
          res.push(n)
        }
      }
    }
    return res
  }

  queryNodesAndFocus(q:string) {
    const nodes = this.queryNodes(q)
    if (nodes.length <= 0) {return}
    const network = this.state.netRef.current.network
    network.selectNodes([])
    const nodes_id = nodes.map(n => n.id)
    if (nodes.length > 1) {
      network.fit({nodes: nodes_id, animation: true})
    } else {
      network.focus(nodes_id[0], {scale: 1, animation: true})
    }
    network.selectNodes(nodes_id)
  }

  render() {
    return (
      <div className="netView">
        <div className="canvas-wrap" id="full-screen-region">
          {this.createNetwork()}
          {this.state.infoBoard}
          <ViewControl
            setOpt={this.setNetOptions.bind(this)}
            getOpt={this.getNetOptions.bind(this)}
            captureImg={this.captureImg.bind(this)}
            queryAndFocus={this.queryNodesAndFocus.bind(this)}
          />
        </div>
      </div>
    )
  }
}
