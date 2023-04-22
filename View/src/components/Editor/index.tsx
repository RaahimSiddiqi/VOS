import { useState } from 'react'
import { Grid } from '@mui/material'
import { FileManager, Player, Controller } from './../../components'



function Editor() {
  const [activeFile, setactiveFile] = useState<File>();
  const [files, setfiles] = useState<File[]>([]);
  const config = {
    "image" : {
      "actions" : {
        "Select" : (file : File) => setactiveFile(file),
        
        ...(activeFile && { //only allow putting backgrounds if a file is already present over there.
          "Set as background" : (file : File) => {
            alert("This is my background");
            setactiveFile(file);
          }})
      }
    },
    "video" : {
      "actions" : {
        "Select" : (file : File) => setactiveFile(file)
      }
    }
  }
  return (
    <Grid container spacing={2}>
      <Grid container spacing={2} item xs = {12} md={5}>
        <Grid item xs = {12} style = {{borderColor: 'gray', borderWidth: 1, borderStyle: "solid"}}>
          <FileManager config={config} files={files} setfiles={setfiles}/>
        </Grid>
        <Grid item xs={12} style = {{borderColor: 'gray', borderWidth: 4, borderStyle: "solid"}}>
          <Controller activeFile = {activeFile} onSubmit={(file) => console.log(file)}/>
        </Grid>
      </Grid>
      <Grid item xs = {12} md={7} style = {{borderColor: 'gray', borderWidth: 4, borderStyle: "solid"}}>
        <Player activeFile={activeFile} />
      </Grid>
      {/* <Grid item xs = {12} md={5}>
        <Controller activeFile = {activeFile} onSubmit={(file) => console.log(file)}/>
      </Grid> */}
    </Grid>
  )
}

export default Editor;
