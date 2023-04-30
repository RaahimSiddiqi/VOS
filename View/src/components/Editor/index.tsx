import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Paper, CircularProgress, Backdrop } from '@mui/material';
import { BackgroundController, InferenceParamsController, MediaUploadPreview } from './../../components';
import { Button } from '@mui/material';
import { MediaUploadPreviewRef } from '../MediaUploadPreview';
import ImageIcon from '@mui/icons-material/Image';
import { BackgroundInterface, InferenceParamsInterface } from '../Controller';
import rhino from '../../assets/rhino.mp4';
import { useAsyncCallback } from 'react-async-hook';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useNavigate } from "react-router-dom";
import modelsInfo from '../../assets/models_info.json';


const download = (file: File) => {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(file);
  anchor.download = file.name;
  anchor.click();
}
const formDataFromObject = (obj : {[key : string] : any}) => {
  const data = new FormData();
  for(const key in obj){
    data.append(key, obj[key]);
  }
  return data;
}

const base64ToFile = (base64String : string, mimeType : string, fileName : string) => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const type = mimeType.startsWith('video') ? 'video/mp4' : mimeType;
  const blob = new Blob([byteArray], { type });
  const file = new File([blob], fileName, { type });
  return file;
}

const inference = async (video: File, inferenceParams: InferenceParamsInterface, accessToken : string) => {
  const model_name = inferenceParams.model;
  const conf_thresh = inferenceParams.conf;
  const iou_thresh = inferenceParams.iou;
  const filter_classes = inferenceParams.classes.map(label => modelsInfo[model_name].indexOf(label));
  const file = video;
  const output_video_case =!inferenceParams.showBoxes && !inferenceParams.showConf && !inferenceParams.showLabels ? 1 :
                            inferenceParams.showBoxes && !inferenceParams.showConf && !inferenceParams.showLabels ? 2 :
                            inferenceParams.showBoxes && !inferenceParams.showConf && inferenceParams.showLabels  ? 3 :
                                                                                                                    4 ;

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  const request = new Request("http://192.168.10.8:8000/predict",{
    method : "POST", 
    body: formDataFromObject({ model_name, output_video_case, file, conf_thresh, iou_thresh, filter_classes : "0" }),
    headers,
  });
  const response = await fetch(request);
  return await response.json();
  // const blob = await response.blob();
  // return new File([blob], `Segmented_${file.name}`, { type: 'video/mp4' });

}

const backgroundChange = async(video : File, background : BackgroundInterface) => {
  return new Promise<File>((resolve, reject) => {
    setTimeout(() => {
      fetch(rhino)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'rhino.mp4', { type: 'video/mp4' });
          resolve(file);
        })
        .catch(error => reject(error));
    }, 3000);
  });
}
/*
  1) Upload media.
  2) They can change the video, and inference params as many times.(inference state)
  3) They press the 'segment' button.
  4) Loading screen, video appears in display.
  5) We get a yolo video. ( we are in background state now. background controller appears)
  6) They can change all the settings in the background. 
  8) When they click 'extract', the laoding screen occurs, and they get output. We remain in background.
  9) Only if in background state, user clicks 'change media', do we go back to inference state.
  10) In either state, they can download the output video.(as long as theres a video in display)
 */
enum EditorState {
  Inference,
  Background
}

function Editor() {
  const [mainFile, setmainFile] = useState<File>();
  const [activeFile, setactiveFile] = useState<File>();
  const editorState = React.useRef<EditorState>(EditorState.Inference);
  const inferenceParams = React.useRef<InferenceParamsInterface>();
  const background = React.useRef<BackgroundInterface>();
  const inferenceResults = React.useRef<any>();
  const dropzoneRef = React.createRef<MediaUploadPreviewRef>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
      onAuthStateChanged(auth, async (user) => {
          setIsAuthenticated(Boolean(user));
      });
  }, [])

  const segmentFetch = useAsyncCallback(
    async () => 
      auth.currentUser &&
      mainFile &&
      inferenceParams.current &&
      inference(mainFile, inferenceParams.current, await getIdToken(auth.currentUser))
        .then(response => {
          console.log(response);
          const segmentedFile = base64ToFile(response['base64_encoded_string'], response['mime'], `Segmented_${mainFile.name}`);
          console.log(segmentedFile);
          setmainFile(segmentedFile);
          inferenceResults.current = {results : response['results'], classes_detected : response['classes_detected']}
          editorState.current = EditorState.Background;
        }));

  const extractFetch = useAsyncCallback(
    () => mainFile &&
          background.current &&
          backgroundChange(mainFile, background.current)
          .then(file => setmainFile(file))
  );
  return (
    <>
    {isAuthenticated ?
      <>
        <Paper sx={{ mx: 'auto', padding: 5, my: 2 }} elevation={4}>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={segmentFetch.loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          <Typography variant='h4' gutterBottom>Image/Video segmentation</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant='outlined'>
                <form style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 20, paddingBottom: 20 }}>
                  {
                    editorState.current === EditorState.Inference ?
                      <InferenceParamsController handleChange={newValue => inferenceParams.current = newValue} />
                      :
                      <BackgroundController handleChange={newValue => background.current = newValue} detectedClasses={inferenceResults.current['classes_detected']!.map((item : any) => modelsInfo[inferenceParams.current!.model][item[0]])} />
                  }
                </form>
                {/* <Controller activeFile={activeFile} onSubmit={(file) => console.log(file)} /> */}
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <MediaUploadPreview
                file={mainFile}
                setfile={setmainFile}
                ref={dropzoneRef}
                accept={['video', 'image']}
                uploadIcon={<ImageIcon fontSize='large' />}
                uploadText={"Drag 'n Drop or Click to upload media"}
                noClick={Boolean(mainFile)}
                noDrag={Boolean(mainFile)}
                style={{ width: '100%', height: '100%', border: 'dashed gray 1px', borderRadius: '4px' }}
              />
            </Grid>
          </Grid>
          {mainFile &&
            <>
              <Box mt={3} display='flex' justifyContent='space-between'>
                {editorState.current === EditorState.Inference ?            
                  <Button variant='contained' disabled={segmentFetch.loading} onClick={segmentFetch.execute}>Segment</Button>
                  :
                  <Button variant='contained' disabled={segmentFetch.loading} onClick={segmentFetch.execute}>Extract</Button>
                }
                <Box>
                  <Button variant='outlined' sx={{ mr: 2 }}
                    onClick={() => {
                      dropzoneRef.current?.openFileDialog();
                      editorState.current = EditorState.Inference;
                    }}>Change Media</Button>
                  <Button variant='contained' onClick={() => download(mainFile)}>Save Media</Button>
                </Box>
              </Box>
            </>
          }
        </Paper>
      </>
      :
      <Box sx={{display:"flex", width:"100%", height: 'calc(100vh - 65px)' }}>
        <Box sx={{m:"auto"}}>
          <Button variant="contained" onClick={() => navigate("/login")}>Please Login to Use</Button>
        </Box>
      </Box>
    }
    </>
  )
}

export default Editor;
