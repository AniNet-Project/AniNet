import React from 'react'

import { exportToJson } from './utils'
import {NetItem, TimePoint, ItemInfo, NodeType, EdgeType, CatType} from './datatypes'

type setInfoMth = (info: ItemInfo) => void

const buildFileSelector = (setInfo: setInfoMth) => {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('multiple', 'multiple');
  fileSelector.setAttribute('accept', '.json')
  fileSelector.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement
    let file: File = (target.files as FileList)[0]
    let reader = new FileReader()
    reader.onload = () => {
      setInfo(JSON.parse(reader.result as string))
    }
    if (file !== undefined) {
      reader.readAsText(file)
    }
  })
  return fileSelector;
}

type UploadBtnProps = {
  setInfo: setInfoMth
}

type UploadBtnState = {
  fileSelector: HTMLInputElement,
}

class UploadBtn extends React.Component<UploadBtnProps, UploadBtnState> {
  componentDidMount(){
    this.setState({
      fileSelector: buildFileSelector(this.props.setInfo)
    })
  }
  
  handleFileSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    this.state.fileSelector.click();
  }
  
  render(){
    return <button onClick={this.handleFileSelect}>打开文件 (JSON)</button>
  }
}

type ToolBarProps = {
  info: ItemInfo,
  setInfo: setInfoMth,
}


export default class ToolBar extends React.Component<ToolBarProps, object> {
  render() {
    return (
      <div className="toolbar">
        <div className="rightside">
          <UploadBtn setInfo={this.props.setInfo}/>
          <button onClick={() => {exportToJson(this.props.info, "export.json")}}>保存文件 (JSON)</button>
        </div>
      </div>
    )
  }
}
