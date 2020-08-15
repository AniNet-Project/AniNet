import React from 'react'
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Checkbox from '@material-ui/core/Checkbox';


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

  handlePressEnter(event: any) {
    if (event.key === "Enter") {
      this.handleClickSearch()
    }
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
              onKeyPress={(e) => this.handlePressEnter(e)}
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


type FilterDialogProps = {
  queryAndFilter: (q: string, reverse: boolean) => void,
  reset: () => void,
}

type FilterDialogState = {
  open: boolean,
  queryText: string,
  reverse: boolean,
}

class FilterDialog extends React.Component<FilterDialogProps, FilterDialogState> {
  constructor(props: FilterDialogProps) {
    super(props)
    this.state = {
      open: false,
      queryText: "",
      reverse: true,
    }
  }

  handleClickOpen() {
    this.setState({open: true})
  };

  handleClose() {
    this.setState({open: false})
  };

  handleClickFilter() {
    const q = this.state.queryText
    this.props.queryAndFilter(q, this.state.reverse)
    this.setState({open: false, queryText: ""})
  }

  handleClickReset() {
      this.props.reset()
      this.setState({open: false, queryText: ""})
  }

  textChanged(event: any) {
    this.setState({
      queryText: event.target.value
    })
  }

  handlePressEnter(event: any) {
    if (event.key === "Enter") {
      this.handleClickFilter()
    }
  }

  handleChangeReverse(event: any) {
    this.setState({
      reverse: event.target.checked
    })
  }

  render() {
    return (
      <>
        <Tooltip title="筛选" placement="top">
          <FilterListIcon onClick={() => this.handleClickOpen()}/>
        </Tooltip>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogContent id="filterDialog">
            <InputBase
              value={this.state.queryText}
              onChange={(e) => this.textChanged(e)}
              onKeyPress={(e) => this.handlePressEnter(e)}
              placeholder="用于筛选的属性和正则表达式（如：categorie:person）"
            />
            <IconButton type="submit" onClick={() => this.handleClickFilter()} >
              <Tooltip title="筛选" placement="top">
                <FilterListIcon/>
              </Tooltip>
            </IconButton>
            <IconButton type="submit" onClick={() => this.handleClickReset()} >
              <Tooltip title="重置" placement="top">
                <AutorenewIcon/>
              </Tooltip>
            </IconButton>
            <Tooltip title="反选" placement="top">
              <Checkbox checked={this.state.reverse} onChange={(e) => this.handleChangeReverse(e)}/>
            </Tooltip>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}

export { EditOptionsDialog, SearchDialog, FilterDialog }
