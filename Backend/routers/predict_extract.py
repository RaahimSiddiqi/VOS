from services.InferenceController import InferenceController
from services.BackgroundController import BackgroundController, convert_colorcode_to_image
from utils.auth import firebase_auth
from utils.validators import validate_filter_classes, validate_input_file, validate_thresholds, validate_color_code, validate_bg_image_file, validate_results
from utils.encoder import h264_encoder
import os
import shutil
import mimetypes
import base64
from enum import Enum, IntEnum
from fastapi import APIRouter, HTTPException, UploadFile, File, status, Depends, Form, BackgroundTasks
from fastapi.responses import FileResponse

router = APIRouter()


class ModelName(str, Enum):
    yolo = "yolov8s-seg"
    davis = "yolov8s-seg-davis"


class OutputVideoCase(IntEnum):
    MASK_BOX_LABEL_CONF = 1
    MASK = 2
    MASK_BOX = 3
    MASK_BOX_LABEL = 4


#Background Task
def remove_file(path: str):
    os.remove(path)


@router.post("/predict", dependencies=[Depends(firebase_auth)])
async def predict_segments(model_name: ModelName = Form(),
                           output_video_case: OutputVideoCase = Form(),
                           file: UploadFile = File(...),
                           conf_thresh: float = Form(0.25),
                           iou_thresh: float = Form(0.7),
                           filter_classes: str | None = Form(None)):

    validate_input_file(file)
    validate_thresholds(conf_thresh, iou_thresh)
    filter_classes = validate_filter_classes(filter_classes)

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
            out_file_path = h264_encoder(out_file_path)

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
        os.remove(filename)
        shutil.rmtree("YOLO_output")


@router.post("/extract", dependencies=[Depends(firebase_auth)])
async def extract_segments(background_tasks: BackgroundTasks,
                           file: UploadFile = File(...),
                           bg_image: UploadFile | None = File(None),
                           color_code: str | None = Form(None),
                           filter_classes: str | None = Form(None),
                           results: str = Form()):

    validate_input_file(file)
    validate_bg_image_file(bg_image)
    color_code = validate_color_code(color_code)
    filter_classes = validate_filter_classes(filter_classes)
    if color_code is not None and bg_image is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can either send a color_code or a bg_image, but not both")
    results = validate_results(results)

    try:
        # Initialise all required file paths
        file_path = file.filename
        background_img_path = "background.png"
        # Guess the MIME type of the input file to decide the ext of the output file
        media_type = mimetypes.guess_type(file_path)[0]
        if "video" in media_type:
            media_type = "video/mp4"
            ext = ".mp4"
        elif "image" in media_type:
            media_type = "image/png"
            ext = ".png"
        out_file_path = f"output{ext}"

        # Save the img/vid input file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        #If the bg_image was received then store it
        if bg_image:
            with open(background_img_path, "wb") as buffer:
                buffer.write(await bg_image.read())

        #If color_code was given then create an image from it and store it
        elif color_code:
            convert_colorcode_to_image(color_code,
                                       output_path=background_img_path)
        #Else dont use a background image
        else:
            background_img_path = None

        # Uses the received vid/img file and the results object as input
        backgroundController = BackgroundController(file_path, results)

        # Uses filter classes and background image if received from the user
        backgroundController.predict(classes=filter_classes,
                                     background_path=background_img_path)

        # Encode videos to h264 since it's widely compatible
        if "video" in media_type:
            out_file_path = h264_encoder(out_file_path)

        #If the output file is successfully returned then it will be deleted from the server too
        background_tasks.add_task(remove_file, out_file_path)
        return FileResponse(path=out_file_path,
                            media_type=media_type,
                            headers={
                                "Content-Disposition":
                                f"attachment; filename={out_file_path}"
                            })

    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=str(err))

    # Runs right before the return statement or if an exception occurred
    finally:
        # remove input file if it was stored
        if file_path is not None and os.path.exists(file_path):
            os.remove(file_path)
        # remove bg_image file if it was stored
        if background_img_path is not None and os.path.exists(
                background_img_path):
            os.remove(background_img_path)