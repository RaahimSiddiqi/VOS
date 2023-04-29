import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Paper, CircularProgress, Backdrop } from '@mui/material';
import { BackgroundController, InferenceParamsController, MediaUploadPreview } from './../../components';
import { Button } from '@mui/material';
import { MediaUploadPreviewRef } from '../MediaUploadPreview';
import ImageIcon from '@mui/icons-material/Image';
import { BackgroundInterface, InferenceParamsInterface } from '../Controller';
import rhino from '../../assets/rhino.mp4';
import { useAsyncCallback } from 'react-async-hook';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useNavigate } from "react-router-dom";


const download = (file: File) => {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(file);
  anchor.download = file.name;
  anchor.click();
}

const inference = async (video: File, inferenceParams: InferenceParamsInterface) => {
  // const request = FormData
  // return fetch()
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
  const dropzoneRef = React.createRef<MediaUploadPreviewRef>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
      onAuthStateChanged(auth, async (user) => {
          setIsAuthenticated(!!user);
      });
  }, [])

  const segmentFetch = useAsyncCallback(
    () => mainFile &&
      inferenceParams.current &&
      inference(mainFile, inferenceParams.current)
        .then(file => {
          setmainFile(file);
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
                    <BackgroundController handleChange={newValue => background.current = newValue} detectedClasses={['person', 'airplane']} />
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
                <Button variant='outlined' sx={{ mr: 2 }} onClick={() => dropzoneRef.current?.openFileDialog()}>Change Media</Button>
                <Button variant='contained' onClick={() => download(mainFile)}>Save Media</Button>
              </Box>
            </Box>
          </>
        }
      </Paper>
    </>
  )
}

export default Editor;
