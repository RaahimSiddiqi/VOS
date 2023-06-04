# VOS
Video Object Segmentation with Yolov8
## Abstract:
This project presents an application that builds upon the You Only Look Once (YOLO) object
detection and segmentation framework to provide an efficient and user-friendly solution for
object detection, segmentation, background removal, and replacement. The application features
two working AI models (COCO-trained and DAVIS2017-trained) which the user can select from,
each featuring a unique set of class labels.
## Introduction:
Video object segmentation (VOS) is a challenging task in computer vision that involves
detecting and segmenting objects in a video sequence. VOS has gained significant attention in
recent years due to its numerous practical applications, ranging from video editing and
surveillance to autonomous driving and robotics.
The You Only Look Once (YOLO) object detection and segmentation framework has been
successful in achieving fast and precise results in real-time object detection and segmentation.
The YOLO model has been through many improvements since its release in 2015 (YOLOv1),
and is currently on YOLOv8 (Jan. 2023).
## Project Motivation:
The motivation behind developing our VOS application stems from the growing demand for
efficient and user-friendly tools in the field of computer vision. Despite the advancements in
VOS-related tasks and image processing techniques, accessing and utilizing these capabilities
often requires extensive knowledge and expertise.
YOLO is primarily a programming framework and may require advanced programming
knowledge to use. Our project aims to address this challenge by providing a comprehensive
solution that combines various VOS and image/video processing tasks under a single, intuitive
interface.
1. Object detection
2. Image segmentation
3. Video segmentation
4. Background removal
5. Background replacement
Our application empowers users with a simplified and accessible tool to harness the power of
computer vision, regardless of their technical background.
## Methodology:
The proposed application is based on the YOLO object detection and segmentation framework. It
provides a user interface that allows users to upload images or videos and select the desired
functionality (i.e., object detection, segmentation, background removal, or replacement). The
application uses pre-trained YOLO models to detect and segment objects in the images or videos
[Fig 1].
Users can also filter objects by class to segment only relevant objects. The application uses
image processing techniques, such as alpha blending and inpainting, to remove the background
of the segmented objects. Using the filter-by-class option, we can choose to extract only relevant
objects from the image [Fig 2].
For background replacement, users can select an image or video to use as the new background,
which is then blended with the foreground object using alpha blending [Fig 3].
![Untitled](https://github.com/RaahimSiddiqi/VOS/assets/87665048/9e483bdb-6bf8-4d9b-87ca-7190bed0b360)
<p align="center">
  <em><strong>[Fig 1]</strong></em>
</p>

![Untitled (1)](https://github.com/RaahimSiddiqi/VOS/assets/87665048/d0c96799-b5e4-42f2-bb27-5bfb60f40974)
<p align="center">
  <em><strong>[Fig 2]</strong></em>
</p>

![Untitled (2)](https://github.com/RaahimSiddiqi/VOS/assets/87665048/d825c5b0-0c1a-494a-bd2e-4539651d99cb)
<p align="center">
  <em><strong>[Fig 3]</strong></em>
</p>

## Data
Our application uses two models, each trained on a different dataset. YOLO is natively trained on the famous COCO dataset, which is widely used for image segmentation and object detection. As an alternative, and for research purposes, we have applied transfer learning to further train this YOLO model on the DAVIS dataset which features a different set of labels (with some overlap).
The COCO (Common Objects in Context) dataset is a large-scale dataset of natural images that contains over 330,000 images with more than 2.5 million object instances labeled with 80 different object categories. The images were collected from various sources and represent a wide range of scenes and objects in natural contexts. The dataset is commonly used for object detection, segmentation, and captioning tasks.
The Davis2017 dataset is a benchmark dataset for video object segmentation that consists of 50 high-resolution video sequences with pixel-level annotations. The dataset covers a wide range of challenging scenarios such as object occlusion, motion blur, and fast camera motion. The dataset is commonly used for evaluating the performance of video object segmentation algorithms. 
## Evaluation Criteria:
### Box_loss:
Box loss is used to measure the difference between the predicted bounding boxes and the ground truth bounding boxes.
### Seg_loss:
Seg loss is the segmentation loss used in YOLO segmentation. It measures the difference between the predicted segmentation mask and the ground truth segmentation mask.
### Cls_loss:
Cls loss is the classification loss used in YOLO segmentation. It measures the difference between the predicted class probability and the ground truth class probability.
### Precision and Recall:
Precision measures how accurately the model identifies objects in an image. Specifically, precision is the proportion of the objects that the model has correctly identified out of all the objects it has detected. In other words, precision measures the fraction of the objects detected by the model that are actually relevant (i.e., true positives).
Recall measures how well the model is able to detect all the relevant objects in an image. Recall is the proportion of the relevant objects that the model has correctly identified out of all the relevant objects in the image. In other words, recall measures the fraction of the relevant objects in the image that have been detected by the model (i.e., true positives), out of all the relevant objects present in the image (i.e., true positives and false negatives).
### Mean Average Precision:
Mean average precision (mAP) is a commonly used metric to evaluate the performance of object detection models, including YOLO segmentation models.
mAP is computed as the average of the precision-recall curve across different object classes and different IoU (Intersection over Union) thresholds.
### Macro(M) and Best(B) metrics:
Macro and Best are two types of metrics used to evaluate the performance of machine learning models. Macro metrics calculate the average performance of the model across all classes or data points, while Best metrics identify the best-performing data point or class for a particular metric.
When evaluating a YOLO segmentation model's performance, macro-average precision calculates the average precision across all object classes, while the best precision metric identifies the highest precision achieved by the model for any object class.
## Results

![Screenshot_4](https://github.com/RaahimSiddiqi/VOS/assets/87665048/39dc1b93-03d7-477c-a20c-7ef8c08d195d)
<p align="center">
  <em><strong>[Training Loss]</strong></em>
</p>

![pasted image 0](https://github.com/RaahimSiddiqi/VOS/assets/87665048/fa3fba78-020d-4310-8719-bf9fc7e1cc0d)
<p align="center">
  <em><strong>[Validation Loss]</strong></em>
</p>

![pasted image 0 (1)](https://github.com/RaahimSiddiqi/VOS/assets/87665048/63a822a0-f991-4f7f-b89e-d540e62a2864)
<p align="center">
  <em><strong>[Precision and Recall]</strong></em>
</p>

![pasted image 0 (2)](https://github.com/RaahimSiddiqi/VOS/assets/87665048/71fd841b-3afa-40b8-99f9-ac4dcd551a63)
<p align="center">
  <em><strong>[Mean Accuracy]</strong></em>
</p>

## Observations during Training:
* Validation loss either stays constant or worsens after epoch 50.
* Training loss decreases with every epoch.
* The precision graph fluctuates between 0.6 and 0.9 for the first 100 epochs, finishing at 0.8.
* The recall graph shows a consistent trend of gradual improvement over the first 50 epochs, and finishes at 0.6.
* Accuracy peaks around epoch 50.
## Important Training Parameters used:
* Epochs  = 150
* Learning Rate = 0.001
* Patience = 100
* Batch_size = 16
* Imgsz = 640
## Future Work
In future work, there are exciting opportunities to further enhance our VOS application and extend its capabilities. One potential area of improvement is the addition of a dynamic changing background replacement feature for videos. Currently, our application supports static background replacement, allowing users to replace the background of a video with a pre-selected image. However, incorporating dynamic background replacement would enable users to choose from a range of dynamic backgrounds or even utilize real-time video feeds as the replacement background.

Another avenue for future development is the integration of real-time VOS support. While our current application handles VOS tasks effectively, it operates on pre-recorded videos or images. By implementing real-time VOS capabilities, users would be able to perform object detection, segmentation, and background removal on live video streams. This advancement would be particularly beneficial for applications requiring immediate feedback or interaction, such as video conferencing, augmented reality, and live event coverage.
