from ultralytics import YOLO
from itertools import chain 
import numpy as np
import json

# class NumpyEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, np.ndarray):
#             return obj.tolist()
#         return json.JSONEncoder.default(self, obj)

class InferenceController():
    #Loads the required YOLO model for segmenting
    def __init__(self, model_path):
        self.model = YOLO(model_path, "segment")

    #Takes any arguments required by YOLO's predict func and the filepath to the img/vid
    #Returns the results object
    def predict(self, file_path, *args, **kwargs):
        results = self.model.predict(file_path, save=True, project='YOLO_output', name='video', *args, **kwargs)
        return results

    #The JSON objects are indexed by their frame no. (only 1 frame for an image)
    def results_to_json_format(self, results):
        json_results = {}

        for index, result in enumerate(results):
            json_results[index] = {
                "boxes": [[round(num, 4) for num in sublist] for sublist in result.boxes.xywh.tolist()] if len(result.boxes.xywh.tolist()) != 0 else None,
                "masks" : [[[round(float(val), 2)  for val in inner] for inner in mask] for mask in result.masks.xy] if result.masks is not None else None,
                "scores": [round(score, 4) for score in result.boxes.conf.tolist()] if len(result.boxes.conf.tolist())!=0 else None,
                "labels": result.boxes.cls.tolist() if len(result.boxes.cls.tolist())!=0 else None,
            }       
        return json_results

    def get_labels_per_video(self, results):
        """
        This function returns a list of all unique classes that have appeared in this video.

        returns:
            A list of tuples, in the format: (class_id, class_name)
        """
        labels = self.get_labels_per_frame(results, results[0].names)
        labels = list(set((chain.from_iterable(labels))))
        return sorted(labels, key=lambda x: x[0])

    def get_labels_per_frame(self, results, unique=False):
        """
        This function returns a list of classes that have appeared in a single frame.

        params:
            unique: This parameter determines whether the classes in the return value will be unique or not. 

        returns:
            A list of tuples, in the format: (class_id, class_name)
        """
        labels = []
        all_labels = results[0].names
        temp = []

        if unique:
            for result in results:
                temp = [(num, all_labels[num]) for num in set(result.boxes.cls.tolist())]
        else:
            for result in results:
                temp =  [(num, all_labels[num]) for num in result.boxes.cls.tolist()]

        if len(temp) > 0:
            labels.append(temp)
        return sorted(labels, key=lambda x: x[0])

### Important Parameters for Prediction
# conf           	0.25	    object confidence threshold for detection
# iou	            0.7
# save	            False
# show_labels	    True	    hide labels
# show_conf	        True	    hide confidence scores
# classes	        None	    filter results by class, i.e. class=0, or class=[0,2,3]
# boxes	            True	    Show boxes in segmentation predictions