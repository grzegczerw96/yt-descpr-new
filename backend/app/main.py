from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, VideoUnavailable
from pydantic import BaseModel
import re

app = FastAPI(
    title="FastCaption API",
    description="API do pobierania napisów z filmów YouTube",
    version="1.0.0"
)

# Konfiguracja CORS - pozwala na dostęp do API z frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Będzie zmienione na konkretne domeny w produkcji
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscriptRequest(BaseModel):
    video_url: str
    language: str = "pl"  # Domyślnie polski, ale może być zmieniony

def extract_video_id(url: str) -> str:
    """Wyciąga ID filmu z URL YouTube."""
    # Próbuje wyciągnąć ID z różnych formatów URL YouTube
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:embed\/|v\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|\&v=)([^#\&\?]*).*',
        r'(?:watch\?v=|\&v=)([^#\&\?]*).?'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError("Nieprawidłowy URL filmu YouTube")

@app.get("/")
async def root():
    return {"message": "Witaj w API FastCaption!"}

@app.post("/api/transcript")
async def get_transcript(request: TranscriptRequest):
    try:
        # Wyciągnij ID filmu z URL
        video_id = extract_video_id(request.video_url)
        
        # Pobierz napisy
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Próbuj pobrać napisy w wybranym języku, lub użyj angielskiego i przetłumacz
        try:
            transcript = transcript_list.find_transcript([request.language])
        except NoTranscriptFound:
            try:
                # Jeśli nie ma w języku polskim, użyj angielskiego
                transcript = transcript_list.find_transcript(['en'])
                # Można dodać tłumaczenie tutaj w przyszłości
            except NoTranscriptFound:
                # Weź pierwszy dostępny transkrypt
                transcript = transcript_list.find_transcript([])
        
        transcript_data = transcript.fetch()
        
        return {
            "success": True,
            "video_id": video_id,
            "language": transcript.language,
            "transcript": transcript_data
        }
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="Nie znaleziono napisów dla tego filmu")
    except VideoUnavailable:
        raise HTTPException(status_code=404, detail="Film niedostępny")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wystąpił błąd: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 