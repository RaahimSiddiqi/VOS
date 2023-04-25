import React from 'react';
import { Slider, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Box } from '@mui/material';
import { useDropzone } from 'react-dropzone'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ImageIcon from '@mui/icons-material/Image';
import { useMediaUpload } from '../../components';
interface ControllerProps {
  activeFile: File | undefined;
  onSubmit: (file: File) => any;
}


const Controller: React.FC<ControllerProps> = ({ activeFile, onSubmit }) => {
  const [model, setModel] = React.useState('YOLOv8');
  const [imageSize, setImageSize] = React.useState(640);
  const [confidence, setConfidence] = React.useState(0.5);
  const [iou, setiou] = React.useState(0.5);
  const background = useMediaUpload({
    uploadIcon: <ImageIcon />,
  });
  const handleSegmentClick = async () => {
    const params = { model, imageSize, confidence, iou, backgroundFile : background.file };
    //make request to server with params. server returns a file object
    const output_file = new File(["Meow Meow"], "Meow.txt") //sample file
    onSubmit(output_file);
  };
  return (
    <form style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 20, paddingBottom: 20 }}>

      <FormControl>
        <InputLabel>Model</InputLabel>
        <Select sx={{ width: 150, mr: 3 }} value={model} label='Model' onChange={(event) => setModel(event.target.value)}>
          <MenuItem value='YOLOv5'>
            YOLOv5
          </MenuItem>
          <MenuItem value='YOLOv8'>
            YOLOv8
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>Image Size</InputLabel>
        <Select sx={{ width: 150 }} value={imageSize} label='Image Size' onChange={(event) => setImageSize(event.target.value as number)}>
          <MenuItem value={320}>320</MenuItem>
          <MenuItem value={640}>640</MenuItem>
        </Select>
      </FormControl>

      <Box mt={5}>
        <Typography variant='h6' gutterBottom >Confidence Threshold</Typography>
        <Slider
          value={confidence}
          onChange={(event, newValue) => setConfidence(newValue as number)}
          valueLabelDisplay="auto"
          min={0.01}
          step={0.01}
          max={1}
        />
      </Box>

      <Box mt={5}>
        <Typography variant='h6' gutterBottom >IOU Threshold</Typography>
        <Slider
          value={iou}
          onChange={(event, newValue) => setiou(newValue as number)}
          valueLabelDisplay="auto"
          min={0.01}
          step={0.01}
          max={1}
        />
      </Box>

      <Box mt={5}>
        <Typography variant='h6' gutterBottom >Background</Typography>
        <ul>
          <li>
            <Typography variant='body1' gutterBottom>Upload an image.</Typography>
            <background.Dropzone style = {{ width : 200, height : 100, border : 'dashed gray 1px', borderRadius : '6%'}}/>
          </li>
          <li>
            <Typography variant='body1' gutterBottom>Choose a color</Typography>
          </li>
        </ul>
      </Box>
      <button onClick={background.open}>Click</button>
    </form>
  );
};

export default Controller;