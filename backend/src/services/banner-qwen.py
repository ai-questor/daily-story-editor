# service/banner.py
import io, base64
from PIL import Image
from deep_translator import GoogleTranslator

from pipeline.background_removal import remove_background
from pipeline.utils import resize_with_padding
from pipeline.prompt_builder import build_korean_prompt

import torch
from diffusers import QwenImageEditPlusPipeline


def translate_to_english(text: str) -> str:
    return GoogleTranslator(source="ko", target="en").translate(text)


def load_qwen_pipeline():
    """
    Hugging Face Hub에서 Qwen-Image-Edit-2509 모델 로드 (GPU 활용 극대화)
    """
    pipe = QwenImageEditPlusPipeline.from_pretrained(
        "Qwen/Qwen-Image-Edit-2509",
        torch_dtype=torch.float16   # FP16으로 VRAM 절약
    ).to("cuda")
    # pipe = QwenImageEditPlusPipeline.from_pretrained(
    #     "./Qwen-Image-Edit-2509",   # ✅ 로컬 경로 지정
    #     torch_dtype=torch.float16
    # ).to("cuda")

    # VRAM 최적화 옵션 (GPU 중심)
    pipe.enable_attention_slicing()
    try:
        pipe.enable_xformers_memory_efficient_attention()
    except Exception:
        print("⚠️ xformers 미적용: 설치 필요 (pip install xformers)")

    # ❌ CPU offload는 끄기 → GPU에 최대한 올려서 속도 확보
    return pipe


def generate_banner(file_bytes: bytes,
                    menu: str,
                    context: str,
                    tone: str,
                    channel: str,
                    required_words: str,
                    banned_words: str,
                    text_overlay: str) -> str:
    """
    SAM + Qwen-Image-Edit-2509 기반 배너 생성 파이프라인 (15GB VRAM 최적화)
    """

    print("1) 배경 제거 → 제품만 남기기")
    product_rgba = remove_background(file_bytes, method="sam")
    product_padded = resize_with_padding(product_rgba, (512, 512))  # ✅ 해상도 줄여 안정성 확보

    print("2) 프롬프트 생성")
    prompt = build_korean_prompt(menu, context, tone, channel)
    english_prompt = translate_to_english(prompt)
    print("Prompt:", english_prompt)

    print("3) Qwen Image 호출 (GPU 중심 실행)")
    pipe = QwenImageEditPlusPipeline.from_pretrained(
        "Qwen/Qwen-Image-Edit-2509",
        torch_dtype=torch.float16
    ).to("cuda")

    # VRAM 최적화 옵션
    pipe.enable_attention_slicing()
    try:
        pipe.enable_xformers_memory_efficient_attention()
    except Exception:
        print("⚠️ xformers 미적용: 설치 필요 (pip install xformers)")

    result_img: Image.Image = pipe(
        prompt=english_prompt,
        image=product_padded,
        guidance_scale=7.0,   # ✅ 안정적 스케일
        num_inference_steps=15  # ✅ step 줄여 속도/메모리 절약
    ).images[0]

    # 텍스트 오버레이 후처리
    if text_overlay:
        from pipeline.compositor import add_text_overlay
        result_img = add_text_overlay(result_img, text_overlay, tone)

    print("4) 결과 base64 인코딩")
    buf = io.BytesIO()
    result_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
