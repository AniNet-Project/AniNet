import React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";


import { ItemInfo, NodeType } from './datatypes'
import { LineParser } from './edgeMarkup'

type Props = {
  info: ItemInfo,
  setInfo: (info:ItemInfo) => void,
  queryNodes: (q: string, reverse: boolean) => Array<NodeType>
}
type State = {
  open: boolean,
  content: string,
  markers: Array<any>,
}

export default class EdgeMarkDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: false,
      content: "",
      markers: [],
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
      texts += "(id:" + e.from + ")" +
               "--" + e.label + (e.direction == false ? "--" : "-->" ) +
               "(id:" + e.to + ")\n"
    }
    this.setState({
      content: texts
    })
  }

  processLines() {
    const lines = this.state.content.split(/\r?\n/)
    let edges = []
    let markers = []
    let idx = 0
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
      }
      idx += 1;
    }
    let info = Object.assign({}, this.props.info)
    info.data.edges = edges
    this.props.setInfo(info)
    this.setState({
      markers: markers
    })
  }

  handleClickConfirm() {
    try {
      this.processLines()
    } catch(err) {
      console.log(err)
    }
  }

  render() {
    return (
      <div className="EditOptionsDialog">
        <button onClick={() => this.handleClickOpen()}>描述边(Edges)</button>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">描述边(Edges)</DialogTitle>
          <DialogContent>
            <DialogContentText>
              通过简单的标记语言对边进行描述, 语法见<a>帮助</a>
            </DialogContentText>
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
            <Button onClick={() => {this.handleClickConfirm()}} color="primary">
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
