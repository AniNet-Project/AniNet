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
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';

import { Network, Node, Edge } from 'react-vis-network'
import { dragElement } from './utils'
import { ItemInfo, NodeType, EdgeType, CatType } from './datatypes'


const getCanvas = () => document.getElementsByTagName("canvas")[0]


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
        <Tooltip title="编辑视图配置" placement="top">
          <EditIcon onClick={() => {this.handleClickOpen()}}/>
        </Tooltip>
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

type SearchDialogProps = {
  queryAndFocus: (q: string) => void,
}

type SearchDialogState = {
  open: boolean,
  queryText: string,
}

class SearchDialog extends React.Component<SearchDialogProps, SearchDialogState> {
  constructor(props: SearchDialogProps) {
    super(props)
    this.state = {
      open: false,
      queryText: "",
    }
  }

  handleClickOpen() {
    this.setState({open: true})
  };

  handleClose() {
    this.setState({open: false})
  };

  handleClickSearch() {
    const q = this.state.queryText
    this.props.queryAndFocus(q)
    this.setState({open: false, queryText: ""})
  }

  textChanged(event: any) {
    this.setState({
      queryText: event.target.value
    })
  }

  render() {
    return (
      <>
        <Tooltip title="搜索" placement="top">
          <SearchIcon onClick={() => this.handleClickOpen()}/>
        </Tooltip>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogContent id="searchDialog">
            <InputBase
              value={this.state.queryText}
              onChange={(e) => this.textChanged(e)}
              placeholder="输入节点标签（如，label:苍崎青子）或ID（如，id:1）"
            />
            <IconButton type="submit" onClick={() => this.handleClickSearch()} >
              <SearchIcon/>
            </IconButton>
          </DialogContent>
        </Dialog>
      </>
    )
  }
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

  focusOn(x: number, y: number) {
    console.log("focus on: " + x + "," + y)
    const canvas = getCanvas()
    const context = canvas.getContext('2d')
    if (context !== null) {
      context.scale(2,2)
    }
  }

  queryNodesAndFocus(q:string) {
    const nodes = this.queryNodes(q)
    if (nodes.length === 0) {return}
    const network = this.state.netRef.current.network
    const nodes_id = nodes.map(n => n.id)
    network.selectNodes(nodes_id)
    if (nodes.length > 1) {
      network.fit(nodes_id, {animation: true})
    } else {
      network.focus(nodes_id[0], {scale: 1, animation: true})
    }
  }

  render() {
    return (
      <div className="netView">
        <div className="canvas-wrap" id="full-screen-region">
          {this.createNetwork()}
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
