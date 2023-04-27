import React, { useState } from 'react';
import { Grid, Typography, Box, Paper } from '@mui/material';
import { FileManager, Player, Controller } from './../../components';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { MediaFilePreview } from './../../components';
import { Button } from '@mui/material';
{/* <Grid container spacing={2} item xs = {12} md={5}> */ }
{/* <Grid item xs = {12}>
              <Paper variant='outlined'>
                <FileManager config={config} files={files} setfiles={setfiles}/>
              </Paper>
            </Grid> */}

// const [files, setfiles] = useState<File[]>([]);

// const config = {
//   "image" : {
//     "actions" : {
//       "Select" : (file : File) => setactiveFile(file),

//       ...(activeFile && { //only allow putting backgrounds if a file is already present over there.
//         "Set as background" : (file : File) => {
//           alert("This is my background");
//           setactiveFile(file);
//         }})
//     }
//   },
//   "video" : {
//     "actions" : {
//       "Select" : (file : File) => setactiveFile(file)
//     }
//   }
// }
const download = (file : File) => {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(file);
  anchor.download = file.name;
  anchor.click();
}

function Editor() {

  const [mainFile, setmainFile] = useState<File>();
  const [activeFile, setactiveFile] = useState<File>();
  const dropzoneRef = React.createRef<DropzoneRef>();
  return (
    <>
      <Paper sx={{ mx: 'auto', padding: 5, my: 2 }} elevation={4}>
        <Typography variant='h4' gutterBottom>Image/Video segmentation</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant='outlined'>
              <Controller activeFile={activeFile} onSubmit={(file) => console.log(file)} />
            </Paper>
          </Grid>
          {/* </Grid> */}
          <Grid item xs={12} md={8}>
            {/* <Paper sx = {{height : '100%', width : '100%', display : 'flex', justifyContent : 'center'}}> */}
            <Dropzone noDrag={Boolean(mainFile)} noClick={Boolean(mainFile)} ref = {dropzoneRef} accept={{
              "image/png": [".png"],
              "image/jpeg": [".jpg", ".jpeg"],
              "image/jpg": [".jpg", ".jpeg"],
              "video/mp4": [".mp4"]
            }}
              onDrop={acceptedFiles => acceptedFiles && setmainFile(acceptedFiles[0])}>

              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ style: { width: '100%', height: '100%', border: 'dashed gray 1px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' } })}>
                  <input {...getInputProps()} />
                  {!mainFile ?
                    <Box display='flex' flexDirection='column' alignItems='center'>
                      <FileUploadIcon fontSize='large' />
                      <Typography variant="body1" textAlign='center' mt = {3}>Drag 'n Drop or Click to upload media</Typography>
                    </Box>
                    :
                    <MediaFilePreview file={mainFile} />
                  }
                </div>
              )
              }
            </Dropzone>
            {/* </Paper> */}
          </Grid>
        </Grid>
        {mainFile &&
        <>
          <Box mt={3} display='flex' justifyContent='space-between'>
            <Button variant='contained'>Start</Button>
            <Box>
              <Button variant='outlined' sx={{ mr: 2 }} onClick={()=>dropzoneRef.current?.open()}>Change Media</Button>
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
