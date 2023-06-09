import React, { useEffect } from 'react';
import { Slider, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Box, FormGroup, FormControlLabel, Checkbox, FormHelperText, SelectChangeEvent, styled, Paper, Autocomplete, TextField } from '@mui/material';
import Dropzone from 'react-dropzone'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ImageIcon from '@mui/icons-material/Image';
import { MediaUploadPreview } from '../../components';
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import modelsInfo from '../../assets/models_info.json';

export interface InferenceParamsInterface {
  model: 'yolov8s-seg' | 'yolov8s-seg-davis';
  conf: number;
  iou: number;
  showLabels: boolean;
  showBoxes: boolean;
  showConf: boolean;
  classes: string[];
}
export interface BackgroundInterface {
  file: File | undefined;
  color: RgbaColor;
  classes: string[];
}

interface BackgroundControllerProps {
  handleChange: (background: BackgroundInterface) => any
  detectedClasses: string[]
}
export const BackgroundController: React.FC<BackgroundControllerProps> = ({ handleChange, detectedClasses }) => {
  const [background, setbackground] = React.useState<BackgroundInterface>({
    file: undefined,
    color: { r : 0, g : 0, b : 0, a : 1},
    classes: detectedClasses
  });


  const handlebackgroundChange = (newValue: any, param: keyof BackgroundInterface) => {
    const newBackg = { ...background, [param]: newValue }
    setbackground(newBackg);
    handleChange(newBackg);
  }

  React.useEffect(() => {
    handlebackgroundChange(detectedClasses, 'classes');
  }, [detectedClasses]);

  return (
    <Box>
      <Typography variant='h6' gutterBottom >Background</Typography>
      <ul>
        <li>
          <Typography variant='body1' gutterBottom>Upload an image.</Typography>
          <MediaUploadPreview
            file={background.file}
            setfile={(file) => handlebackgroundChange(file, 'file')}
            accept={['image']}
            uploadIcon={<ImageIcon />}
            style={{ padding: 10, width: 200, height: 100, border: 'dashed gray 1px', borderRadius: '6%' }}
          />
          <Button onClick={() => handlebackgroundChange(undefined, 'file')}>Remove</Button>
        </li>
        <li>
          <Typography variant='body1' gutterBottom>Choose a color</Typography>
          <RgbaColorPicker color={background.color} onChange={newColor => handlebackgroundChange(newColor, 'color')} />
        </li>
      </ul>
      <Typography variant='h6' gutterBottom >Extract</Typography>
      <Typography variant='body1' gutterBottom >Select classes to keep in the video.</Typography>
      <Autocomplete
        multiple
        limitTags={4}
        options={detectedClasses}
        getOptionLabel={tag => tag}
        value={background.classes}
        onChange={(event, newValue) => handlebackgroundChange(newValue, 'classes')}
        renderInput={(params) => (
          <TextField {...params} placeholder="Classes" />
        )}
      />

    </Box>
  )
}
interface InferenceParamsProps {
  handleChange: (inferenceParams: InferenceParamsInterface) => any
}

export const InferenceParamsController: React.FC<InferenceParamsProps> = ({ handleChange }) => {
  const [inferenceParams, setinferenceParams] = React.useState<InferenceParamsInterface>({
    model: 'yolov8s-seg',
    conf: 0.3,
    iou: 0.7,
    showLabels: true,
    showBoxes: true,
    showConf: true,
    classes: modelsInfo['yolov8s-seg'],
  });

  const handleinferenceParamsChange = (newValue: any, param: keyof InferenceParamsInterface) => {
    let newParams : InferenceParamsInterface; 
    if(param.startsWith('show')){
      const showParams = {showLabels : inferenceParams.showLabels, showBoxes : inferenceParams.showBoxes, showConf : inferenceParams.showConf};      
      if(param === 'showBoxes'){
        if(newValue){
          showParams.showBoxes = true;
        }
        else{
          showParams.showBoxes = false;
          showParams.showConf = false;
          showParams.showLabels = false;
        }
      }
      else if(param === 'showLabels'){
        if(newValue){
          showParams.showLabels = true;
          showParams.showBoxes = true;
        }
        else{
          showParams.showConf = false;
          showParams.showLabels = false;
        }
      }
      else if(param === 'showConf'){
        if(newValue){
          showParams.showConf = true;
          showParams.showLabels = true;
          showParams.showBoxes = true;
        }
        else showParams.showConf = false;
      }
      newParams = {...inferenceParams, ...showParams};
    }
    else{
      newParams = { ...inferenceParams, [param]: newValue };
    }
    setinferenceParams(newParams);
    handleChange(newParams);
  }

  React.useEffect(() => {
    handleinferenceParamsChange(modelsInfo[inferenceParams.model], 'classes');
  }, [inferenceParams.model]);

  return (
    <>
      <FormControl>
        <InputLabel>Model</InputLabel>
        <Select sx={{ width: 150, mr: 3 }} value={inferenceParams.model} label='Model' onChange={(event) => handleinferenceParamsChange(event.target.value, 'model')}>
          <MenuItem value='yolov8s-seg'>
            COCO
          </MenuItem>
          <MenuItem value='yolov8s-seg-davis'>
            DAVIS
          </MenuItem>
        </Select>
      </FormControl>
      <Typography variant="h6" mt={5}>Classes</Typography>
      <Typography variant="body1" gutterBottom>Select the classes for segmentation.</Typography>
      <Autocomplete
        multiple
        limitTags={4}
        options={modelsInfo[inferenceParams.model]}
        getOptionLabel={tag => tag}
        value={inferenceParams.classes}
        onChange={(event, newValue) => handleinferenceParamsChange(newValue, 'classes')}
        renderInput={(params) => (
          <TextField {...params} placeholder="Classes" />
        )}
      />
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
                  'showLabels': 'Display labels',
                  'showBoxes': 'Display bounding boxes',
                  'showConf': 'Display confidence'
                }).map(([key, value]) =>
                  <li key={key}>
                    <FormControlLabel
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


// const Controller: React.FC<ControllerProps> = ({ activeFile, onSubmit }) => {
//   return (
//     <form style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 20, paddingBottom: 20 }}>
//       <InferenceParamsController handleChange={(inferenceParams) => console.log(inferenceParams)} />
//       <BackgroundController handleChange={(background) => console.log(background)} detectedClasses={['person', 'airplane']}/>
//     </form>
//   );
// };

// export default Controller;