# FastCaption - Pobieranie napisów z YouTube

FastCaption to aplikacja do pobierania, wyświetlania i eksportowania napisów z filmów YouTube. Projekt składa się z backendu FastAPI oraz frontendu Next.js.

## Funkcje

- Pobieranie napisów z filmów YouTube
- Wyświetlanie napisów z dokładnymi timestampami
- Eksport napisów do formatów TXT i SRT
- Odtwarzacz wideo zintegrowany z transkrypcją
- Wsparcie dla wielu języków (automatyczny wybór dostępnego języka)

## Wymagania

- Python 3.8+ (dla backendu)
- Node.js 16+ (dla frontendu)
- npm lub yarn

## Instalacja

### Backend

1. Przejdź do katalogu backend:
   ```bash
   cd backend
   ```

2. Zainstaluj zależności:
   ```bash
   pip install -r requirements.txt
   ```

3. Uruchom serwer:
   ```bash
   python run.py
   ```

   Serwer będzie dostępny pod adresem: http://localhost:8000

### Frontend

1. Przejdź do katalogu frontend:
   ```bash
   cd frontend
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

   Frontend będzie dostępny pod adresem: http://localhost:3000

## Wdrożenie

### Backend (Deta Space)

1. Zainstaluj CLI Deta Space:
   ```bash
   curl -fsSL https://get.deta.dev/space-cli.sh | sh
   ```

2. Zaloguj się do Deta Space:
   ```bash
   space login
   ```

3. Zainicjuj projekt w katalogu backend:
   ```bash
   cd backend
   space new
   ```

4. Wdróż aplikację:
   ```bash
   space push
   ```

### Frontend (Vercel)

1. Zainstaluj CLI Vercel:
   ```bash
   npm install -g vercel
   ```

2. Zaloguj się do Vercel:
   ```bash
   vercel login
   ```

3. Wdróż aplikację:
   ```bash
   cd frontend
   vercel
   ```

## Licencja

MIT 