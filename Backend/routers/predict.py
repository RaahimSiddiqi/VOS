from services.InferenceController import InferenceController
from utils.auth import firebase_auth
import os
import shutil
import mimetypes
import base64
import imageio
from typing import List
from enum import Enum, IntEnum

from fastapi import APIRouter, HTTPException, UploadFile, File, status, Depends, Form

router = APIRouter()

# To limit the size of the file that the user can send
MAX_MB = 250

#valid extensions for YOLO
VALID_EXTENSIONS = {
    '.bmp', '.dng', '.jpeg', '.jpg', '.mpo', '.png', '.tif', '.tiff', '.webp',
    '.pfm', '.asf', '.avi', '.gif', '.m4v', '.mkv', '.mov', '.mp4', '.mpeg',
    '.mpg', '.ts', '.wmv', '.webm'
}

class ModelName(str, Enum):
    yolo = "yolov8s-seg"
    davis = "yolov8s-seg-davis"


class OutputVideoCase(IntEnum):
    MASK_BOX_LABEL_CONF = 1
    MASK = 2
    MASK_BOX = 3
    MASK_BOX_LABEL = 4

@router.post("/predict", dependencies=[Depends(firebase_auth)])
async def predict_segments(model_name: ModelName = Form(),
                           output_video_case: OutputVideoCase = Form(),
                           file: UploadFile = File(...),
                           conf_thresh: float = Form(0.25),
                           iou_thresh: float = Form(0.7),
                           filter_classes: List[int] | None = Form(None)):

    if os.path.splitext(file.filename)[1] not in VALID_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=
            f"Invalid file type. Only the following extensions are allowed: {', '.join(VALID_EXTENSIONS)}"
        )
    if file.size > MAX_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=
            f"File is too large. The maximum allowed size is {MAX_MB} MB.")
    if conf_thresh < 0.0 or conf_thresh > 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confidence threshold must be in the range 0 to 1 inclusive"
        )
    if iou_thresh < 0.0 or conf_thresh > 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IOU threshold must be in the range 0 to 1 inclusive")
    if filter_classes is not None and len(filter_classes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="filtered_classes must be a list of ints or null")

    try:
        filename = file.filename
        with open(filename, "wb") as buffer:
            buffer.write(await file.read())

        if output_video_case is OutputVideoCase.MASK_BOX_LABEL_CONF:
            show_boxes, show_conf, show_labels = True, True, True
        elif output_video_case is OutputVideoCase.MASK:
            show_boxes, show_conf, show_labels = False, False, False
        elif output_video_case is OutputVideoCase.MASK_BOX:
            show_boxes, show_conf, show_labels = True, False, False
        elif output_video_case is OutputVideoCase.MASK_BOX_LABEL:
            show_boxes, show_conf, show_labels = True, False, True

        inference = InferenceController(f"YOLO_models/{model_name.value}.pt")
        results = inference.predict(filename,
                                    conf=conf_thresh,
                                    iou=iou_thresh,
                                    boxes=show_boxes,
                                    show_conf=show_conf,
                                    show_labels=show_labels,
                                    classes=filter_classes)
        json_results = inference.results_to_json_format(results)
        classes_detected = inference.get_labels_per_video(results)

        # Get the relative path to YOLO's output file
        out_dir = "YOLO_output/video"
        out_file = os.listdir(out_dir)[0]
        out_file_path = os.path.join(out_dir, out_file)

        # Get the MIME type of the file
        media_type = mimetypes.guess_type(out_file_path)[0]

        # Encode videos to h264 since it's widely compatible
        if "video" in media_type:
            # Define a path for the H.264 video
            h264_file_path = os.path.join(out_dir, "h264encodedfile.mp4")
            # Convert video to H.264
            reader = imageio.get_reader(out_file_path)
            writer = imageio.get_writer(h264_file_path, codec="h264", fps=reader.get_meta_data()['fps'])
            for frame in reader:
                writer.append_data(frame)
            reader.close()
            writer.close()
            # Update media type
            media_type = "video/h264"
            # Update the output file path to be the one for the H264 encoded video 
            out_file_path=h264_file_path

        # Encode the img/vid file into a string to be able to be sent as JSON
        with open(out_file_path, "rb") as output_file:
            encoded_string = base64.b64encode(output_file.read())

        # Create the response body
        response = {
            "mime": media_type,
            "base64_encoded_string": encoded_string,
            "classes_detected": classes_detected,
            "results": json_results
        }
        return response

    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=str(err))
    finally:
        shutil.os.remove(filename)
        shutil.rmtree("YOLO_output")