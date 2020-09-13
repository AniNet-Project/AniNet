import React from 'react'
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';

export default (props: PaperProps) => {
  return (
    <Draggable handle={"#"+props["aria-labelledby"]} cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

