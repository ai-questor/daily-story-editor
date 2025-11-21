# background_removal.py
import io
import numpy as np
from PIL import Image
from rembg import remove

# SAM 관련 import
from segment_anything import sam_model_registry, SamPredictor
import torch
import cv2

def remove_background(file_bytes, method="rembg"):
    if method == "rembg":
        # rembg 방식
        product_rgba = Image.open(io.BytesIO(remove(file_bytes))).convert("RGBA")
        return product_rgba

    elif method == "sam":
        # SAM 방식
        device = "cuda" if torch.cuda.is_available() else "cpu"
        sam = sam_model_registry["vit_h"](checkpoint="weights/sam_vit_h_4b8939.pth")
        sam.to(device=device)
        predictor = SamPredictor(sam)

        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        np_img = np.array(image)
        predictor.set_image(np_img)

        h, w, _ = np_img.shape
        input_point = np.array([[w//2, h//2]])
        input_label = np.array([1])

        masks, _, _ = predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=False,
        )

        mask = masks[0].astype(np.uint8) * 255
        rgba = cv2.cvtColor(np_img, cv2.COLOR_RGB2RGBA)
        rgba[:, :, 3] = mask

        product_rgba = Image.fromarray(rgba)
        return product_rgba

    else:
        raise ValueError("지원하지 않는 방식입니다. 'rembg' 또는 'sam'을 선택하세요.")
