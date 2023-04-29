from services.InferenceController import InferenceController
from utils.auth import firebase_auth
from fastapi import FastAPI, HTTPException, UploadFile, File, status, Depends
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import shutil
from typing import List
from enum import Enum, IntEnum
import firebase_admin

# Use the service account keys to create a credentials.Certificate to connect to firebase
cred = firebase_admin.credentials.Certificate('vos_service_account_keys.json')
# Use those credentials to initialize the firebase_admin app which will verify the JWT
firebase_admin.initialize_app(cred)

app = FastAPI()

# To limit the size of the file that the user can send
MAX_MB = 250


class ModelName(str, Enum):
    yolo = "yolov8s-seg"
    davis = "yolov8s-seg-davis"


class OutputVideoCase(IntEnum):
    MASK_BOX_LABEL_CONF = 1
    MASK = 2
    MASK_BOX = 3
    MASK_BOX_LABEL = 4


# @app.post("/predict", dependencies=[Depends(firebase_auth)])
@app.post("/predict")
async def predict_segments(model_name: ModelName,
                           output_video_case: OutputVideoCase,
                           file: UploadFile = File(...),
                           conf_thresh: float = 0.25,
                           iou_thresh: float = 0.7,
                           filter_classes: List[int] | None = None):

    if not (file.content_type.startswith("image/")
            or file.content_type.startswith("video/")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. The file must be an image or a video")
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
        output_file_path = f"YOLO_output/video/{filename}"
        ##############
        response_dict = {
            "classes_detected": classes_detected,
            "results": json_results
        }
        return JSONResponse(content=response_dict)
        ##############

    except Exception as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=str(err))
    finally:
        shutil.os.remove(filename)
        shutil.rmtree("YOLO_output")