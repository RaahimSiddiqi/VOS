from ultralytics import YOLO

model_path = "yolov8s-seg-davis.pt"
model = YOLO(model_path, task="segment")

model.predict("C://Users//RaahimSiddiqi//Desktop//Code//VSC//VOS//Model//videos//input7.mp4", save=True)