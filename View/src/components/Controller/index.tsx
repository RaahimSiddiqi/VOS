import React from 'react';
import { Slider, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Box, FormGroup, FormControlLabel, Checkbox, FormHelperText, SelectChangeEvent, styled } from '@mui/material';
import Dropzone, { DropzoneRef, useDropzone } from 'react-dropzone'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ImageIcon from '@mui/icons-material/Image';
import { MediaFilePreview, useMediaUpload } from '../../components';
import { RgbaStringColorPicker } from "react-colorful";
import { useFormik } from "formik";

interface ControllerProps {
  activeFile: File | undefined;
  onSubmit: (file: File) => any;

}
// interface CheckboxGroupProps {
//   onSubmit: (values: any) => any
//   tags: string[]
// }

// const backgroundRemovalOptions = () => {
//   return (
//     <Box mt={5}>
//       <Typography variant='h6' gutterBottom >Background</Typography>
//       <ul>
//         <li>
//           <Typography variant='body1' gutterBottom>Upload an image.</Typography>
//           <Dropzone accept={{
//             "image/png": [".png"],
//             "image/jpeg": [".jpg", ".jpeg"],
//             "image/jpg": [".jpg", ".jpeg"],
//           }}
//             onDrop={acceptedFiles => acceptedFiles && setbgFile(acceptedFiles[0])}>

//             {({ getRootProps, getInputProps }) => (
//               <div {...getRootProps({ style: { padding: 10, width: 200, height: 100, border: 'dashed gray 1px', borderRadius: '6%', display: 'flex', justifyContent: 'center', alignItems: 'center' } })}>
//                 <input {...getInputProps()} />
//                 {!bgFile ?
//                   <ImageIcon />
//                   :
//                   <MediaFilePreview file={bgFile} />
//                 }
//               </div>
//             )
//             }
//           </Dropzone>
//         </li>
//         <li>
//           <Typography variant='body1' gutterBottom>Choose a color</Typography>
//           <RgbaStringColorPicker color={bgColor} onChange={setbgColor} />
//         </li>
//       </ul>
//     </Box>
//   )
// }
interface InferenceParamsInterface {
  model: 'YOLOv8' | 'YOLOv5',
  imageSize: 640 | 320,
  conf: number,
  iou: number,
  showMasks: boolean,
  showBoxes: boolean,
  showConf: boolean
}
interface BackgroundInterface {
  file: File | undefined;
  color: string;
}

interface BackgroundControllerProps {
  handleChange: (background: BackgroundInterface) => any
}
const BackgroundController: React.FC<BackgroundControllerProps> = ({ handleChange }) => {
  const [background, setbackground] = React.useState<BackgroundInterface>({
    file: undefined,
    color: 'rgba(0,0,0,1)'
  });

  const handlebackgroundChange = (newValue: any, param: keyof BackgroundInterface) => {
    setbackground({ ...background, [param]: newValue });
    handleChange(background);
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom >Background</Typography>
      <ul>
        <li>
          <Typography variant='body1' gutterBottom>Upload an image.</Typography>
          <Dropzone accept={{
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/jpg": [".jpg", ".jpeg"],
          }}
            onDrop={acceptedFiles => acceptedFiles && handlebackgroundChange(acceptedFiles[0], 'file')}>

            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ style: { padding: 10, width: 200, height: 100, border: 'dashed gray 1px', borderRadius: '6%', display: 'flex', justifyContent: 'center', alignItems: 'center' } })}>
                <input {...getInputProps()} />
                {!background.file ?
                  <ImageIcon />
                  :
                  <MediaFilePreview file={background.file} />
                }
              </div>
            )
            }
          </Dropzone>
        </li>
        <li>
          <Typography variant='body1' gutterBottom>Choose a color</Typography>
          <RgbaStringColorPicker color={background.color} onChange={(newColor) => handlebackgroundChange(newColor, 'color')} />
        </li>
      </ul></Box>
  )
}
interface InferenceParamsProps {
  handleChange: (inferenceParams: InferenceParamsInterface) => any
}

const InferenceParamsController: React.FC<InferenceParamsProps> = ({ handleChange }) => {
  const [inferenceParams, setinferenceParams] = React.useState<InferenceParamsInterface>({
    model: 'YOLOv8',
    imageSize: 640,
    conf: 0.5,
    iou: 0.5,
    showMasks: true,
    showBoxes: true,
    showConf: true,
  });
  const handleinferenceParamsChange = (newValue: any, param: keyof InferenceParamsInterface) => {
    setinferenceParams({ ...inferenceParams, [param]: newValue });
  }
  return (
    <>
      <FormControl>
        <InputLabel>Model</InputLabel>
        <Select sx={{ width: 150, mr: 3 }} value={inferenceParams.model} label='Model' onChange={(event) => handleinferenceParamsChange(event.target.value, 'model')}>
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
        <Select sx={{ width: 150 }} value={inferenceParams.imageSize} label='Image Size' onChange={(event) => handleinferenceParamsChange(event.target.value as number, 'imageSize')}>
          <MenuItem value={320}>320</MenuItem>
          <MenuItem value={640}>640</MenuItem>
        </Select>
      </FormControl>

      <Box mt={5}>
        <Typography variant="h6">Thresholds</Typography>
        <ul>
          <li>
            <Typography gutterBottom>Confidence</Typography>
            <Slider
              value={inferenceParams.conf}
              onChange={(event, newValue) => handleinferenceParamsChange(newValue as number, 'conf')}
              valueLabelDisplay="auto"
              min={0.01}
              step={0.01}
              max={1}
            />
          </li>
          <li>
            <Typography gutterBottom>IOU</Typography>
            <Slider
              value={inferenceParams.iou}
              onChange={(event, newValue) => handleinferenceParamsChange(newValue as number, 'iou')}
              valueLabelDisplay="auto"
              min={0.01}
              step={0.01}
              max={1}
            />
          </li>
        </ul>
      </Box>
      <Box>
        <Typography variant="h6" color="initial">Advanced</Typography>
        <FormControl component='ul' variant="standard">
          <FormGroup>
            <ul>  
              {
                Object.entries({
                  'showMasks': 'Display masks',
                  'showBoxes': 'Display bounding boxes',
                  'showConf': 'Display confidence'
                }).map(([key, value]) =>
                <li>
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={Boolean(inferenceParams[key as keyof typeof inferenceParams])}
                          onChange={(event) => handleinferenceParamsChange(event.target.checked, key as keyof InferenceParamsInterface)}
                          name={key}
                        />
                      }
                      label={value}
                    />
                </li>
                )
              }
            </ul>
          </FormGroup>
          <FormHelperText>Please select atleast one.</FormHelperText>
        </FormControl>
      </Box>
    </>
  );
}


const Controller: React.FC<ControllerProps> = ({ activeFile, onSubmit }) => {
  return (
    <form style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 20, paddingBottom: 20 }}>
      <InferenceParamsController handleChange={(inferenceParams) => console.log(inferenceParams)} />
      {/* <BackgroundController handleChange={(background) => console.log(background)} /> */}
    </form>
  );
};

export default Controller;