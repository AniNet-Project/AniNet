import React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputBase from '@material-ui/core/InputBase';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';


import { mergeInfo } from './utils'
import { SourceItem, ItemInfo } from './datatypes'


type setInfoMth = (info: ItemInfo) => void

type ImportDialogProps = {
  setInfo: setInfoMth,
  info: ItemInfo,
}
type ImportDialogState = {
  open: boolean,
  sourceUrl: string,
  items: Array<SourceItem>,
  selected: null | SourceItem
}


export default class ImportDialog extends React.Component<ImportDialogProps, ImportDialogState> {

  constructor(props: ImportDialogProps) {
    super(props)
    this.state = {
      open: false,
      sourceUrl: "https://raw.githubusercontent.com/AniNet-Project/crawler/master/data/bgm.json",
      items: [],
      selected: null,
    }
  }

  handleClickOpen() {
    this.setState({open: true})
    if (this.state.items.length === 0) {
      this.loadSource()
    }
  };

  handleClose() {
    this.setState({open: false})
  };

  sourceChanged(event: any) {
    this.setState({
      sourceUrl: event.target.value
    })
    this.loadSource()
  }

  loadSource() {
    fetch(this.state.sourceUrl)
      .then(res => res.json())
      .then(data => {
        this.setState({
          items: data.data
        })
      },
      (error) => {
        console.log(error)
        this.setState({
          items: []
        })
      })
  }

  onSelectedChange(event: any, newValue: SourceItem | null) {
    this.setState({
      selected: newValue
    })
  }

  loadItem() {
    if (this.state.selected === null) {return}
    const url = this.state.selected.data
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const newInfo = mergeInfo(this.props.info, data)
        this.props.setInfo(newInfo)
      },
      (error) => {
        console.log(error)
      })
    this.handleClose()
  }

  handleClickConfirm() {
    this.loadItem()
  }

  render() {
    return (
      <>
        <button onClick={() => this.handleClickOpen()}>导入预定义数据</button>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">从数据源导入</DialogTitle>

          <DialogContent id="importDialog">
            <Typography gutterBottom>
              数据源
            </Typography>
            <InputBase
              value={this.state.sourceUrl}
              onChange={(e) => this.sourceChanged(e)}
              placeholder="请输入数据源索引文件 URL"
            />
            <Typography gutterBottom>
              条目
            </Typography>
            <Autocomplete
              value={this.state.selected}
              onChange={(e, n) => {this.onSelectedChange(e, n)}}
              id="import-items-filter"
              options={this.state.items}
              getOptionLabel={(item: SourceItem) => item.name}
              renderInput={(params: any) => <TextField {...params} label="筛选" variant="outlined" />}
            />

            <DialogActions>
              <Button onClick={() => {this.handleClose()}} color="primary">
                取消
              </Button>
              <Button onClick={() => {this.handleClickConfirm()}} color="primary">
                确定
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      </>
    )
  }

}

