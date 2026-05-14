import pdfplumber
import docx
import os


def extract_text_from_pdf(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")
    return text


def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        text = "\n".join(para.text for para in doc.paragraphs)
        return text
    except Exception as e:
        raise Exception(f"DOCX extraction failed: {str(e)}")


def extract_text_from_txt(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        raise Exception(f"TXT extraction failed: {str(e)}")


def process_resume(file_path):
    extension = os.path.splitext(file_path)[1].strip().lower()

    print(f"Detected extension: {extension}")

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)
    elif extension == ".docx":
        return extract_text_from_docx(file_path)
    elif extension == ".txt":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {extension}")