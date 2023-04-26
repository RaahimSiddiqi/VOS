import React from 'react';
import { Typography } from '@mui/material';

interface PlayerProps {
    activeFile: File | undefined;
}
const Player: React.FC<PlayerProps> = ({ activeFile }) => {
    const style: React.CSSProperties = { objectFit: 'contain', maxWidth : '100%', maxHeight : '100%', marginTop : 'auto', marginBottom : 'auto' };
    if (!activeFile) return <Typography style={style}>Select a video or an image to display</Typography>;
    else {
        const type = activeFile.type.split('/')[0];
        if (type === 'image') {
            return <img style={style} src={URL.createObjectURL(activeFile)} alt="file preview" />;
        } else if (type === 'video') {
            return <video style={style} src={URL.createObjectURL(activeFile)} controls />;
        } else {
            return <Typography>Unsupported file type</Typography>;
        }
    }
};

export default React.memo(Player);