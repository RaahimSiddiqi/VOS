from fastapi import FastAPI, HTTPException, UploadFile, File, status, Depends
from fastapi.responses import JSONResponse
import os
from ultralytics import YOLO
import firebase_admin
from auth import firebase_auth

# Use the service account keys to create a credentials.Certificate to connect to firebase
cred = firebase_admin.credentials.Certificate('vos_service_account_keys.json')
# Use those credentials to initialize the firebase_admin app which will verify the JWT
firebase_admin.initialize_app(cred)

app = FastAPI()

MAX_MB = 250

@app.post("/predict", dependencies=[Depends(firebase_auth)])
async def predict_segments(file: UploadFile = File(...), conf_thresh: float = 0.3):
    if not (file.content_type.startswith("image/") or file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Invalid file type. The file must be an image or a video")
    if file.size > MAX_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File is too large. The maximum allowed size is {MAX_MB} MB.")
    if conf_thresh <= 0 or conf_thresh >= 1:
        raise HTTPException(
            status_code=400, detail="Confidence threshold must be between 0 and 1")
    try:
        with open(file.filename, "wb") as buffer:
            buffer.write(await file.read())

        model = YOLO('models/yolov8s-seg.pt', "segment")
        
        #For testing save=True
        # output = model.predict(source=file.filename, conf=conf_thresh, save=True, project="output")
        
        output = model.predict(source=file.filename, conf=conf_thresh, save=False)
        
        #For testing
        # print("\n\noutput\n\n")
        # print("LENGTH:",len(output))
        # print(type(output))

        # print("\n\noutput[0]\n\n")
        # print("LENGTH:",len(output[0]))
        # print(type(output[0]))

        # print("\n\noutput[0][0]\n\n")
        # print("LENGTH:",len(output[0][0]))
        # print(type(output[0][0]))

    finally:
        os.remove(file.filename)
    
    results_list=[]
    for frame in output:
        for result in frame:
            print("\n\n",result)
    return JSONResponse(content=results_list)