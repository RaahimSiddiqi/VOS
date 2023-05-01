import React from "react";
import { useDropzone } from "react-dropzone";
import { IconProps } from "@mui/material";
import { Typography, Box } from "@mui/material";


interface MediaUploadPreviewProps {
    file : File | undefined;
    setfile : (file : File | undefined) => void;
    accept: ('image' | 'video')[];
    noClick?: boolean;
    noDrag?: boolean;
    uploadIcon?: React.ReactElement<IconProps>;
    uploadText?: String;
    style?: React.CSSProperties;
};

export interface MediaUploadPreviewRef{
    openFileDialog : () => void
}

const MediaUploadPreview = React.forwardRef<MediaUploadPreviewRef, MediaUploadPreviewProps>(
    ({ accept, noClick, noDrag, uploadIcon, uploadText, style, file, setfile}, ref) => {
    
    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop: acceptedFiles => acceptedFiles && setfile(acceptedFiles[0]),
        accept: {
            ...(accept.includes("image") && 
            { "image/png": [".png"], 
              "image/jpeg": [".jpg", ".jpeg"], 
              "image/jpg": [".jpg", ".jpeg"],
              "image/bmp" : [".bmp"]}),
            ...(accept.includes("video") && 
            { "video/mp4": [".mp4"],
              "video/x-msvideo" : [".avi"],
              "video/x-matroska" : [".mkv"], 
              "video/quicktime" : [".mov"]})
        },
        noClick,
        noDrag
    });

    React.useImperativeHandle(ref, () => ({
        openFileDialog : open
    }));

    return (
        <div {...getRootProps({ style: { ...style, display: 'flex', justifyContent: 'center', alignItems: 'center' } })}>
            <input {...getInputProps()} />
            {!file ? (
                <Box display='flex' flexDirection='column' alignItems='center'>
                    {uploadIcon}
                    {uploadText && <Typography variant="body1" textAlign='center'>{uploadText}</Typography>}
                </Box>
            ) : file.type.startsWith("video") ? (
                <video
                    src={URL.createObjectURL(file)}
                    autoPlay
                    controls
                    style={{ objectFit: "contain", maxWidth : "100%", maxHeight : "100%" }}
                />
            ) : (
                <img
                    src={URL.createObjectURL(file)}
                    style={{ objectFit: "contain", maxWidth: "100%", maxHeight : "100%" }}
                />
            )}
        </div>
    );
})
MediaUploadPreview.defaultProps = {
    noClick : false,
    noDrag : false
}
export default React.memo(MediaUploadPreview);