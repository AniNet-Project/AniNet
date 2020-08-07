import React, { useState } from 'react'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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

type EditOptionsDialogProps = {
  setOpt: (opt: any) => void,
  getOpt: () => any,
}

type EditOptionsDialogState = {
  open: boolean,
  content: string,
}

class EditOptionsDialog extends React.Component<EditOptionsDialogProps, EditOptionsDialogState> {
  constructor(props: EditOptionsDialogProps) {
    super(props)
    this.state = {
      open: false,
      content: ""
    }
  }

  handleClickOpen() {
    this.setState({open: true})
    this.setTextArea()
  };

  handleClose() {
    this.setState({open: false})
  };

  setTextArea() {
    let opt = this.props.getOpt()
    let content = JSON.stringify(opt, null, 2)
    this.setState({content: content})
  }

  textChanged(event: any) {
    this.setState({
      content: event.target.value
    })
  }

  handleClickConfirm() {
    let options;
    try {
      options = JSON.parse(this.state.content)
      this.props.setOpt(options)
      this.setState({open: false})
    } catch(err) {
      console.log(err)
      let ta = document.getElementById("edit-options-content")
      if (ta !== null) {
        ta.style.border = "2px solid #ff3333"
      }
      let tip = document.getElementById("edit-options-tips")
      console.log(tip)
      if (tip !== null) {
        tip.innerHTML = "JSON 解析失败，请检查。"
        tip.style.color = "#ff3333"
        tip.style.fontSize = "10px"
      }
    }
  }

  render() {
    return (
      <div className="EditOptionsDialog">
        <EditIcon onClick={() => {this.handleClickOpen()}}/>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">编辑网络视图配置</DialogTitle>
          <DialogContent>
            <DialogContentText>
              直接通过 JSON 对网络视图进行配置，可配置项目细节可以参考
              <a href="https://visjs.github.io/vis-network/docs/network/">vis-network 文档</a> 。
            </DialogContentText>
            <p id="edit-options-tips"> </p>
            <textarea id="edit-options-content"
              rows={18} cols={72}
              value={this.state.content}
              onChange={(e) => {this.textChanged(e)}}
              />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {this.handleClose()}} color="primary">
              取消
            </Button>
            <Button onClick={() => {this.handleClickConfirm()}} color="primary">
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

type ViewControlProps = {
  setOpt: (opt: any) => void,
  getOpt: () => any
}

const ViewControl = (props: ViewControlProps) => {
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
      <Tooltip title="编辑视图配置" placement="top">
        <EditOptionsDialog setOpt={props.setOpt} getOpt={props.getOpt}/>
      </Tooltip>
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

  render() {
    return (
      <div className="netView">
        <div className="canvas-wrap" id="full-screen-region">
          {this.createNetwork()}
          <ViewControl
            setOpt={this.setNetOptions.bind(this)}
            getOpt={this.getNetOptions.bind(this)}
          />
        </div>
      </div>
    )
  }
}
