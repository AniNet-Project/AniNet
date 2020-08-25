import React, { useState } from 'react'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Tooltip from '@material-ui/core/Tooltip';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { Network as NetworkType, IdType } from 'vis/index'


import { EditOptionsDialog, SearchDialog, FilterDialog, TuneDialog, SettingDialog } from './Dialogs'
import { Network, Node, Edge } from 'react-vis-network'
import { ItemInfo, NodeType, EdgeType, CatType, Pos2d } from './datatypes'
import InfoBoard from './InfoBoard'
import CircularProgress from './CircularProgressWithLabel'


const getCanvas = () => document.getElementsByTagName("canvas")[0]


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
  queryAndFilter: (q: string, reverse: boolean) => void,
  reset: () => void,
  inforBoardSwitch: boolean,
  setInforBoardSwitch: (on: boolean) => void,
  hiddenUnselectedSwitch: boolean,
  setHiddenUnselectedSwitch: (on: boolean) => void,
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
      <FilterDialog queryAndFilter={props.queryAndFilter} reset={props.reset}/>
      <Tooltip title="截图" placement="top"><PhotoCameraIcon onClick={() => props.captureImg()}/></Tooltip>
      <TuneDialog setOpt={props.setOpt} getOpt={props.getOpt}/>
      <EditOptionsDialog setOpt={props.setOpt} getOpt={props.getOpt}/>
      <SettingDialog
        inforBoardSwitch={props.inforBoardSwitch}
        setInforBoardSwitch={props.setInforBoardSwitch}
        hiddenUnselectedSwitch={props.hiddenUnselectedSwitch}
        setHiddenUnselectedSwitch={props.setHiddenUnselectedSwitch}
      />
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
    color: {
      inherit: "to"
    }
  },
  interaction: {
    hideEdgesOnDrag: false,
    hover: true,
    multiselect: true,
  }
}

type NetViewProps = {
  info: ItemInfo,
  setNodes: (nodes: Array<NodeType>) => void,
}

type NetworkRef = {
  network: NetworkType
}

type NetViewState = {
  infoBoard: JSX.Element | null,
  loadingRatio: number,
  inforBoardSwitch: boolean,
  netRef: React.RefObject<NetworkRef>,
  netOptions: any,
  oldNodes: Array<NodeType>,
  hiddenUnselectedSwitch: boolean,
}

export default class NetView extends React.Component<NetViewProps, NetViewState> {
  constructor(props: NetViewProps) {
    super(props)
    this.state = {
      infoBoard: null,
      loadingRatio: 0,
      inforBoardSwitch: true,
      netRef: React.createRef(),
      netOptions: null,
      oldNodes: props.info.data.nodes,
      hiddenUnselectedSwitch: false
    }
  }

  setHiddenUnselectedSwitch(on: boolean) {
    const oldState = this.state.hiddenUnselectedSwitch
    if ((oldState === true) && (on === false)) {
      this.resetNodes()
    } else if((oldState === false) && (on === true)) {
      this.hiddenNonSelected()
    }
    this.setState({
      hiddenUnselectedSwitch: on
    })
  }

  handlePopup (params: any) {
    const network = (this.state.netRef.current as NetworkRef).network
    const node_id = network.getNodeAt(params.pointer.DOM)
    const select_node = (typeof node_id !== "undefined")
    console.log(node_id)
    const pos: Pos2d = {x: 20, y: 20}

    const create_board = () => {
      let node = this.props.info.data.nodes.find((n) => (n.id === node_id))
      return <InfoBoard pos={pos} node={node as NodeType}
                        cats={this.props.info.categories}
                        close={() => (this.setState({infoBoard: null}))}/>
    }

    let board = this.state.infoBoard
    if (select_node && (board === null) && this.state.inforBoardSwitch) {
      this.setState({infoBoard: create_board()})
    } else if (select_node && (board !== null) && this.state.inforBoardSwitch) {
      this.setState({infoBoard: create_board()})
    } else if (board !== null ) {
      this.setState({infoBoard: null})
    }
  }

  handleHidden(params: any) {
    if (!(this.state.hiddenUnselectedSwitch)) {return}
    const select_node = (params.nodes.length > 0)
    if (select_node) {
      this.hiddenNonSelected()
    } else {
      this.resetNodes()
    }
  }

  handleClick(params: any) {
    this.handlePopup(params)
    this.handleHidden(params)
  }

  setInforBoardSwitch(on: boolean) {
    this.setState({
      inforBoardSwitch: on
    })
  }

  setNetOptions(options: any) {
    let network = (this.state.netRef.current as NetworkRef).network
    network.setOptions(options)
    this.setState({netOptions: options})
  }

  getNetOptions() {
    return this.state.netOptions
  }

  componentDidMount() {
    this.setNetOptions(DEFAULT_NETWORK_OPTIONS)
    this.registerLoading()
  }

  createNetwork() {
    let info = this.props.info
    const network = (
      <>
      {this.createLoadindBar()}
      <Network ref={this.state.netRef} onClick={(params: any) => {this.handleClick(params)}} >
        {info.data.nodes.map(n => createNode(n, info.categories))}
        {info.data.edges.map((e) => createEdge(e))}
      </Network>
      </>
    )
    return network
  }

  createLoadindBar() {
    return (
      <div id="progressBar">
        <CircularProgress variant="determinate" value={this.state.loadingRatio * 100}/>
      </div>
    )
  }

  registerLoading() {
    // https://jsfiddle.net/api/post/library/pure/
    const self = this
    const ref = (this.state.netRef.current as NetworkRef).network
    ref.on("stabilizationProgress", function (params: any) {
      const ratio = params.iterations / params.total;
      self.setState({loadingRatio: ratio})
    })
    ref.once("stabilizationIterationsDone", function () {
      self.setState({loadingRatio: 1})
    })
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

  queryNodes(q:string, reverse:boolean = false) {
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
    const toggle = (cond: boolean) => reverse ? (!cond) : cond
    try {
      const pattern = new RegExp(query_text)
      for (let n of nodes) {
        if (!(query_type in n)) {continue}
        const val = (n as any)[query_type]
        if (query_type === "id") {
          if (toggle(val === parseInt(query_text))) {
            res.push(n)
          }
        } else {
          if (toggle(pattern.test(String(val)))) {
            res.push(n)
          }
        }
      }
      return res
    } catch(e) {
      console.log(e)
      return []
    }
  }

  queryNodesAndFocus(q:string) {
    const nodes = this.queryNodes(q)
    if (nodes.length <= 0) {return}
    const network = (this.state.netRef.current as NetworkRef).network
    network.selectNodes([])
    const nodes_id = nodes.map(n => String(n.id))
    if (nodes.length > 1) {
      network.fit({nodes: nodes_id, animation: true})
    } else {
      network.focus(nodes_id[0], {scale: 1, animation: true})
    }
    network.selectNodes(nodes_id)
  }

  queryNodesAndFilter(q:string, reverse:boolean) {
    const nodes = this.queryNodes(q, reverse)
    this.props.setNodes(nodes)
  }

  resetNodes() {
    this.props.setNodes(this.state.oldNodes)
  }

  getSelectedClosure() {
    const network = (this.state.netRef.current as NetworkRef).network
    const selected = network.getSelectedNodes()
    let closure: Set<IdType> = new Set();
    for (const nid of selected) {
      closure.add( parseInt(String(nid)) )
      const connected = network.getConnectedNodes(nid)
      for (const nid2 of (connected as IdType[])) {
        closure.add( parseInt(String(nid2)) )
      }
    }
    return closure
  }

  hiddenNonSelected() {
    this.resetNodes()
    const closure = this.getSelectedClosure()
    let nodes = []
    for (const n of this.state.oldNodes) {
      if (closure.has(n.id)) {
        nodes.push(n)
      }
    }
    this.props.setNodes(nodes)
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
            queryAndFilter={this.queryNodesAndFilter.bind(this)}
            reset={this.resetNodes.bind(this)}
            inforBoardSwitch={this.state.inforBoardSwitch}
            setInforBoardSwitch={this.setInforBoardSwitch.bind(this)}
            hiddenUnselectedSwitch={this.state.hiddenUnselectedSwitch}
            setHiddenUnselectedSwitch={this.setHiddenUnselectedSwitch.bind(this)}
          />
        </div>
      </div>
    )
  }
}
