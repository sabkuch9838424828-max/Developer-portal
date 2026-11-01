import os
import uuid
import re
import io
from typing import Tuple, Optional, Dict, Any, Union
from PIL import Image
from fastapi import HTTPException, UploadFile
from app.core.config import settings

AVATARS_DIR = os.path.join(settings.STORAGE_DIR, "avatars")
COVERS_DIR = os.path.join(settings.STORAGE_DIR, "covers")
TEAMS_DIR = os.path.join(settings.STORAGE_DIR, "teams")
EVIDENCE_DIR = os.path.join(settings.STORAGE_DIR, "evidence")

for d in [AVATARS_DIR, COVERS_DIR, TEAMS_DIR, EVIDENCE_DIR]:
    os.makedirs(d, exist_ok=True)

class MediaProcessingService:
    """Production image processing, validation, cropping, and thumbnail optimization service."""

    ALLOWED_IMAGE_TYPES = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    }

    MAGIC_SIGNATURES = {
        "png": b"\x89PNG\r\n\x1a\n",
        "jpg": b"\xff\xd8\xff",
        "jpeg": b"\xff\xd8\xff",
        "webp": b"RIFF"
    }

    @classmethod
    def validate_image_file(cls, contents: bytes, filename: str, mime_type: str = "image/png", max_size_mb: int = 5) -> Tuple[bool, Optional[str]]:
        if not contents or len(contents) == 0:
            return False, "File is empty."

        if len(contents) > max_size_mb * 1024 * 1024:
            return False, f"File size exceeds maximum allowed size of {max_size_mb}MB."

        ext = os.path.splitext(filename)[1].lower().replace(".", "")
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            return False, f"Unsupported image extension .{ext}. Allowed: JPEG, PNG, WebP."

        # Verify magic byte
        if ext in cls.MAGIC_SIGNATURES:
            sig = cls.MAGIC_SIGNATURES[ext]
            if not contents.startswith(sig):
                return False, f"Corrupted or disguised image file for extension .{ext}."

        try:
            with Image.open(io.BytesIO(contents)) as img:
                img.verify()
        except Exception:
            return False, "Uploaded file is not a valid or readable image."

        return True, None

    @classmethod
    async def _extract_bytes(cls, file_or_bytes: Union[UploadFile, bytes], default_filename: str = "image.png") -> Tuple[bytes, str]:
        if isinstance(file_or_bytes, UploadFile):
            filename = file_or_bytes.filename or default_filename
            contents = await file_or_bytes.read()
            return contents, filename
        elif isinstance(file_or_bytes, bytes):
            return file_or_bytes, default_filename
        elif hasattr(file_or_bytes, "file") and hasattr(file_or_bytes.file, "read"):
            return file_or_bytes.file.read(), getattr(file_or_bytes, "filename", default_filename)
        return bytes(file_or_bytes), default_filename

    @classmethod
    async def process_and_save_avatar(
        cls,
        file: Union[UploadFile, bytes, Any] = None,
        contents: Optional[bytes] = None,
        user_id: Any = 1,
        crop_data: Optional[Dict[str, float]] = None,
        old_avatar_url: Optional[str] = None,
        old_url: Optional[str] = None
    ) -> str:
        """Processes avatar: crops to square 1:1, resizes to 256x256, converts to optimized WebP."""
        target_old_url = old_avatar_url or old_url
        if contents is None and file is not None:
            raw_bytes, fname = await cls._extract_bytes(file, "avatar.png")
        else:
            raw_bytes, fname = contents or b"", "avatar.png"

        is_valid, err = cls.validate_image_file(raw_bytes, fname, "image/png", max_size_mb=5)
        if not is_valid:
            raise HTTPException(status_code=400, detail=err)

        try:
            with Image.open(io.BytesIO(raw_bytes)) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGBA")
                    background = Image.new("RGBA", img.size, (255, 255, 255))
                    alpha_composite = Image.alpha_composite(background, img)
                    img = alpha_composite.convert("RGB")
                elif img.mode != "RGB":
                    img = img.convert("RGB")

                width, height = img.size
                if crop_data and all(k in crop_data for k in ["x", "y", "width", "height"]):
                    cx = max(0, int(crop_data["x"]))
                    cy = max(0, int(crop_data["y"]))
                    cw = min(width - cx, int(crop_data["width"]))
                    ch = min(height - cy, int(crop_data["height"]))
                    if cw > 0 and ch > 0:
                        cropped = img.crop((cx, cy, cx + cw, cy + ch))
                    else:
                        cropped = img
                else:
                    min_dim = min(width, height)
                    left = (width - min_dim) / 2
                    top = (height - min_dim) / 2
                    right = (width + min_dim) / 2
                    bottom = (height + min_dim) / 2
                    cropped = img.crop((left, top, right, bottom))

                resized = cropped.resize((256, 256), Image.Resampling.LANCZOS)
                filename = f"avatar_u{user_id}_{uuid.uuid4().hex[:8]}.webp"
                file_path = os.path.join(AVATARS_DIR, filename)
                resized.save(file_path, "WEBP", quality=90)

            cls.remove_file_by_url(target_old_url)
            return f"/storage/uploads/avatars/{filename}"

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process profile avatar: {str(e)}")

    @classmethod
    async def process_and_save_cover(
        cls,
        file: Union[UploadFile, bytes, Any] = None,
        contents: Optional[bytes] = None,
        entity_type: str = "talent",
        entity_id: Any = 1,
        user_id: Any = None,
        old_cover_url: Optional[str] = None,
        old_url: Optional[str] = None
    ) -> str:
        """Processes cover banner: resizes to max 1280x480 WebP."""
        target_id = user_id or entity_id
        target_old_url = old_cover_url or old_url
        if contents is None and file is not None:
            raw_bytes, fname = await cls._extract_bytes(file, "cover.png")
        else:
            raw_bytes, fname = contents or b"", "cover.png"

        is_valid, err = cls.validate_image_file(raw_bytes, fname, "image/png", max_size_mb=10)
        if not is_valid:
            raise HTTPException(status_code=400, detail=err)

        try:
            with Image.open(io.BytesIO(raw_bytes)) as img:
                if img.mode != "RGB":
                    img = img.convert("RGB")

                img.thumbnail((1280, 480), Image.Resampling.LANCZOS)
                filename = f"cover_{entity_type}_{target_id}_{uuid.uuid4().hex[:8]}.webp"
                file_path = os.path.join(COVERS_DIR, filename)
                img.save(file_path, "WEBP", quality=85)

            cls.remove_file_by_url(target_old_url)
            return f"/storage/uploads/covers/{filename}"

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process cover banner: {str(e)}")

    @classmethod
    async def save_evidence_document(cls, file: UploadFile, entity_id: Any = 1) -> Dict[str, Any]:
        """Saves certificate or evidence document (PDF, PNG, JPG, WebP) up to 15MB."""
        filename = file.filename or "evidence_document"
        contents = await file.read()
        file_size = len(contents)

        if file_size > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Evidence document exceeds 15MB limit.")

        ext = os.path.splitext(filename)[1].lower().replace(".", "")
        if ext not in ["pdf", "jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Allowed evidence formats: PDF, JPEG, PNG, WebP.")

        unique_name = f"ev_{entity_id}_{uuid.uuid4().hex[:8]}_{filename}"
        file_path = os.path.join(EVIDENCE_DIR, unique_name)
        with open(file_path, "wb") as f:
            f.write(contents)

        return {
            "file_url": f"/storage/uploads/evidence/{unique_name}",
            "file_path": file_path,
            "file_type": ext,
            "file_size_bytes": file_size
        }

    @classmethod
    def remove_file_by_url(cls, url: Optional[str]):
        """Safely removes an uploaded file from disk when replaced or deleted."""
        if not url:
            return
        try:
            rel_path = url.replace("/storage/uploads/", "").replace("/uploads/", "")
            target_path = os.path.join(settings.STORAGE_DIR, rel_path)
            if os.path.exists(target_path) and os.path.isfile(target_path):
                os.remove(target_path)
        except Exception:
            pass

    @classmethod
    def delete_file_safely(cls, url: Optional[str]):
        cls.remove_file_by_url(url)
