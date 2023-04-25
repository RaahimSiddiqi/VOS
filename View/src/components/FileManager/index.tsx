import { Box, IconButton, Grid, Tooltip, Menu, MenuItem, Typography } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileManagerProps {
  config: {
    [key: string]: {
      actions: {
        [key: string]: (file: File) => void;
      }
    };
  };
  files : File[];
  setfiles : React.Dispatch<React.SetStateAction<File[]>>;
};

const FileManager: React.FC<FileManagerProps> = ({ files, setfiles, config }) => {
  const [activeFileIndex, setactiveFileIndex] = useState<number>();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const isFileValidType = useCallback(((file: File) => ["image/jpeg", "image/png", "video/mp4"].includes(file.type)), []);

  const onDrop = (acceptedFiles: File[]) => {
    setfiles(files.concat(acceptedFiles.filter(isFileValidType))); //Array.concat is immutable
  };

  const deleteFile = (fileIndex: number) => {
    setfiles([...files.slice(0, fileIndex), ...files.slice(fileIndex + 1)]);
  }

  const downloadFile = (fileIndex: number) => {
    const url = URL.createObjectURL(files[fileIndex]);
    const link = document.createElement('a');
    link.href = url;
    link.download = files[fileIndex].name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true })

  const handleContextMenu = useCallback((event: React.MouseEvent, fileIndex: number) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setactiveFileIndex(fileIndex);
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
    setactiveFileIndex(undefined);
  };

  return (
    <Box {...getRootProps({ sx: {overflowY : 'auto', height : 400 } })}>
      <input {...getInputProps({ accept: ".jpg,.jpeg,.png,.mp4" })} />

      {
        isDragActive ?
          <Typography>Drop the files here ...</Typography> :
          files.length === 0 ?
            <Typography>Upload some files...</Typography> :
            <Grid container>
              {files.map((file, fileIndex) => (
                <Grid item key={fileIndex}>

                  <Tooltip title={file.name}>
                    <IconButton
                      onClick={() => console.log(file)}
                      onContextMenu={(event: React.MouseEvent) => handleContextMenu(event, fileIndex)}
                      rel="noopener noreferrer"
                      size="large"
                      sx={{ display: 'flex', flexDirection: 'column'}}
                    >
                      <InsertDriveFileIcon sx={{ fontSize: 60 }} />
                      <Typography
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '80px',
                          textAlign: 'center',
                          fontSize: '0.8rem',
                        }}
                      >
                        {file.name.length > 10 ? `${file.name.slice(0, 10)}...` : file.name}
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </Grid>
              ))}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {
                  typeof activeFileIndex == "number" &&
                  (() => {
                    const actions = config[files[activeFileIndex!].type.split('/')[0]].actions
                    return Object.keys(actions).map((action, i) =>
                      <MenuItem key ={action} onClick={() => { actions[action](files[activeFileIndex!]); handleClose(); }}>{action}</MenuItem>
                    ).concat(
                      [
                        <MenuItem key='Delete' onClick={() => { deleteFile(activeFileIndex!); handleClose(); }}>Delete</MenuItem>,
                        <MenuItem key='Download' onClick={() => { downloadFile(activeFileIndex!); handleClose(); }}>Download</MenuItem>
                      ]
                    )
                  })()
                }
              </Menu>
            </Grid>
      }
    </Box>
  )
}

export default FileManager;
