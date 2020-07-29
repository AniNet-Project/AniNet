import React from 'react'
import './NetView.css'
import Header from './Header.js'
import { exportToJson } from './utils.js'
import NetView from './NetView.js'

function buildFileSelector(parent) {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('multiple', 'multiple');
  fileSelector.setAttribute('accept', '.json')
  fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    let file = fileList[0]
    let reader = new FileReader()
    reader.onload = () => {
      parent.setState({'data': JSON.parse(reader.result)})
    }
    if (file !== undefined) {
      reader.readAsText(file)
    }
  })
  return fileSelector;
}

class UploadBtn extends React.Component {
  componentDidMount(){
    this.fileSelector = buildFileSelector(this.props.parent);
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
            <UploadBtn parent={parent}/>
            <button onClick={() => {exportToJson(parent.state.info, "export.json")}}>Download JSON</button>
          </div>
        </div>
      </div>
    )
  }
}


class NetPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      data: {},
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
          data: data
        })
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        })
      })
  }

  render() {
    let item = this.props.item
    const { error, isLoaded, data } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <div>
          <Header title={item.name}/>
          <ToolBar parent={this}/>
          <NetView data={data}/>
        </div>
      )
    }
  }
}

export default NetPage
