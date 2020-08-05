import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

import './NetView.css'
import Header from './Header'
import { exportToJson } from './utils'
import NetView from './NetView'
import {NetItem, ItemInfo, NodeType, EdgeType, CatType} from './datatypes'
import { NodeGrid, EdgeGrid, CatGrid } from './EditGrid'


function buildFileSelector(parent: React.Component) {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('multiple', 'multiple');
  fileSelector.setAttribute('accept', '.json')
  fileSelector.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement
    let file: File = (target.files as FileList)[0]
    let reader = new FileReader()
    reader.onload = () => {
      parent.setState({'data': JSON.parse(reader.result as string)})
    }
    if (file !== undefined) {
      reader.readAsText(file)
    }
  })
  return fileSelector;
}

type UploadBtnProps = {
  parent: NetPage,
}

type UploadBtnState = {
  fileSelector: HTMLInputElement,
}

class UploadBtn extends React.Component<UploadBtnProps, UploadBtnState> {
  componentDidMount(){
    this.setState({
      fileSelector: buildFileSelector(this.props.parent)
    })
  }
  
  handleFileSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    this.state.fileSelector.click();
  }
  
  render(){
    return <button onClick={this.handleFileSelect}>上传数据 (JSON)</button>
  }
}

type ToolBarProps = {
  parent: NetPage
}


class ToolBar extends React.Component<ToolBarProps, object> {
  render() {
    let parent = this.props.parent
    return (
      <div className="toolbar">
        <div className="rightside">
          <UploadBtn parent={parent}/>
          <button onClick={() => {exportToJson(parent.state.info, "export.json")}}>下载数据 (JSON)</button>
        </div>
      </div>
    )
  }
}


const preProcessInfo = (info: ItemInfo) => {
  let new_edges: Array<EdgeType> = []
  for (let e of info.data.edges) {
    if (!('direction' in e)) {
      e.direction = false
    }
    new_edges.push(e)
  }
  info.data.edges = new_edges
  return info
}


type NetPageProps = {
  item: NetItem
}

type NetPageState = {
  error: null | Error,
  isLoaded: boolean,
  info: ItemInfo | null,
}


class NetPage extends React.Component<NetPageProps, NetPageState> {
  constructor(props: NetPageProps) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      info: null,
    }
  }

  componentDidMount() {
    let item = this.props.item
    let url = item.url
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        let info = preProcessInfo(data)
        this.setState({
          isLoaded: true,
          info: info
        })
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        })
      })
  }

  setNodes(nodes: Array<NodeType>) {
    let info = this.state.info
    if (info !== null) {
      info.data.nodes = nodes
      this.setState({info: info})
    }
  }

  setEdges(edges: Array<EdgeType>) {
    let info = this.state.info
    if (info !== null) {
      info.data.edges = edges
      this.setState({info: info})
    }
  }

  setCategories(categories: Record<string, CatType>) {
    let info = this.state.info
    if (info != null) {
      info.categories = categories
      this.setState({info: info})
    }
  }

  render() {
    let item = this.props.item
    const { error, isLoaded, info } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <div>
          <Header title={item.name}/>
          <div className="container">
          <ToolBar parent={this}/>
          <Tabs>
            <TabList>
              <Tab>网络视图</Tab>
              <Tab>节点(Nodes)</Tab>
              <Tab>边(Edges)</Tab>
              <Tab>节点类别</Tab>
            </TabList>
            <TabPanel>
              <NetView info={info as ItemInfo}/>
            </TabPanel>
            <TabPanel>
              <NodeGrid nodes={(info as ItemInfo).data.nodes} setNodes={this.setNodes.bind(this)}/>
            </TabPanel>
            <TabPanel>
              <EdgeGrid edges={(info as ItemInfo).data.edges} setEdges={this.setEdges.bind(this)}/>
            </TabPanel>
            <TabPanel>
              <CatGrid cats={(info as ItemInfo).categories} setCats={this.setCategories.bind(this)}/>
            </TabPanel>
          </Tabs>
          </div>
        </div>
      )
    }
  }
}

export default NetPage
