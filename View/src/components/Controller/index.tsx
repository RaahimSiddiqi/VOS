import React from 'react';
import { Slider, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Box } from '@mui/material';
import Dropzone, { DropzoneRef, useDropzone } from 'react-dropzone'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ImageIcon from '@mui/icons-material/Image';
import { MediaFilePreview, useMediaUpload } from '../../components';
import { RgbaStringColorPicker  } from "react-colorful";

interface ControllerProps {
  activeFile: File | undefined;
  onSubmit: (file: File) => any;
}

const Controller: React.FC<ControllerProps> = ({ activeFile, onSubmit }) => {
  const [model, setModel] = React.useState('YOLOv8');
  const [imageSize, setImageSize] = React.useState(640);
  const [confidence, setConfidence] = React.useState(0.5);
  const [iou, setiou] = React.useState(0.5);
  const [bgFile, setbgFile] = React.useState<File>();
  const [bgColor, setbgColor] = React.useState("rgba(0, 0, 0, 1)");
  
  const handleSegmentClick = async () => {
    const params = { model, imageSize, confidence, iou};
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
            <Dropzone accept={{
              "image/png": [".png"],
              "image/jpeg": [".jpg", ".jpeg"],
              "image/jpg": [".jpg", ".jpeg"],
              }} 
              onDrop = {acceptedFiles => acceptedFiles && setbgFile(acceptedFiles[0])}>
              
              {({getRootProps, getInputProps}) => (
                <div {...getRootProps({style : {padding: 10, width : 200, height : 100, border : 'dashed gray 1px', borderRadius : '6%', display : 'flex', justifyContent : 'center', alignItems : 'center'}})}>
                  <input {...getInputProps()}/>
                  {!bgFile ? 
                    <ImageIcon/>
                    :
                    <MediaFilePreview file={bgFile}/>
                  }
                </div>
              ) 
              }
            </Dropzone>
            {/* <background.Dropzone style = {{ width : 200, height : 100, border : 'dashed gray 1px', borderRadius : '6%'}}/> */}
          </li>
          <li>
            <Typography variant='body1' gutterBottom>Choose a color</Typography>
            <RgbaStringColorPicker color={bgColor} onChange={setbgColor} />
          </li>
        </ul>
      </Box>
    </form>
  );
};

export default Controller;