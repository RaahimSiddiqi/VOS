import cv2
from PIL import Image
import numpy as np
import imageio
import os
from tqdm import tqdm
from InferenceController import InferenceController


class BackgroundController():
    def __init__(self, source, results) -> None:
        self.extension = os.path.splitext(source)[1].lower()
        self.results = results

        if self.extension in ['.mp4', '.avi', '.mkv', '.mov']:
            self.original_frame_data = self.extract_data_from_video(source)
        elif self.extension in ['.bmp', '.jpeg', '.jpg', '.png', '.tif', '.webp']:      
            self.original_frame_data = [np.array(Image.open(source))]


    def extract_data_from_video(self, source):
        video_capture = cv2.VideoCapture(source)
        num_frames = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))

        frames = []
        for i in tqdm(range(num_frames)):
            # set the current frame position
            video_capture.set(cv2.CAP_PROP_POS_FRAMES, i)

            # read the next frame. if there are no more frames, exit the loop
            ret, frame = video_capture.read()
            if not ret:
                break

            frame = np.asarray(frame)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame)

        video_capture.release()
        cv2.destroyAllWindows()
        return frames


    def predict(self, *args, **kwargs):
        if self.extension in ['.mp4', '.avi', '.mkv', '.mov']:
            self.get_object_from_video(self.results, *args, **kwargs)
        elif self.extension in ['.bmp', '.jpeg', '.jpg',  '.png', '.tif', '.webp']:
            self.get_object_from_image(self.results["0"], self.original_frame_data[0], *args, **kwargs)


    def get_colormap(self):
        return [
        (128, 0, 0), # red
        (0, 128, 0), # green
        (128, 128, 0), # yellow
        (0, 0, 128), # blue
        (128, 0, 128), # purple
        (0, 128, 128), # cyan
        (128, 128, 128), # silver
        (64, 0, 0) # brown
    ]


    def get_object_from_image(self, result, original_frame, classes=None, save=True, mask=False, background_path=None):
        """
        This function isolates an object(s) from the background using its masks in a frame.

        params:
            result: The result for a single frame
            original_frame: Contains the data from the original frame of the video in numpy array form
            classes: A list which defines which classes should be included in the output image. 
            save: Boolean value which defines whether to save image to the disk
            background_path: Filepath of the background image which will replace the old background.
        returns:
            A numpy image array
        """
        background = original_frame
        if background.shape[2] != 4:
            background = cv2.cvtColor(background, cv2.COLOR_RGB2RGBA)
        mask_image = np.zeros((background.shape[0], background.shape[1]), dtype=np.uint8)
        
        if result["masks"] != None:  # If no masks are found, return a black image
            for index, mask in enumerate(result["masks"]):
                class_id = result["labels"][index]

                # Filter classes if required, and draw the object onto the mask
                if classes is None or class_id in classes:
                    mask = np.round(mask, decimals=0)
                    mask = mask.astype(int)
                    cv2.fillPoly(mask_image, [mask], (255, 255, 255))

            # Apply the mask containing all our required classes to the background image to extract the segmented region
            segmented_region = cv2.bitwise_and(background, background, mask=mask_image)
            
            if background_path:
                new_background = np.array(Image.open(background_path).resize((original_frame.shape[1], original_frame.shape[0])))
                if new_background.shape[2] == 3: 
                    new_background = cv2.cvtColor(new_background, cv2.COLOR_RGB2RGBA)
                mask = np.all(segmented_region == [0, 0, 0, 0], axis=-1)
                segmented_region[mask] = new_background[mask]

            image = Image.fromarray(segmented_region)
            if save:
                image.save("output.png")
            return np.array(image)
        if background_path:
            return np.array(Image.open(background_path).resize((original_frame.shape[1], original_frame.shape[0])))
        return np.zeros_like(background)


    def get_object_from_video(self, results, classes=None, background_path=None):
        """
        This function creates a video which isolates all the required classes, 
        and removes the background and other irrelvant classes.

        params:
            results: The list of results (output from the model prediction)
            path: Name or file path of the output video
            classes: list of classes to isolate and extract. By default, all classes are extracted.
            background_path: Filepath of the background image which will replace the old background
        returns/output:
            Saves a video using the processed frames acquired from other functions.
        """
        frames = []
        for index, result in enumerate(tqdm(results)):
            frame = self.get_object_from_image(results[str(index)], self.original_frame_data[index], 
                                               classes=classes, save=False, background_path=background_path)
            frames.append(frame)  
        imageio.mimsave("output.mp4", frames, fps=24, quality=8, codec='h264') 



### HOW TO USE
model_path = "C://Users//RaahimSiddiqi//Desktop//Code//VSC//VOS//Model//models//yolov8s-seg-davis.pt"
source_path = "C://Users//RaahimSiddiqi//Desktop//Code//VSC//VOS//Model//videos//input10.mp4"

inferenceController = InferenceController(model_path, source_path)
results, classes = inferenceController.predict()

backgroundController = BackgroundController(source_path, results)
backgroundController.predict()