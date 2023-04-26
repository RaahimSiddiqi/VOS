import React from "react";
import { useDropzone } from "react-dropzone";
import { IconProps } from "@mui/material";
import { Typography, Box } from "@mui/material";
interface useMediaUploadProps {
    uploadIcon?: React.ReactElement<IconProps>;
    uploadText?: String
    noClick?: boolean;
};

const useMediaUpload = ({ uploadIcon, noClick, uploadText } : useMediaUploadProps) => {
    const [file, setfile] = React.useState<File>();
    console.log(React.useRef(Math.random()).current);
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop: (acceptedFiles, rejectedFiles, event) => {
            event.preventDefault();
            console.log("onDrop");
            if (acceptedFiles){
                setfile(acceptedFiles[0]);
            }

        },
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/jpg": [".jpg", ".jpeg"],
            "video/mp4": [".mp4"],
        },
        noClick
    });

    const Dropzone = ({ style } : { style ?: React.CSSProperties }) => {
        return (
            <div {...getRootProps({style : {...style, display: 'flex', justifyContent: 'center', alignItems: 'center' }})}>
                <input {...getInputProps()} />
                {!file ? (
                    <Box display='flex' flexDirection='column' alignItems='center'>
                    {uploadIcon}
                    { uploadText && <Typography variant="body1" textAlign='center'>{uploadText}</Typography>}
                    </Box>
                ) : file.type.startsWith("video") ? (
                    <video
                        src={URL.createObjectURL(file)}
                        autoPlay
                        style={{ objectFit: "contain", maxWidth: "100%" }}
                    />
                ) : (
                    <img
                        src={URL.createObjectURL(file)}
                        style={{ objectFit: "contain", maxWidth: "100%" }}
                    />
                )}
            </div>
        )
    };
    return {file, open, isDragActive, Dropzone};
}

export default useMediaUpload;