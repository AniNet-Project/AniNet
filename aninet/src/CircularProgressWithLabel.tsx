/** Come from:
 *     https://material-ui.com/zh/components/progress/#circular-with-label
 */

import React from 'react';
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export default (props: CircularProgressProps & { value: number }) => {
  if (props.value >= 100) {
    return (<></>)
  }
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="textSecondary">
          {`${Math.round( props.value,)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
