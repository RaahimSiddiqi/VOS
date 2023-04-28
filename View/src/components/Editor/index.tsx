import React, { useState } from 'react';
import { Grid, Typography, Box, Paper } from '@mui/material';
import { Controller, MediaUploadPreview } from './../../components';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { Button } from '@mui/material';
import { MediaUploadPreviewRef } from '../MediaUploadPreview';
import ImageIcon from '@mui/icons-material/Image';

const download = (file : File) => {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(file);
  anchor.download = file.name;
  anchor.click();
}

function Editor() {

  const [mainFile, setmainFile] = useState<File>();
  const [activeFile, setactiveFile] = useState<File>();
  const dropzoneRef = React.createRef<MediaUploadPreviewRef>();
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
          <Grid item xs={12} md={8}>
            <MediaUploadPreview 
              file={mainFile}
              setfile={setmainFile}
              ref={dropzoneRef}
              accept={['video', 'image']}
              uploadIcon={<ImageIcon fontSize='large'/>}
              uploadText={"Drag 'n Drop or Click to upload media"}
              noClick={Boolean(mainFile)}
              noDrag={Boolean(mainFile)}
              style={{ width: '100%', height: '100%', border: 'dashed gray 1px', borderRadius: '4px'}}
            />
          </Grid>
        </Grid>
        {mainFile &&
        <>
          <Box mt={3} display='flex' justifyContent='space-between'>
            <Button variant='contained'>Start</Button>
            <Box>
              <Button variant='outlined' sx={{ mr: 2 }} onClick={()=>dropzoneRef.current?.openFileDialog()}>Change Media</Button>
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
