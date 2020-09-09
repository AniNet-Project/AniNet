import React, {useState} from 'react'
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
import TuneIcon from '@material-ui/icons/Tune';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import FormControlLabel from '@material-ui/core/FormControlLabel';


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


const defaultOpt = (oldOpt: any) => {
  const opt = Object.assign({}, oldOpt)
  if (!("physics" in opt)) { opt.physics = {} }
  opt.physics.solver = "forceAtlas2Based"
  let atlas;
  if (!("forceAtlas2Based" in opt.physics)) {
    atlas = {}
    opt.physics.forceAtlas2Based = atlas
  } else {
    atlas = opt.physics.forceAtlas2Based
  }
  const defaults = {
    gravitationalConstant: -20,
    centralGravity: 0.002,
    springLength: 100,
    springConstant: 0.01,
  }
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in atlas)) {
      atlas[k] = v
    }
  }
  if (!("edges" in opt)) { opt.edges = {} }
  if (!("font" in opt.edges)) { opt.edges.font = {} }
  if (!("size" in opt.edges.font)) { opt.edges.font.size = 14 }
  return opt
}


type sliderProps = {
  setOpt: (opt: any) => void,
  getOpt: () => any,
}

const GravitationalConstantSlider = (props: sliderProps) => {
  const opt = defaultOpt(props.getOpt())
  let atlas = opt.physics.forceAtlas2Based
  const [value, setValue] = useState(atlas.gravitationalConstant)

  const handleChange = (event: any, newValue: number | number[]) => {
    atlas.gravitationalConstant = newValue
    setValue(newValue)
    props.setOpt(opt)
  }

  return (
    <>
      <Typography gutterBottom>
        引力常数
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        min={-100}
        max={0}
        valueLabelDisplay="auto"
        aria-labelledby="continuous-slider"
      />
    </>
  )
}

const SpringConstantSlider = (props: sliderProps) => {
  const opt = defaultOpt(props.getOpt())
  let atlas = opt.physics.forceAtlas2Based
  const [value, setValue] = useState(Math.log10(atlas.springConstant))

  const handleChange = (event: any, newValue: number | number[]) => {
    const newVal = 10**(newValue as number)
    atlas.springConstant = newVal
    setValue(newValue as number)
    props.setOpt(opt)
  }

  const labelFormat = (value: number) => {
    return "1e^" + value
  }

  return (
    <>
      <Typography gutterBottom>
        弹簧常数
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        step={0.5}
        min={-5}
        max={0}
        valueLabelDisplay="auto"
        valueLabelFormat={labelFormat}
        aria-labelledby="non-linear-slider"
      />
    </>
  )
}

const CustomSwitch = withStyles({
  switchBase: {
    color: "#3f51b5",
    '&$checked': {
      color: "#3f51b5",
    },
    '&$checked + $track': {
      backgroundColor: "#3f51b5",
    },
  },
  checked: {},
  track: {},
})(Switch);


const PhysicsSwitch = (props: sliderProps) => {
  const opt = defaultOpt(props.getOpt())
  const [value, setValue] = useState(opt.physics.enabled)

  const handleChange = (event: any) => {
    const checked = event.target.checked
    opt.physics.enabled = checked
    setValue(checked)
    props.setOpt(opt)
  }

  return (
    <>
      <Typography gutterBottom>
        物理效果
      </Typography>
      <CustomSwitch checked={value} onChange={handleChange} name="physicsCheck" />
    </>
  )

}


const HiddenEdgeLabelSwitch = (props: sliderProps) => {
  const opt = defaultOpt(props.getOpt())
  const [value, setValue] = useState(opt.edges.font.size === 0)

  const handleChange = (event: any) => {
    const checked = event.target.checked
    if (checked) {
      opt.edges.font.size = 0
    } else {
      opt.edges.font.size = 14
    }
    setValue(checked)
    props.setOpt(opt)
    console.log(opt)
  }

  return (
    <>
      <Typography gutterBottom>
        隐藏边标签
      </Typography>
      <CustomSwitch checked={value} onChange={handleChange} name="hiddenEdgeLabelCheck" />
    </>
  )

}


type TuneDialogProps = {
  setOpt: (opt: any) => void,
  getOpt: () => any,
}
type TuneDialogState = {
  open: boolean
}

class TuneDialog extends React.Component<TuneDialogProps, TuneDialogState> {
  constructor(props: TuneDialogProps) {
    super(props)
    this.state = {
      open: false,
    }
  }

  handleClickOpen() {
    this.setState({open: true})
  };

  handleClose() {
    this.setState({open: false})
  };

  render() {
    return (
      <>
        <Tooltip title="视图调整" placement="top">
          <TuneIcon onClick={() => this.handleClickOpen()}/>
        </Tooltip>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">网络视图调整</DialogTitle>
          <DialogContent id="tuneDialog">
            <PhysicsSwitch
              setOpt={this.props.setOpt}
              getOpt={this.props.getOpt}/>
            <GravitationalConstantSlider
              setOpt={this.props.setOpt}
              getOpt={this.props.getOpt}/>
            <SpringConstantSlider
              setOpt={this.props.setOpt}
              getOpt={this.props.getOpt}/>
            <HiddenEdgeLabelSwitch
              setOpt={this.props.setOpt}
              getOpt={this.props.getOpt}/>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}


const InforBoardSwitch = (props: {switchState: boolean, setSwitch: (on: boolean) => void}) => {
  const handleChange = (event: any) => {
    const checked = event.target.checked
    props.setSwitch(checked)
  }

  return (
    <FormControlLabel
      control={<CustomSwitch checked={props.switchState} onChange={handleChange} name="inforBoardCheck" />}
      label="弹出信息"
      labelPlacement="start"
    />
    
  )
}


const HiddenUnselectedSwitch = (props: {switchState: boolean, setSwitch: (on: boolean) => void}) => {
  const handleChange = (event: any) => {
    const checked = event.target.checked
    props.setSwitch(checked)
  }

  return (
    <FormControlLabel
      control={<CustomSwitch checked={props.switchState} onChange={handleChange} name="hiddenUnselectedCheck" />}
      label="隐藏未选中节点"
      labelPlacement="start"
    />
    
  )
}


type SettingDialogProps = {
  inforBoardSwitch: boolean,
  setInforBoardSwitch: (on: boolean) => void,
  hiddenUnselectedSwitch: boolean,
  setHiddenUnselectedSwitch: (on: boolean) => void,
}
type SettingDialogState = {
  open: boolean
}

class SettingDialog extends React.Component<SettingDialogProps, SettingDialogState> {
  constructor(props: SettingDialogProps) {
    super(props)
    this.state = {
      open: false
    }
  }

  handleClickOpen() {
    this.setState({open: true})
  };

  handleClose() {
    this.setState({open: false})
  };

  render() {
    return (
      <>
        <Tooltip title="设置" placement="top">
          <SettingsIcon onClick={() => this.handleClickOpen()}/>
        </Tooltip>
        <Dialog open={this.state.open} onClose={() => {this.handleClose()}} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">设置</DialogTitle>
          <DialogContent id="tuneDialog">
            <InforBoardSwitch
              switchState={this.props.inforBoardSwitch}
              setSwitch={this.props.setInforBoardSwitch}
            />
            <HiddenUnselectedSwitch
              switchState={this.props.hiddenUnselectedSwitch}
              setSwitch={this.props.setHiddenUnselectedSwitch}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }
}

export {
  EditOptionsDialog, SearchDialog,
  FilterDialog, TuneDialog, SettingDialog,
}
