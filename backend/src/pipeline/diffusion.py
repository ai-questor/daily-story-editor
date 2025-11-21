from diffusers import StableDiffusionInpaintPipeline
import torch
from PIL import Image
from config import SD_INPAINT_MODEL, SDXL_INPAINT_MODEL

_inpaint_pipe = None
_sdxl_inpaint_pipe = None

def _init_inpaint(model: str = SD_INPAINT_MODEL):
    global _inpaint_pipe
    if _inpaint_pipe is None:
        _inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            model,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        if torch.cuda.is_available():
            _inpaint_pipe = _inpaint_pipe.to("cuda")
    return _inpaint_pipe

def _init_sdxl_inpaint(model: str = SDXL_INPAINT_MODEL):
    global _sdxl_inpaint_pipe
    if _sdxl_inpaint_pipe is None:
        _sdxl_inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            model,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        if torch.cuda.is_available():
            _sdxl_inpaint_pipe = _sdxl_inpaint_pipe.to("cuda")
    return _sdxl_inpaint_pipe

def generate_inpainted_background(product: Image.Image, mask: Image.Image, prompt: str,
                                  use_sdxl: bool = False, steps: int = 30) -> Image.Image:
    pipe = _init_sdxl_inpaint() if use_sdxl else _init_inpaint()

    result = pipe(
        prompt=prompt,
        image=product,        # prepare_inpainting_inputs에서 크기/모드 맞춤
        mask_image=mask,      # L 모드 마스크
        num_inference_steps=steps
    ).images[0]

    return result.convert("RGB")
