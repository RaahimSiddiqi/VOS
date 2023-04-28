import React from 'react';
import { Slider, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Box, FormGroup, FormControlLabel, Checkbox, FormHelperText, SelectChangeEvent, styled, Paper, Autocomplete, TextField } from '@mui/material';
import Dropzone from 'react-dropzone'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ImageIcon from '@mui/icons-material/Image';
import { MediaUploadPreview } from '../../components';
import { RgbaStringColorPicker } from "react-colorful";
import modelsInfo from '../../assets/models_info.json';

interface ControllerProps {
  activeFile: File | undefined;
  onSubmit: (file: File) => any;

}
interface InferenceParamsInterface {
  model: 'yolov8s-seg' | 'yolov8s-seg-davis';
  conf: number;
  iou: number;
  showLabels: boolean;
  showBoxes: boolean;
  showConf: boolean;
  classes: string[];
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
          <MediaUploadPreview
            file={background.file}
            setfile={(file) => handlebackgroundChange(file, 'file')}
            accept={['image']}
            uploadIcon={<ImageIcon />}
            style={{ padding: 10, width: 200, height: 100, border: 'dashed gray 1px', borderRadius: '6%' }}
          />
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
    model: 'yolov8s-seg',
    conf: 0.5,
    iou: 0.5,
    showLabels: true,
    showBoxes: true,
    showConf: true,
    classes: [],
  });
  const handleinferenceParamsChange = (newValue: any, param: keyof InferenceParamsInterface) => {
    setinferenceParams({ ...inferenceParams, [param]: newValue });
  }
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
      <BackgroundController handleChange={(background) => console.log(background)} />
    </form>
  );
};

export default Controller;