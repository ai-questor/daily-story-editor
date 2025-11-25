import os
import time
import io
import requests
from PIL import Image
from google.cloud import storage
from fastapi import HTTPException

def upload_to_gcs_and_instagram(file_bytes: bytes, filename: str, caption: str):
    IG_USER_ID = os.getenv("IG_USER_ID")
    ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
    BUCKET_NAME = os.getenv("STORAGE_BUCKET")
    STORAGE_ENDPOINT = os.getenv("STORAGE_ENDPOINT")

    if not IG_USER_ID or not ACCESS_TOKEN or not BUCKET_NAME or not STORAGE_ENDPOINT:
        raise HTTPException(status_code=500, detail="환경변수가 설정되지 않았습니다.")

    try:
        # 1) 파일을 JPEG으로 변환
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        buf = io.BytesIO()
        image.save(buf, format="JPEG", quality=85)
        jpeg_bytes = buf.getvalue()

        # 2) 파일명에 timestamp 붙이기
        timestamp = int(time.time())
        safe_name = f"{filename.rsplit('.',1)[0]}_{timestamp}.jpg"

        # 3) GCS 클라이언트 생성 및 업로드
        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(safe_name)
        blob.upload_from_string(jpeg_bytes, content_type="image/jpeg")

        # 4) 공개 URL 생성
        public_url = f"{STORAGE_ENDPOINT}/{safe_name}"

        # 5) Instagram Graph API 호출
        media_url = f"https://graph.facebook.com/v24.0/{IG_USER_ID}/media"
        upload_res = requests.post(media_url, data={
            "image_url": public_url,
            "caption": caption,
            "access_token": ACCESS_TOKEN
        })
        upload_data = upload_res.json()
        if "id" not in upload_data:
            blob.delete()
            raise HTTPException(status_code=500, detail=f"업로드 실패: {upload_data}")

        creation_id = upload_data["id"]

        publish_url = f"https://graph.facebook.com/v24.0/{IG_USER_ID}/media_publish"
        publish_res = requests.post(publish_url, data={
            "creation_id": creation_id,
            "access_token": ACCESS_TOKEN
        })
        publish_data = publish_res.json()
        if "id" not in publish_data:
            blob.delete()
            raise HTTPException(status_code=500, detail=f"퍼블리시 실패: {publish_data}")

        # 6) 성공 시 GCS에서 삭제
        blob.delete()

        return {"success": True, "publish_id": publish_data["id"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
