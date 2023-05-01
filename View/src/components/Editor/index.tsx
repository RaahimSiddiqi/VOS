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
import { SERVER_IP, SERVER_PORT } from '../../config';

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
  const filter_classes = `[${ (inferenceParams.classes.map(label => modelsInfo[model_name].indexOf(label))).join(', ')}]`;
  const file = video;
  const output_video_case = inferenceParams.showBoxes &&  inferenceParams.showConf &&  inferenceParams.showLabels ? 1 :
                           !inferenceParams.showBoxes && !inferenceParams.showConf && !inferenceParams.showLabels ? 2 :
                            inferenceParams.showBoxes && !inferenceParams.showConf && !inferenceParams.showLabels ? 3 :
                                                                                                                    4 ;

  const method = "POST";
  const body = { model_name, output_video_case, file, conf_thresh, iou_thresh, filter_classes };
  const headers = new Headers({'Authorization': `Bearer ${accessToken}`});
  const request = new Request(`http://${SERVER_IP}:${SERVER_PORT}/predict`,{ method, body : formDataFromObject(body), headers });
  const response = await fetch(request);
  console.log("Inference body =>", body);
  return await response.json();

}

const backgroundChange = async(video : File, inferenceParams: InferenceParamsInterface, results : any, background : BackgroundInterface, accessToken : string) => {
  results = JSON.stringify(results);
  const file = video;
  const bg_image = background.file;
  const {r, g, b, a} = background.color;
  const filter_classes = `[${ (background.classes.map(label => modelsInfo[inferenceParams.model].indexOf(label))).join(', ')}]`
  const color_code = `[${r},${g},${b},${Math.floor(a * 255)}]`;

  const method = "POST";
  const headers = new Headers({'Authorization': `Bearer ${accessToken}`});
  const body = { file, ...(bg_image ? {bg_image} : {color_code}), results, filter_classes};

  const request = new Request(`http://${SERVER_IP}:${SERVER_PORT}/extract`,{ method, body: formDataFromObject(body), headers});
  const response = await fetch(request);
  console.log("Extract body =>", body);
  return response;
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
  const mainFile = React.useRef<File>();
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

  const onUpload = (file : File | undefined) => {
    console.log("Uploaded => ", file);
    mainFile.current = file;
    setactiveFile(file);
  } 

  const segmentFetch = useAsyncCallback(
    async () => 
      auth.currentUser &&
      mainFile.current &&
      inferenceParams.current &&
      inference(mainFile.current, inferenceParams.current, await getIdToken(auth.currentUser))
        .then(response => {
          console.log(response);
          const segmentedFile = base64ToFile(response['base64_encoded_string'], response['mime'], `Segmented_${mainFile.current!.name}`);
          inferenceResults.current = {results : response['results'], classes_detected : response['classes_detected']}
          editorState.current = EditorState.Background;
          setactiveFile(segmentedFile);
        }));

  const extractFetch = useAsyncCallback(
    async () => auth.currentUser &&
                mainFile.current &&
                inferenceParams.current &&
                inferenceResults.current &&
                background.current &&
                backgroundChange(mainFile.current, inferenceParams.current, inferenceResults.current['results'], background.current, await getIdToken(auth.currentUser))
                .then(async(response) =>{
                  const blob = await response.blob();

                  setactiveFile(new File([blob], `Extracted_${mainFile.current!.name}`, {type : response.headers.get('content-type')!}))
                })
  );
  return (
    <>
    {isAuthenticated ?
      <>
        <Paper sx={{ mx: 'auto', padding: 3, my: 1 }} elevation={4}>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={editorState.current === EditorState.Inference ?  segmentFetch.loading : extractFetch.loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          {/* <Typography variant='h4' gutterBottom>Image/Video segmentation</Typography> */}
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
                file={activeFile}
                setfile={onUpload}
                ref={dropzoneRef}
                accept={['video', 'image']}
                uploadIcon={<ImageIcon fontSize='large' />}
                uploadText={"Drag 'n Drop or Click to upload media"}
                noClick={Boolean(activeFile)}
                noDrag={Boolean(activeFile)}
                style={{ width: '100%', height: '100%', border: 'dashed gray 1px', borderRadius: '4px', maxHeight : 712 }}
              />
            </Grid>
          </Grid>
          {activeFile &&
            <>
              <Box mt={3} display='flex' justifyContent='space-between'>
                {editorState.current === EditorState.Inference ?            
                  <Button variant='contained' disabled={segmentFetch.loading} onClick={segmentFetch.execute}>Segment</Button>
                  :
                  <Button variant='contained' disabled={extractFetch.loading} onClick={extractFetch.execute}>Extract</Button>
                }
                <Box>
                  <Button variant='outlined' sx={{ mr: 2 }}
                    onClick={() => {
                      dropzoneRef.current?.openFileDialog();
                      editorState.current = EditorState.Inference;
                    }}>Change Media</Button>
                  <Button variant='contained' onClick={() => download(activeFile)}>Save Media</Button>
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
