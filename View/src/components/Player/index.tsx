import React from 'react';
import { Typography } from '@mui/material';
import useMediaUpload from '../MediaUpload';
import ImageIcon from '@mui/icons-material/Image';
interface PlayerProps {
    activeFile: File | undefined;
}
const Player: React.FC<PlayerProps> = ({ activeFile }) => {
    // const style: React.CSSProperties = { objectFit: 'contain', maxWidth : '100%', maxHeight : '100%', marginTop : 'auto', marginBottom : 'auto' };
    const background = useMediaUpload({
        uploadIcon: <ImageIcon />,
    });
    if (!activeFile) return <Typography style={{ marginTop: 'auto', marginBottom: 'auto' }}>Select a video or an image to display</Typography>;
    else {
        return (
           <background.Dropzone style = {{ width : 200, height : 100, border : 'dashed gray 1px', borderRadius : '6%'}}/>
        )
        // const type = activeFile.type.split('/')[0];
        // if (type === 'image') {
        //     return <img style={style} src={URL.createObjectURL(activeFile)} alt="file preview" />;
        // } else if (type === 'video') {
        //     return <video style={style} src={URL.createObjectURL(activeFile)} controls />;
        // } else {
        //     return <Typography>Unsupported file type</Typography>;
        // }
    }
};

export default React.memo(Player);