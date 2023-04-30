from services.InferenceController import InferenceController
from services.BackgroundController import BackgroundController, convert_colorcode_to_image
from utils.auth import firebase_auth
import os
import shutil
import mimetypes
import base64
import imageio
from typing import List, Optional, Annotated
from enum import Enum, IntEnum
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, status, Depends, Form
from fastapi.responses import FileResponse

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


# @router.post("/predict", dependencies=[Depends(firebase_auth)])
@router.post("/predict")
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
            writer = imageio.get_writer(h264_file_path,
                                        codec="h264",
                                        fps=reader.get_meta_data()['fps'])
            for frame in reader:
                writer.append_data(frame)
            reader.close()
            writer.close()
            # Update media type
            media_type = "video/h264"
            # Update the output file path to be the one for the H264 encoded video
            out_file_path = h264_file_path

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


#################################################################################
#################################################################################
#################################################################################
#################################################################################
#################################################################################
#################################################################################
#################################################################################
#################################################################################


# @router.post("/extract", dependencies=[Depends(firebase_auth)])
@router.post("/extract")
async def extract_segments(file: UploadFile = File(...),
                           bg_image: UploadFile | None = File(None),
                           color_code: tuple[int, int, int, int] | None = Form(None),
                           filter_classes: List[int] | None = Form(None),
                           results: str = Form()):

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
    if filter_classes is not None and len(filter_classes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="filtered_classes must be a list of ints or null")
    if color_code is not None and bg_image is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can either send a color_code or a bg_image, but not both")

    #Check if results can be jsonified and raise exception for invalid format
    try:
        results = json.loads(results)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=str(e))

    try:
        # Initialise all required file paths
        file_path = file.filename
        background_img_path = "background.png"

        # Guess the MIME type of the input file to decide the ext of the output file
        media_type = mimetypes.guess_type(file_path)[0]
        if "video" in media_type:
            ext=".mp4"
        elif "image" in media_type:
            ext=".png" 
        out_file_path = f"output_file{ext}"

        # Save the img/vid input file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        #If the bg_image was received then store it
        if bg_image:
            with open(background_img_path, "wb") as buffer:
                buffer.write(await file.read())
        #If color_code was given then create an image from it and store it
        elif color_code:
            convert_colorcode_to_image(color_code,
                                       output_path=background_img_path)
        #Else dont use a background image
        else:
            background_img_path=None

        # Uses the received vid/img file and the results object as input
        backgroundController = BackgroundController(file_path, results)
        
        #TODO check if filter_classes need to be validated, I assume it automatically accepts only a list of ints or null
        #      , but do not accept list of anything else or empty list or some other datatype then a list 

        # TODO: Just call the predict function once and pass all needed params, test all cases and file formats
        backgroundController.predict(output_path=out_file_path,
                                     classes=filter_classes,
                                     background_path=background_img_path)

        # Encode videos to h264 since it's widely compatible
        if "video" in media_type:
            # Define a path for the H.264 video
            h264_file_path = "h264encodedfile.mp4"
            # Convert video to H.264
            reader = imageio.get_reader(out_file_path)
            writer = imageio.get_writer(h264_file_path, codec="h264", fps=reader.get_meta_data()['fps'])
            for frame in reader:
                writer.append_data(frame)
            reader.close()
            writer.close()
            # Update the output file path to be the one for the H264 encoded video
            out_file_path=h264_file_path

        response = FileResponse(path=out_file_path)
        return response

    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=str(err))
    finally:
        if file_path is not None and os.path.exists(file_path):
            os.remove(file_path)
        if background_img_path is not None and os.path.exists(background_img_path):
            os.remove(background_img_path)
        
        #TODO: THE FILE IS BEING REMOVED BEFORE BEING SENT IN RESPONSE FIX THAT

        if out_file_path is not None and os.path.exists(out_file_path):
            os.remove(out_file_path)

@router.post("/try")
async def try_try(form_data: tuple[int, int, int, int] | None = Form(None)):
    print(form_data)
    return None