import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

import './NetPage.css'
import Header from './Header'
import Footer from './Footer'
import ToolBar from './ToolBar'
import NetView from './NetView'
import TimeSlider from './TimeSlider'
import {NetItem, TimePoint, ItemInfo, NodeType, EdgeType, CatType} from './datatypes'
import { NodeGrid, EdgeGrid, CatGrid } from './EditGrid'
import Comments from './Comments'



const preProcessInfo = (info: ItemInfo) => {
  let new_nodes: Array<NodeType> = []
  for (let n of info.data.nodes) {
    n.id = parseInt(String(n.id))
    new_nodes.push(n)
  }
  info.data.nodes = new_nodes
  return info
}


type NetPageProps = {
  item: NetItem
}

type NetPageState = {
  error: null | Error,
  isLoaded: boolean,
  timesInfo: Array<ItemInfo>,
  currentTime: number,
  timePoints: Array<TimePoint>,
  nodeCache: Array<Record<number, NodeType>>
}


class NetPage extends React.Component<NetPageProps, NetPageState> {
  constructor(props: NetPageProps) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      timesInfo: [],
      currentTime: 0,
      timePoints: [],
      nodeCache: [],
    }
  }

  componentDidMount() {
    let item = this.props.item
    let timepoints: Array<TimePoint> = []
    if (typeof item.url === "string") {
      timepoints.push({label: "common", url: item.url})
    } else {
      timepoints = item.url
    }
    this.setState({timesInfo: new Array(timepoints.length)})
    Promise.all(
      timepoints.map((t) => fetch(t.url).then(resp => resp.json()))
    )
    .then( infos_ => {
      const infos = infos_ as [ItemInfo]
      this.setState({
        isLoaded: true,
        timesInfo: infos.map(info => preProcessInfo(info)),
        timePoints: timepoints,
        nodeCache: infos.map(info => {
          let cache: Record<number, NodeType> = {}
          for (const n of info.data.nodes) {
            cache[n.id] = n
          }
          return cache
        })
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
    let times = this.state.timesInfo
    let info = times[this.state.currentTime]
    if (info !== null) {
      info.data.nodes = nodes
      this.setState({timesInfo: times})
    }
  }

  setEdges(edges: Array<EdgeType>) {
    let times = this.state.timesInfo
    let info = times[this.state.currentTime]
    if (info !== null) {
      info.data.edges = edges
      this.setState({timesInfo: times})
    }
  }

  setCategories(categories: Record<string, CatType>) {
    let times = this.state.timesInfo
    let info = times[this.state.currentTime]
    if (info != null) {
      info.categories = categories
      this.setState({timesInfo: times})
    }
  }

  setInfo(info: ItemInfo) {
    let times = this.state.timesInfo
    times[this.state.currentTime] = info
    this.setState({timesInfo: times})
  }

  setCurrentTime(t: number) {
    this.setState({currentTime: t})
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

    const times = this.state.timesInfo
    const info = times[this.state.currentTime]
    const nodeCache = this.state.nodeCache[this.state.currentTime]
    const nodes = info.data.nodes
    const toggle = (cond: boolean) => reverse ? (!cond) : cond
    try {
      if (query_type === "id") {
        const n = nodeCache[parseInt(query_text)]
        if (n !== undefined) {
          res.push(n)
        }
      } else {
        const pattern = new RegExp(query_text)
        for (let n of nodes) {
          if (!(query_type in n)) {continue}
          const val = (n as any)[query_type]
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

  render() {
    let item = this.props.item
    const { error, isLoaded, timesInfo, currentTime } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      const info = timesInfo[currentTime]
      return (
        <div>
          <Header title={item.name}/>
          <div className="container">
          <ToolBar
            info={info}
            setInfo={this.setInfo.bind(this)}
            queryNodes={this.queryNodes.bind(this)}
            />
          <div className="tabs">
            <Tabs>
              <TabList>
                <Tab>网络视图</Tab>
                <Tab>节点(Nodes)</Tab>
                <Tab>边(Edges)</Tab>
                <Tab>节点类别</Tab>
              </TabList>
              <TabPanel forceRender={true}>
                <NetView
                  info={info}
                  setNodes={this.setNodes.bind(this)}
                  queryNodes={this.queryNodes.bind(this)}
                  />
              </TabPanel>
              <TabPanel forceRender={true}>
                <NodeGrid nodes={info.data.nodes} setNodes={this.setNodes.bind(this)}/>
              </TabPanel>
              <TabPanel forceRender={true}>
                <EdgeGrid edges={info.data.edges} setEdges={this.setEdges.bind(this)}/>
              </TabPanel>
              <TabPanel forceRender={true}>
                <CatGrid cats={info.categories} setCats={this.setCategories.bind(this)}/>
              </TabPanel>
            </Tabs>
          </div>

          <TimeSlider
            time={this.state.currentTime}
            timePoints={this.state.timePoints}
            setTime={this.setCurrentTime.bind(this)}
          />

          <Comments issueTerm={item.name}/>

          </div>
          <Footer/>
        </div>
      )
    }
  }
}

export default NetPage
