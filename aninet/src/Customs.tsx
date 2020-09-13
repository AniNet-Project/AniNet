
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';

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


export {CustomSwitch}
