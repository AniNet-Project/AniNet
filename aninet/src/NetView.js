import React from 'react'
import { Network, Node, Edge } from 'react-vis-network'
import './NetView.css'
import Header from './Header.js'
import { Redirect } from 'react-router-dom';

function exportToJson(objectData) {
  let filename = "export.json";
  let contentType = "application/json;charset=utf-8;";
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(objectData)))], { type: contentType });
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    var a = document.createElement('a');
    a.download = filename;
    a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(objectData, null, 2));
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function buildFileSelector(netview) {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('multiple', 'multiple');
  fileSelector.setAttribute('accept', '.json')
  fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    let file = fileList[0]
    let reader = new FileReader()
    reader.onload = () => {
      netview.setState({'info': JSON.parse(reader.result)})
    }
    if (file !== undefined) {
      reader.readAsText(file)
    }
  })
  return fileSelector;
}

class UploadBtn extends React.Component {
  componentDidMount(){
    this.fileSelector = buildFileSelector(this.props.netview);
  }
  
  handleFileSelect = (e) => {
    e.preventDefault();
    this.fileSelector.click();
  }
  
  render(){
    return <button onClick={this.handleFileSelect}>Upload JSON</button>
  }
}


class ToolBar extends React.Component {
  render() {
    let parent = this.props.parent
    return (
      <div className="toolbar">
        <div className="container">
          <div className="rightside">
            <UploadBtn netview={parent}/>
            <button onClick={() => {exportToJson(parent.state.info)}}>Download JSON</button>
          </div>
        </div>
      </div>
    )
  }
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function createInfoBoard(pos, node) {
  let board = document.createElement("div")
  board.setAttribute("class", "infoBoard")
  board.setAttribute("style", "top:"+pos.y+"px; left:"+pos.x+"px")
  board.innerHTML = `
  <div class="content">
    <img src="${('image' in node) ? node.image : ''}" alt="Image Not Found"/>
    <div class="name">
      ${node.label}
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

let net_options = {
  physics: {
    enabled: true, 
    forceAtlas2Based: {
      gravitationalConstant: -500,
      centralGravity: 0.01,
      springConstant: 0,
      springLength:100,
    }
  },
}

class NetView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      info: {},
      infoBoard: null,
    }
  }

  componentDidMount() {
    let item = this.props.item
    let url = "data/" + item.data
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          isLoaded: true,
          info: data
        })
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        })
      })
  }

  handlePopup(params) {
    let board = this.state.infoBoard
    const select_node = (params.nodes.length > 0)
    let pos = params.pointer.DOM
    const _pading = {x: 30, y: -30}
    pos = {x: pos.x+_pading.x, y: pos.y+_pading.y}

    let create_board = () => {
      let node_id = params.nodes[0]
      let node = this.state.info.data.nodes.find((n) => (n.id == node_id))
      return createInfoBoard(pos, node)
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
          <ToolBar parent={this}/>
          <div className="netView">
            <div className="container">
              <div className="canvas-wrap">
                <Network
                  options={net_options}
                  onClick={(params) => {this.handlePopup(params)}}
                >
                  {info.data.nodes.map(n => (
                    <Node key={n.id}
                      id={n.id} label={n.label}
                      shape="circularImage"
                      image={n.image}
                    />
                  ))}
                  {info.data.edges.map((e) => { 
                    let arrows = ""
                    if (('direction' in e) && (e['direction'] === true)) { arrows = "to" }
                    return (
                        <Edge key={e.id} id={e.id} arrows={arrows}
                              from={e.from} to={e.to} label={e.label} />
                    )
                  })}
                </Network>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default NetView
