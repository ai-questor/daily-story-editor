# background_removal.py
import io
import numpy as np
from PIL import Image
from rembg import remove
from segment_anything import sam_model_registry, SamPredictor
import torch
import os
import cv2

def remove_background(file_bytes, method="rembg", save_original_path="temp/original.png"):
    """
    배경 제거 후 RGBA 이미지 반환.
    - rembg: U2Net 기반, 빠르고 간단
    - sam: SAM 기반, 오브젝트 중심 마스크 추출
    - sam 방식일 경우 오브젝트만 따로 떼어낸 이미지를 save_original_path에 저장
    """
    if method == "rembg":
        product_rgba = Image.open(io.BytesIO(remove(file_bytes))).convert("RGBA")
        # 저장
        os.makedirs(os.path.dirname(save_original_path), exist_ok=True)
        product_rgba.save(save_original_path)
        return product_rgba

    elif method == "sam":
        device = "cuda" if torch.cuda.is_available() else "cpu"
        sam = sam_model_registry["vit_h"](checkpoint="weights/sam_vit_h_4b8939.pth")
        sam.to(device=device)
        predictor = SamPredictor(sam)

        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        np_img = np.array(image)
        predictor.set_image(np_img)

        h, w, _ = np_img.shape
        input_point = np.array([[w // 2, h // 2]])
        input_label = np.array([1])

        masks, _, _ = predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=False,
        )

        mask = masks[0].astype(np.uint8) * 255

        # RGBA 변환
        rgba = cv2.cvtColor(np_img, cv2.COLOR_RGB2RGBA)

        # 알파 채널 적용
        rgba[:, :, 3] = mask

        # 배경 제거: RGB 채널에도 마스크 곱하기
        rgba[:, :, 0] = rgba[:, :, 0] * (mask // 255)
        rgba[:, :, 1] = rgba[:, :, 1] * (mask // 255)
        rgba[:, :, 2] = rgba[:, :, 2] * (mask // 255)

        product_rgba = Image.fromarray(rgba)

        # 오브젝트만 따로 저장
        os.makedirs(os.path.dirname(save_original_path), exist_ok=True)
        product_rgba.save(save_original_path)

        return product_rgba

    else:
        raise ValueError("지원하지 않는 방식입니다. 'rembg' 또는 'sam'을 선택하세요.")


def get_sam_mask(file_bytes, invert=True, save_path="temp/mask.png"):
    """
    SAM 마스크만 추출해서 반환.
    - 기본: 오브젝트 영역이 1(True)
    - 인페인팅용으로 쓰려면 invert=True로 반전 (배경=255, 오브젝트=0)
    - 생성된 마스크 이미지를 save_path에 저장
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    sam = sam_model_registry["vit_h"](checkpoint="weights/sam_vit_h_4b8939.pth")
    sam.to(device=device)
    predictor = SamPredictor(sam)

    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    np_img = np.array(image)
    predictor.set_image(np_img)

    h, w, _ = np_img.shape
    input_point = np.array([[w // 2, h // 2]])
    input_label = np.array([1])

    masks, _, _ = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=False,
    )

    raw_mask = masks[0]
    if invert:
        inpaint_mask = (~raw_mask.astype(bool)).astype(np.uint8) * 255
    else:
        inpaint_mask = raw_mask.astype(np.uint8) * 255

    mask_img = Image.fromarray(inpaint_mask)

    # 저장 디렉토리 생성 후 저장
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    mask_img.save(save_path)

    return mask_img
