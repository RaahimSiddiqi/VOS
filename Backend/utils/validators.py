from fastapi import HTTPException, UploadFile, status
import os
import json

# To limit the size of the file that the user can send
MAX_MB = 250

#These are some of the valid extensions for YOLO that we allow in our app
VALID_IMG_VID_EXTENSIONS = {
    '.bmp', '.dng', '.jpeg', '.jpg', '.mpo', '.png', '.tif', '.tiff', '.webp',
    '.pfm', '.asf', '.avi', '.gif', '.m4v', '.mkv', '.mov', '.mp4', '.mpeg',
    '.mpg', '.ts', '.wmv', '.webm'
}

VALID_BG_IMAGE_EXTENSIONS = {'.jpeg', '.jpg', '.png'}


def validate_input_file(file: UploadFile):
    if os.path.splitext(file.filename)[1] not in VALID_IMG_VID_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=
            f"Invalid file type. Only the following extensions are allowed: {', '.join(VALID_IMG_VID_EXTENSIONS)}"
        )
    if file.size > MAX_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=
            f"File is too large. The maximum allowed size is {MAX_MB} MB.")


def validate_bg_image_file(bg_image: UploadFile | None):
    if os.path.splitext(bg_image.filename)[1] not in VALID_BG_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=
            f"Invalid bg_image file type. Only the following extensions are allowed: {', '.join(VALID_BG_IMAGE_EXTENSIONS)}"
        )
    if bg_image.size > MAX_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=
            f"bg_image file is too large. The maximum allowed size is {MAX_MB} MB."
        )


def validate_thresholds(conf_thresh: float, iou_thresh: float):
    if conf_thresh < 0.0 or conf_thresh > 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confidence threshold must be in the range 0 to 1 inclusive"
        )
    if iou_thresh < 0.0 or conf_thresh > 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IOU threshold must be in the range 0 to 1 inclusive")


def validate_filter_classes(filter_classes: str | None):
    if filter_classes is not None:
        try:
            filter_classes = json.loads(filter_classes)
        except Exception as err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"filter_classes: {type(err).__name__}: {err}")
        if not isinstance(filter_classes,
                          list) or len(filter_classes) == 0 or any(
                              not isinstance(x, int) for x in filter_classes):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=
                "filter_classes may only be null or a stringified JSON list of ints containing atleast 1 element"
            )
    return filter_classes


def validate_color_code(color_code: str | None):
    #check if it's either None or a list of 4 ints(cast to tuple), then return it
    if color_code is not None:
        try:
            color_code = json.loads(color_code)
        except Exception as err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"color_code: {type(err).__name__}: {err}")
        if not isinstance(color_code, list) or len(color_code) != 4 or any(
                not isinstance(x, int) for x in color_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=
                "color_code may only be null or a stringified JSON list of exactly 4 ints"
            )
        color_code = tuple(color_code)
    return color_code

def validate_results(results: str):
    #Check if results can be jsonified and raise exception for invalid format
    try:
        results = json.loads(results)
    except Exception as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"results: {type(err).__name__}: {err}")
    return results