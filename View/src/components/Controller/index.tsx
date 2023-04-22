import React from 'react';
import { Slider, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid } from '@mui/material';


interface ControllerProps {
    activeFile : File | undefined;
    onSubmit : (file : File) => any;
}
const Controller: React.FC<ControllerProps> = ({ activeFile, onSubmit }) => {
  const [model, setModel] = React.useState('YOLOv8');
  const [imageSize, setImageSize] = React.useState(640);
  const [confidence, setConfidence] = React.useState(0.5);
  const [iou, setIOU] = React.useState(0.5);

  const handleSegmentClick = async () => {
    const params = {model, imageSize, confidence, iou};
    //make request to server with params. server returns a file object
    const output_file = new File(["Meow Meow"], "Meow.txt") //sample file
    onSubmit(output_file);
  };
  return (
    <form>
      <Grid container spacing = {4}>
        <Grid item xs={6}>
          <FormControl>
            <InputLabel>Model</InputLabel>
            <Select sx={{mr:3, width : 150}} value={model} label='Model' onChange={(event) => setModel(event.target.value)}>
              <MenuItem value="YOLOv5">YOLOv5</MenuItem>
              <MenuItem value="YOLOv8">YOLOv8</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <InputLabel>Image Size</InputLabel>
            <Select sx={{width : 150}} value={imageSize} label='Image Size' onChange={(event) => setImageSize(event.target.value as number)}>
              <MenuItem value={320}>320</MenuItem>
              <MenuItem value={640}>640</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item display='flex' alignItems='center' xs={12} md={6}>
          <Typography gutterBottom >Confidence Threshold</Typography>
          <Slider
            value={confidence}
            onChange={(event, newValue) => setConfidence(newValue as number)}
            valueLabelDisplay="auto"
            min={0.01}
            step={0.01}
            max={1}
          />
        </Grid>
        <Grid item display='flex' alignItems='center' xs={12} md={6}>
          <Typography gutterBottom>IOU Threshold</Typography>
          <Slider value={iou} onChange={(event, newValue) => setIOU(newValue as number)} valueLabelDisplay="auto" min={0} step={0.01} max={0.95} />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSegmentClick}>
            Segment
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default Controller;