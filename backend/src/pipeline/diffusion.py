from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionXLPipeline,
    StableDiffusionInpaintPipeline,
)
import torch
from PIL import Image
from typing import Tuple
from config import SD_MODEL, SDXL_MODEL, SD_INPAINT_MODEL, SDXL_INPAINT_MODEL

_sd_pipe = None
_sdxl_pipe = None
_inpaint_pipe = None
_sdxl_inpaint_pipe = None

def _init_sd(model: str):
    global _sd_pipe
    if _sd_pipe is None:
        _sd_pipe = StableDiffusionPipeline.from_pretrained(
            model, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        if torch.cuda.is_available():
            _sd_pipe = _sd_pipe.to("cuda")
    return _sd_pipe

def _init_sdxl(model: str):
    global _sdxl_pipe
    if _sdxl_pipe is None:
        _sdxl_pipe = StableDiffusionXLPipeline.from_pretrained(
            model, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        if torch.cuda.is_available():
            _sdxl_pipe = _sdxl_pipe.to("cuda")
    return _sdxl_pipe

def _init_inpaint(model: str = SD_INPAINT_MODEL):
    global _inpaint_pipe
    if _inpaint_pipe is None:
        _inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            model, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        if torch.cuda.is_available():
            _inpaint_pipe = _inpaint_pipe.to("cuda")
    return _inpaint_pipe

def _init_sdxl_inpaint(model: str = SDXL_INPAINT_MODEL):
    global _sdxl_inpaint_pipe
    if _sdxl_inpaint_pipe is None:
        _sdxl_inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            model, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        if torch.cuda.is_available():
            _sdxl_inpaint_pipe = _sdxl_inpaint_pipe.to("cuda")
    return _sdxl_inpaint_pipe

def parse_size(s: str) -> Tuple[int,int]:
    w, h = s.split("x")
    return int(w), int(h)

def generate_background(prompt: str, size: str = "768x768", use_sdxl: bool = True, model_override: str | None = None) -> Image.Image:
    w, h = parse_size(size)
    if use_sdxl:
        pipe = _init_sdxl(model_override or SDXL_MODEL)
    else:
        pipe = _init_sd(model_override or SD_MODEL)
    image = pipe(prompt, height=h, width=w).images[0]
    return image.convert("RGB")

def generate_inpainted_background(product: Image.Image, mask: Image.Image, prompt: str, size: str = "768x768", use_sdxl: bool = False) -> Image.Image:
    w, h = parse_size(size)
    if use_sdxl:
        pipe = _init_sdxl_inpaint()
    else:
        pipe = _init_inpaint()
    result = pipe(prompt=prompt, image=product, mask_image=mask, height=h, width=w).images[0]
    return result.convert("RGB")
