import React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

import { ItemInfo, NodeType } from './datatypes'
import { LineParser } from './edgeMarkup'
import DraggablePaper from './DraggablePaper'
import { CustomSwitch } from './Customs'


type Props = {
  info: ItemInfo,
  setInfo: (info:ItemInfo) => void,
  queryNodes: (q: string, reverse: boolean) => Array<NodeType>
}
type State = {
  open: boolean,
  content: string,
  markers: Array<any>,
  showId: boolean,
}


export default class EdgeMarkDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: false,
      content: "",
      markers: [],
      showId: false,
    }
  }

  handleClickOpen() {
    this.setText()
    this.setState({open: true})
  };

  handleClose() {
    this.setState({open: false})
  };

  textChanged(newValue: any) {
    this.setState({
      content: newValue
    })
  }

  setText() {
    let texts = ""
    for (const e of this.props.info.data.edges) {
      if (this.state.showId === true) {
        texts += "(id:" + e.from + ")" +
                 "--" + e.label + (e.direction === false ? "--" : "-->" ) +
                 "(id:" + e.to + ")\n"
      } else {
        const label_from = this.props.queryNodes("id:"+e.from, false)[0].label
        const label_to = this.props.queryNodes("id:"+e.to, false)[0].label
        texts += label_from +
                 "--" + e.label + (e.direction === false ? "--" : "-->" ) +
                 label_to + "\n"
      }
    }
    this.setState({
      content: texts
    })
  }

  showIdChange(e: any) {
    this.setState({
      showId: e.target.checked
    }, () => {
      this.setText()
    })
  }

  processLines() {
    const lines = this.state.content.split(/\r?\n/)
    let edges = []
    let markers = []
    let idx = 0
    let tipText = ""

    for (const line of lines) {
      if (line.replace(/^\s+|\s+$/g, '').length === 0) {
        continue
      }
      const res = LineParser.parse(line)
      if (res.status === true) {
        const e = res.value
        // query from
        const nodes_from = this.props.queryNodes(e.from, false)
        const nodes_to = this.props.queryNodes(e.to, false)
        if ((nodes_from.length >= 1) && (nodes_to.length >= 1)) {
          if ((nodes_from.length > 1) || (nodes_to.length > 1)) {
            // ambiguous label
            markers.push({
              startRow: idx,
              endRow: idx,
              startCol: 0,
              endCol: line.length,
              className: 'mark-query-ambiguous',
              type: "text",
            })
            tipText += "含有带有歧义的标签。"
          }
          const n_from = nodes_from[0]
          const n_to = nodes_to[0]
          const edge = {
            id: idx,
            from: n_from.id,
            to: n_to.id,
            label: e.label,
            direction: e.directed,
          }
          edges.push(edge)
        } else {
          // query error
          markers.push({
            startRow: idx,
            endRow: idx,
            startCol: 0,
            endCol: line.length,
            className: 'mark-query-error',
            type: "text",
          })
          tipText += "含有无法匹配的标签。"
        }
      } else {
        // syntax error
        markers.push({
          startRow: idx,
          endRow: idx,
          startCol: 0,
          endCol: line.length,
          className: 'mark-syntax-error',
          type: "text",
        })
        tipText += "含有错误的语法。"
      }
      idx += 1;
    }
    let info = Object.assign({}, this.props.info)
    info.data.edges = edges
    this.props.setInfo(info)
    this.setState({
      markers: markers
    })

    if (tipText.length > 0) { tipText+="请检查！" }
    let tip = document.getElementById("edit-edgemark-tips")
    if (tip !== null) {
      tip.innerHTML = tipText
      tip.style.color = "#ff3333"
      tip.style.fontSize = "10px"
    }
  }

  refresh() {
    try {
      this.processLines()
    } catch(err) {
      console.log(err)
    }
  }

  handleClickConfirm() {
    this.refresh()
    this.handleClose()
  }

  handleClickRefersh() {
    this.refresh()
  }


  render() {
    return (
      <div className="EditOptionsDialog">
        <button onClick={() => this.handleClickOpen()}>描述边(Edges)</button>
        <Dialog
          open={this.state.open}
          onClose={() => {this.handleClose()}}
          PaperComponent={DraggablePaper}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle
            id="draggable-dialog-title"
            style={{ cursor: 'move' }}
          >
            描述边(Edges)
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              通过简单的标记语言对边进行描述, 语法见<a href="/#contribute">如何贡献页面 1.1.1 小节</a>。
            </DialogContentText>

            <FormControlLabel
              control={
                <CustomSwitch
                  checked={this.state.showId}
                  onChange={(e) => {this.showIdChange(e)}}
                  name="showIdCheck"
                />
              }
              label="显示节点ID"
              labelPlacement="start"
            />

            <p id="edit-edgemark-tips"> </p>
            <AceEditor
              value={this.state.content}
              mode="text"
              theme="github"
              onChange={this.textChanged.bind(this)}
              width="550px"
              height="400px"
              fontSize={20}
              markers={this.state.markers}
              ref='aceEditor'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {this.handleClose()}} color="primary">
              取消
            </Button>
            <Button onClick={() => {this.handleClickRefersh()}} color="primary">
              刷新
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
