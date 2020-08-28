/**
 * Modified from this:
 *   https://material-ui.com/zh/components/slider/#custom-marks
 */
import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

import { TimePoint } from './datatypes';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 400,
    },
    margin: {
      height: theme.spacing(3),
    },
  }),
);

type TimeSliderProps = {
    time: number,
    timePoints: Array<TimePoint>,
    setTime: (t: number) => void,
}

export default (props: TimeSliderProps) => {
  if (props.timePoints.length < 2) { return (<></>) }
  const classes = useStyles();

  let i = -1;
  const marks = props.timePoints.map(t => {
    i += 1
    return {
      value: i,
      label: t.label
    }
  })

  const handleChange = (event: any, newValue: number | number[]) => {
    const t = newValue as number
    props.setTime(t)
  }

  return (
    <div className={classes.root+" timeSlider"}>
        <div className="label">时间轴</div>
        <div className="slider">
          <Slider
            defaultValue={props.time}
            aria-labelledby="discrete-slider-custom"
            min={0}
            max={props.timePoints.length-1}
            step={null}
            valueLabelDisplay="off"
            marks={marks}
            onChange={handleChange}
          />
      </div>
    </div>
  );
}
