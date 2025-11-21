import os
from PIL import Image, ImageFilter

def resize_with_padding(img: Image.Image, target_size=(512,512)) -> Image.Image:
    """
    원본 비율을 유지하면서 target_size 캔버스에 맞게 패딩을 추가한다.
    """
    img.thumbnail(target_size, Image.LANCZOS)
    canvas = Image.new("RGBA", target_size, (255,255,255,0))
    x = (target_size[0] - img.width) // 2
    y = (target_size[1] - img.height) // 2
    canvas.paste(img, (x,y))
    return canvas

def prepare_inpainting_inputs(product_rgba: Image.Image,
                              target_size: tuple[int, int] = (512, 512),
                              blur_radius: int = 0,
                              alpha_threshold: int = 0,
                              save_mask: bool = True,
                              temp_dir: str = "temp") -> tuple[Image.Image, Image.Image]:
    """
    제품 이미지에서 마스크를 생성하고, 인페인팅에 맞게 리사이즈하여 반환한다.
    마스크 이미지를 temp 폴더에 저장할 수 있다.
    
    Args:
        product_rgba: rembg로 배경 제거된 RGBA 이미지
        target_size: 인페인팅 모델 입력 해상도 (기본 512x512)
        blur_radius: 마스크 경계 부드럽게 처리할 블러 강도
        alpha_threshold: 알파 채널 임계값 (0 이상 픽셀을 제품으로 인식)
        save_mask: True일 경우 temp 폴더에 마스크 저장
        temp_dir: 마스크 저장할 폴더 경로

    Returns:
        resized_product: 인페인팅용 제품 이미지 (RGB)
        resized_mask: 인페인팅용 마스크 이미지 (L)
    """
    # 1. 알파 채널 기반 마스크 생성 (제품=검정, 배경=흰색)
    alpha = product_rgba.split()[-1]
    mask = alpha.point(lambda p: 0 if p > alpha_threshold else 255, mode="L")

    # 2. 경계 부드럽게 처리 (필요시만)
    if blur_radius > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(blur_radius))

    # 3. 제품 이미지와 마스크 리사이즈
    resized_product = product_rgba.resize(target_size, Image.LANCZOS).convert("RGB")
    resized_mask = mask.resize(target_size, Image.LANCZOS)

    # 4. 마스크 저장
    if save_mask:
        os.makedirs(temp_dir, exist_ok=True)
        mask_path = os.path.join(temp_dir, "mask.png")
        resized_mask.save(mask_path)
        print(f"마스크 이미지 저장 완료: {mask_path}")

    return resized_product, resized_mask
