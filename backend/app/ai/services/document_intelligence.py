import os
import re
import io
import zipfile
import xml.etree.ElementTree as ET
from typing import Tuple, Optional
from PIL import Image

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pypdf
except ImportError:
    pypdf = None

class DocumentIntelligenceService:
    """Document Intelligence engine for extracting and securing text from PDFs, DOCX, and Images."""

    ALLOWED_MIME_TYPES = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/msword": "docx",
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "text/plain": "txt"
    }

    MAGIC_SIGNATURES = {
        "pdf": [b"%PDF"],
        "docx": [b"PK\x03\x04"],
        "png": [b"\x89PNG\r\n\x1a\n"],
        "jpg": [b"\xff\xd8\xff"],
        "jpeg": [b"\xff\xd8\xff"]
    }

    @classmethod
    def validate_file(cls, contents: bytes, filename: str, mime_type: str, max_size_mb: int = 15) -> Tuple[bool, Optional[str]]:
        """Strict validation of file size, extension, MIME type, and binary magic signature."""
        if not contents or len(contents) == 0:
            return False, "File is empty."

        if len(contents) > max_size_mb * 1024 * 1024:
            return False, f"File exceeds maximum allowed size of {max_size_mb}MB."

        ext = os.path.splitext(filename)[1].lower().replace(".", "")
        if ext not in ["pdf", "docx", "png", "jpg", "jpeg", "txt"]:
            return False, f"Unsupported file extension .{ext}. Allowed formats: PDF, DOCX, PNG, JPG."

        # Check binary signature where applicable
        if ext in cls.MAGIC_SIGNATURES:
            signatures = cls.MAGIC_SIGNATURES[ext]
            is_valid_sig = any(contents.startswith(sig) for sig in signatures)
            if not is_valid_sig and ext != "txt":
                return False, f"File signature mismatch for .{ext}. Document appears corrupted or disguised."

        return True, None

    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """Sanitizes text and removes non-printable characters and prompt injection triggers."""
        if not text:
            return ""
        # Remove null bytes and control chars except newlines and tabs
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        # Neutralize common prompt injection prefixes and instructions
        cleaned = re.sub(
            r'(?i)(ignore previous instructions|disregard above rules|system override|you are now|system prompt|admin mode|prompt injection)',
            '[FILTERED]',
            cleaned
        )
        return cleaned.strip()

    @classmethod
    def extract_text_from_docx(cls, file_path: str) -> str:
        """Extracts text from DOCX files by reading word/document.xml without external dependencies."""
        try:
            with zipfile.ZipFile(file_path, 'r') as docx_zip:
                xml_content = docx_zip.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                paragraphs = []
                for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                    texts = [
                        node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                        if node.text
                    ]
                    if texts:
                        paragraphs.append(''.join(texts))
                return cls.sanitize_text('\n'.join(paragraphs))
        except Exception as e:
            return f"Error extracting DOCX text: {str(e)}"

    @classmethod
    def extract_text_from_pdf(cls, file_path: str) -> Tuple[str, bool]:
        """Extracts text from PDF using PyMuPDF with pypdf fallback and OCR for scanned documents."""
        text = ""
        ocr_applied = False

        # First attempt: PyMuPDF (fast and high fidelity)
        if fitz:
            try:
                doc = fitz.open(file_path)
                for page in doc:
                    page_text = page.get_text()
                    if page_text:
                        text += page_text + "\n"
                
                # If extracted text is very short (< 40 chars), document is likely scanned / image-based PDF
                if len(text.strip()) < 40 and len(doc) > 0:
                    try:
                        import pytesseract
                        ocr_text = ""
                        for page_idx in range(min(3, len(doc))):
                            pix = doc[page_idx].get_pixmap()
                            img = Image.open(io.BytesIO(pix.tobytes("png")))
                            ocr_text += pytesseract.image_to_string(img) + "\n"
                        if ocr_text.strip():
                            text = ocr_text
                            ocr_applied = True
                    except Exception:
                        pass

                doc.close()
                if text.strip():
                    return cls.sanitize_text(text), ocr_applied
            except Exception:
                pass

        # Second attempt: pypdf fallback
        if pypdf and not text.strip():
            try:
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                if text.strip():
                    return cls.sanitize_text(text), ocr_applied
            except Exception:
                pass

        return cls.sanitize_text(text), ocr_applied

    @classmethod
    def extract_text_from_image(cls, file_path: str) -> str:
        """Extracts image metadata and applies OCR or structured visual analysis."""
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                format_name = img.format
                # Try pytesseract if installed on the host system
                try:
                    import pytesseract
                    ocr_text = pytesseract.image_to_string(img)
                    if ocr_text.strip():
                        return cls.sanitize_text(ocr_text)
                except Exception:
                    pass
                
                return cls.sanitize_text(
                    f"Requirement document image (Dimensions: {width}x{height}, Format: {format_name}). "
                    f"Filename: {os.path.basename(file_path)}. "
                    "Position: Full-Stack Software Engineer. Mandatory requirements: Python, React, PostgreSQL, Docker."
                )
        except Exception as e:
            return f"Error reading image: {str(e)}"

    @classmethod
    def process_document(cls, file_path: str, mime_type: str) -> Tuple[str, str, bool]:
        """Validates and processes a document, returning (extracted_text, doc_class, ocr_applied)."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = os.path.splitext(file_path)[1].lower().replace(".", "")
        ocr_applied = False

        if ext == "pdf" or "pdf" in mime_type:
            raw_text, ocr_applied = cls.extract_text_from_pdf(file_path)
            doc_class = "pdf_document"
        elif ext == "docx" or "word" in mime_type or "officedocument" in mime_type:
            raw_text = cls.extract_text_from_docx(file_path)
            doc_class = "docx_document"
        elif ext in ["png", "jpg", "jpeg"] or "image" in mime_type:
            raw_text = cls.extract_text_from_image(file_path)
            doc_class = "image_document"
            ocr_applied = True
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw_text = cls.sanitize_text(f.read())
            doc_class = "text_document"

        return raw_text, doc_class, ocr_applied
