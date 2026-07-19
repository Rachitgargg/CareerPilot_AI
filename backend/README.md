# CareerPilot AI Backend

FastAPI backend foundation for CareerPilot AI. Responsible for file upload validation, PDF text extraction, text cleaning, and project architecture layout.

## Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   └── upload.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── health.py
│   │   ├── upload.py
│   │   └── __init__.py
│   ├── services/
│   │   ├── parser/
│   │   │   ├── pdf_parser.py
│   │   │   └── text_cleaner.py
│   │   └── __init__.py
│   ├── utils/
│   │   └── __init__.py
│   ├── main.py
│   └── __init__.py
├── uploads/
├── .env.example
├── main.py (entrypoint proxy)
├── requirements.txt
└── README.md
```

## Getting Started

### 1. Prerequisites
- Python 3.11+
- Virtual environment manager (`venv`)

### 2. Setup Virtual Environment
Navigate to the `backend/` directory:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install only the specific packages required for this phase:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to a new `.env` file:
```bash
cp .env.example .env
```
Adjust configurations as needed. By default, it sets up host `0.0.0.0`, port `8000`, size limits at `10MB`, and active folders.

### 5. Run FastAPI Server
Start the development server with hot-reload enabled:
```bash
uvicorn app.main:app --reload --port 8000
```
*(Alternatively, you can run `uvicorn main:app --reload --port 8000` via the top-level proxy).*

---

## API Documentation

Once the server is running, the interactive documentation is accessible at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Endpoints Summary

### 1. Health Status
- **Method**: `GET`
- **Path**: `/health`
- **Response Schema**:
  ```json
  {
    "status": "healthy",
    "service": "CareerPilot Backend"
  }
  ```

### 2. Resume PDF Upload
- **Method**: `POST`
- **Path**: `/upload`
- **Content-Type**: `multipart/form-data`
- **Body Parameter**: `resume` (must be a valid `.pdf` file up to 10MB)
- **Response Schema**:
  ```json
  {
    "success": true,
    "filename": "original_filename.pdf",
    "pages": 2,
    "characters": 6128,
    "text": "...cleaned extracted text..."
  }
  ```

#### Example cURL Request:
```bash
curl -X POST "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "resume=@/path/to/your/resume.pdf"
```
