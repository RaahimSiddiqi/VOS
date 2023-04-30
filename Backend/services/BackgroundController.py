from tqdm import tqdm
import cv2
from PIL import Image
import numpy as np
import imageio
import os

class BackgroundController():
    def __init__(self, source, results) -> None:
        self.extension = os.path.splitext(source)[1].lower()
        self.results = results

        if self.extension == '.mp4':
            self.original_frame_data = self.extract_data_from_video(source)
        elif self.extension in ['.bmp', '.dng', '.jpeg', '.jpg', '.mpo', '.png', '.tif', '.tiff', '.webp','.pfm']:      
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
        if self.extension == '.mp4':
            self.get_object_from_video(self.results, *args, **kwargs)
        elif self.extension in ['.bmp', '.dng', '.jpeg', '.jpg', '.mpo', '.png', '.tif', '.tiff', '.webp','.pfm']:
            self.get_object_from_image(self.results[0], self.original_frame_data[0], *args, **kwargs)


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


    def get_object_from_image(self, result, original_frame, output_path="output.png", classes='all', save=True, mask=False, background_path=None, alpha=True):
        """
        This function isolates an object(s) from the background using its masks in a frame.

        params:
            result: The result for a single frame
            original_frame: Contains the data from the original frame of the video in numpy array form
            classes: A list which defines which classes should be included in the output image. 
            save: Boolean value which defines whether to save image to the disk
            background_path: Filepath of the background image which will replace the old background
            alpha: Decides whether the new background will be black or transparent.
        returns:
            A numpy image array
        """
        background = original_frame
        if alpha:
            background = cv2.cvtColor(background, cv2.COLOR_RGB2RGBA)
        mask_image = np.zeros((background.shape[0], background.shape[1]), dtype=np.uint8)
        
        if result["masks"] != None:  # If no masks are found, return a black image
            for index, mask in enumerate(result["masks"]):
                class_id = result["labels"][index]

                # Filter classes if required, and draw the object onto the mask
                if classes=='all' or class_id in classes:
                    mask = np.round(mask, decimals=0)
                    mask = mask.astype(int)
                    cv2.fillPoly(mask_image, [mask], (255, 255, 255))

            # Apply the mask containing all our required classes to the background image to extract the segmented region
            if alpha:
                segmented_region = cv2.bitwise_and(background, background, mask=mask_image)
            else:
                segmented_region = cv2.bitwise_and(background, background, mask=mask_image)
            
            if background_path:
                new_background = np.array(Image.open(background_path).resize((original_frame.shape[1], original_frame.shape[0])))
                if new_background.shape[2] == 4 and not alpha: # convert new_background RBG format if the output image must be RGB
                    new_background = cv2.cvtColor(new_background, cv2.COLOR_RGBA2RGB)
                    mask = np.all(segmented_region == [0, 0, 0], axis=-1)
                else:
                    mask = np.all(segmented_region == [0, 0, 0, 0], axis=-1)
                segmented_region[mask] = new_background[mask]

            image = Image.fromarray(segmented_region)
            if save:
                image.save(output_path)
            return np.array(image)
        if background_path:
            return np.array(Image.open(background_path).resize((original_frame.shape[1], original_frame.shape[0])))
        return np.zeros_like(background)


    def get_object_from_video(self, results, output_path="output.mp4", classes="all", background_path=None):
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
            frame = self.get_object_from_image(results[index], self.original_frame_data[index], 
                                               classes=classes, save=False, background_path=background_path)
            frames.append(frame)  
        imageio.mimsave(output_path, frames, fps=24, quality=8, codec='h264') 


def convert_colorcode_to_image(color_code, width=640, height=640, output_path="background.png"):
     # Create a new image with the specified size and color
    img = Image.new(mode="RGBA", size=(width, height), color=color_code)

    img.save(output_path)
    return output_path   