def evaluate_model(model):
    # Evaluate the model's performance on the validation set
    results = model.val()


def export_model(model):
    # Exports the model (default is .torchscript)
    # By using the format parameter, you can export it to other model types (e.g TensorRT)
    # Don't use this for 'saving' the model. That is done during training automatically.
    success = model.export(format="onnx")


def get_object_mask_from_image(result, classes='all', color_dict=None, save=True, background_path=None):
    """
    This function isolates an object(s)'s masks from the background using its masks in a frame.

    params:
        result: The result for a single frame
        classes: A list which defines which classes should be included in the output image. 
        save: Boolean value which defines whether to save image to the disk
        background_path: Filepath of the background image which will replace the old background
    returns:
        A numpy image array
    """
    if len(result) == 1:
        result = result[0]
    if classes == 'all':
        classes = result["labels"]

    if color_dict == None:
        colors = get_colormap()
        color_dict = {classes[i]: colors[i % len(colors)] for i in range(len(classes))}

    background = np.zeros((result["frame"].shape[0], result["frame"].shape[1], result["frame"].shape[2]), dtype=np.uint8)
    image = Image.fromarray(background)
    draw = ImageDraw.Draw(image)
    mask_image = np.zeros((result["frame"].shape[0], result["frame"].shape[1]), dtype=np.uint8)

    if result.masks != None:  # If no masks are found, return a black image
        for index, mask in enumerate(result["masks"]):
            class_id = result["labels"][index]
            if class_id not in classes: continue

            draw.polygon(mask, outline="white", fill=color_dict[class_id])
        if save:
            image.save(f'output.png')   
        return np.array(image)
    return np.zeros_like(background)