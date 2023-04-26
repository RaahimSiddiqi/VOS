import { styled } from "@mui/material"
import React from "react"
interface MediaFilePreviewProps {
    file: File
}

const MediaFilePreview: React.FC<MediaFilePreviewProps> = ({ file }) => {
    const style : React.CSSProperties = {objectFit: "contain", maxWidth: "100%", maxHeight : "100%"}
    if (file.type.startsWith("video")) {
        return <video
            src={URL.createObjectURL(file)}
            controls
            style={style}
        />
    }
    else if (file.type.startsWith("image")) {
        return <img
            src={URL.createObjectURL(file)}
            style={style}
        />
    }
    else return <></>
}

export default styled(MediaFilePreview)();