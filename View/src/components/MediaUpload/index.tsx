import React from "react";
import { useDropzone } from "react-dropzone";
import { IconProps } from "@mui/material";
interface useMediaUploadProps {
    uploadIcon?: React.ReactElement<IconProps>;
    noClick?: boolean;
};

const useMediaUpload = ({ uploadIcon, noClick } : useMediaUploadProps) => {
    const [file, setfile] = React.useState<File>();
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop: (acceptedFiles) => {
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

    const Dropzone = ({style } : { style ?: React.CSSProperties }) => {
        return (
            <div {...getRootProps({style : {...style, display: 'flex', justifyContent: 'center', alignItems: 'center' }})}>
                <input {...getInputProps()} />
                {!file ? (
                    uploadIcon
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