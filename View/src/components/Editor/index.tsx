import { useState } from 'react';
import { Grid, Typography, Box, Paper } from '@mui/material';
import { FileManager, Player, Controller } from './../../components';


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

          {/* <Grid container spacing={2} item xs = {12} md={5}> */}
            {/* <Grid item xs = {12}>
              <Paper variant='outlined'>
                <FileManager config={config} files={files} setfiles={setfiles}/>
              </Paper>
            </Grid> */}

  // const [files, setfiles] = useState<File[]>([]);

function Editor() {
  const [activeFile, setactiveFile] = useState<File>();
  return (
    <>
      <Paper sx ={{ mx : 'auto', padding : 5, my : 2}} elevation={4}>
        <Typography variant='h4' gutterBottom>Image/Video segmentation</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} md = {4}>
              <Paper variant = 'outlined'>
                <Controller activeFile = {activeFile} onSubmit={(file) => console.log(file)}/>
              </Paper>
            </Grid>
          {/* </Grid> */}
          <Grid item xs={12} md={8} >
            <Paper variant = 'outlined' sx = {{height : '100%', width : '100%', display : 'flex', justifyContent : 'center'}}>
              <Player activeFile={activeFile} />
            </Paper>            
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}

export default Editor;
