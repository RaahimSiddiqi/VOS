import React, { useState, useEffect } from 'react';
import { Grid, Box, Paper, CircularProgress, Backdrop } from '@mui/material';
import { BackgroundController, InferenceParamsController, MediaUploadPreview } from './../../components';
import { Button } from '@mui/material';
import { MediaUploadPreviewRef } from '../MediaUploadPreview';
import ImageIcon from '@mui/icons-material/Image';
import { BackgroundInterface, InferenceParamsInterface } from '../Controller';
import { useAsyncCallback } from 'react-async-hook';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useNavigate } from "react-router-dom";
import modelsInfo from '../../assets/models_info.json';
import { predict, extract } from '../../api';
import { download } from '../../Utils';

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

  const predictFetch = useAsyncCallback(
    async () => 
      auth.currentUser &&
      mainFile.current &&
      inferenceParams.current &&
      predict(mainFile.current, inferenceParams.current, await getIdToken(auth.currentUser))
        .then(predictResults => {
          const {file, results, detectedClasses} = predictResults;
          inferenceResults.current = { results, detectedClasses }
          editorState.current = EditorState.Background;
          setactiveFile(file);
        }));

  const extractFetch = useAsyncCallback(
    async () => auth.currentUser &&
                mainFile.current &&
                inferenceParams.current &&
                inferenceResults.current &&
                background.current &&
                extract(mainFile.current, 
                      background.current.classes.map(label => modelsInfo[inferenceParams.current!.model].indexOf(label)), 
                      inferenceResults.current['results'],
                      background.current,
                      await getIdToken(auth.currentUser))
                .then(async  file => setactiveFile(file))
                );
  return (
    <>
    {isAuthenticated ?
      <>
        <Paper sx={{ mx: 'auto', padding: 3, my: 1 }} elevation={4}>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={editorState.current === EditorState.Inference ?  predictFetch.loading : extractFetch.loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant='outlined'>
                <form style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 20, paddingBottom: 20 }}>
                  {
                    editorState.current === EditorState.Inference ?
                      <InferenceParamsController handleChange={newValue => inferenceParams.current = newValue} />
                      :
                      <BackgroundController handleChange={newValue => background.current = newValue} detectedClasses={inferenceResults.current.detectedClasses!.map((item : any) => modelsInfo[inferenceParams.current!.model][item])} />
                  }
                </form>
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
                  <Button variant='contained' disabled={predictFetch.loading} onClick={predictFetch.execute}>Segment</Button>
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
