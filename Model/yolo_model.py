# -*- coding: utf-8 -*-
"""yolo_model.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1pfiMqzeuMPrNsKtA-YbqYLh-Pqhu3bp_
"""

!pip install ultralytics

from ultralytics import YOLO
from itertools import chain 
import cv2
from google.colab.patches import cv2_imshow
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from numpy import savetxt
from ultralytics.yolo.utils.ops import scale_image
import imageio

# Useful Resources
# Yolo Docs
# https://www.youtube.com/watch?v=m9fH9OWn8YM&ab_channel=Computervisionengineer
# https://docs.ultralytics.com/yolov5/train_custom_data/?h=#13-organize-directories

def generate_yaml_file():
    # YAML files are like configuration files for your dataset
    # They contain information about the dataset, like its location
    # and more importantly, the various classes and labels in the dataset
    # Yolo can generate the YAML file for you, if you tell it where the data is
    pass


def create_new_model(name = 'yolov8n.yaml', task = "segment"):
    # Create a new YOLO model from scratch (if you don't want to use the Yolo pretrained Models)
    # default task is "detect". 
    model = YOLO(name, task)    # contains the hyper-parameters, class labels, etc.
    return model


def load_pretrained_model(model_name, task = "segment"):
    # Load a pretrained YOLO model  e.g. yolov8n.pt or your own model
    # You can pass in either a .yaml or .pt file into the YOLO constructor
    # I believe .yaml creates a new model, .pt file loads a model
    model = YOLO(model_name, task)  # actual pretrained model
    return model


def train_model(model, dataset='coco128-seg.yaml', epochs = 10):
    # Train your model on a custom dataset
    # Training the model generates two .pt files (best.pt and last.pt) 
    # in the runs/'task_type'/train/weights folder
    # We can later use any of these to reload the model, or resume training (best.pt is recommended)
    # Training createsa a folder called 'train' which also contains all the results and graphs (showing loss)
    results = model.train(data=dataset, epochs=epochs)
    return model


def evaluate_model(model):
    # Evaluate the model's performance on the validation set
    results = model.val()


def export_model(model):
    # Exports the model (default is .torchscript)
    # By using the format parameter, you can export it to other model types (e.g TensorRT)
    # Don't use this for 'saving' the model. That is done during training automatically.
    success = model.export(format="onnx")


def get_labels_per_frame(results, unique=False):
    """
    This function returns a list of classes that have appeared in a single frame.

    params:
        unique: This parameter determines whether the classes in the return value will be unique or not. 

    returns:
        A list of tuples, in the format: (class_id, class_name)
    """
    labels = []
    all_labels = results[0].names

    if unique:
        for result in results:
            print(set(result.boxes.cls.tolist()))
            labels.append([(num, all_labels[num]) for num in set(result.boxes.cls.tolist())])
    else:
        for result in results:
            labels.append([(num, all_labels[num]) for num in result.boxes.cls.tolist()])
    return labels


def get_labels_per_video(results):
    """
    This function returns a list of all unique classes that have appeared in this video.

    returns:
        A list of tuples, in the format: (class_id, class_name)
    """
    labels = get_labels_per_frame(results)
    labels = list(set((chain.from_iterable(labels))))
    return labels


def get_image_from_mask(result, classes='all', save=True):
    """
    This function isolates an object(s) from the background using its masks in a frame.

    params:
        result: The result for a single frame
        classes: A list which defines which classes should be included in the output image. 
        save: Boolean value which defines whether to save image to the disk
    returns:
        A numpy image array
    """
    background = result.orig_img
    mask_image = np.zeros((background.shape[0], background.shape[1]), dtype=np.uint8)
    
    if result.masks != None:  # If no masks are found, return a black image
        for index, mask in enumerate(result.masks.xy):
            class_id = result.boxes.cls.tolist()[index]

            # Filter classes if required, and draw the object onto the mask
            if classes=='all' or class_id in classes:
                mask = np.round(mask, decimals=0)
                mask = mask.astype(int)
                cv2.fillPoly(mask_image, [mask], (255, 255, 255))

        # Apply the mask containing all our required classes to the background image to extract the segmented region
        segmented_region = cv2.bitwise_and(background, background, mask=mask_image)
        image = Image.fromarray(segmented_region)
        if save:
            image.save(f'output.png')
        return np.array(image)
    return np.zeros_like(background)


def get_video_from_mask(results, path="output.mp4", classes="all"):
    """
    This function creates a video which isolates all the required classes, 
    and removes the background and other irrelvant classes.

    params:
        results: The list of results (output from the model prediction)
        path: Name or file path of the output video
        classes: list of classes to isolate and extract. By default, all classes are extracted.
    returns:
        None
    """
    frames = []

    for index, result in enumerate(results):
        frame = get_image_from_mask(result, classes=classes)
        frames.append(frame)
    imageio.mimsave(path, frames, fps=30, quality=8, codec='h264')


#### Creating a new model
model = create_new_model("yolov8n-seg.pt", "segment")
train_model(model)
detection_output = model.predict(source="dance.mp4", conf=0.4) 


#### Loading an existing model for predicting
# model = load_pretrained_model('runs/segment/train/weights/best.pt', "segment")
# detection_output = model.predict(source="dance.mp4", conf=0.3, save=True) 


### Loading an existing model for further training
# model = load_pretrained_model('runs/segment/train/weights/best.pt', "segment")
# train_model(model)
# detection_output = model.predict(source="dance.mp4", conf=0.3, save=True) 



#### MISC. INFO

# PyTorch models (.pt) can be used to train, val, predict and export, i.e. 'yolo export model=yolov8n.pt', 
# but exported formats like ONNX, TensorRT etc. only support 'predict' and 'val' modes, 
# i.e. 'yolo predict model=yolov8n.onnx'.

# You can directly use the model class, and also pull images from URLs automatically.
# results = model('https://ultralytics.com/images/bus.jpg')
# detection_output = model.predict(source="https://ultralytics.com/images/bus.jpg", conf=0.25, save=True)



