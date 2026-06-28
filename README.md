# 💧 PoolHero — aplikacja do obsługi fotometru PoolLab 1.0

Aplikacja webowa (Next.js) prowadząca przez pomiar wody basenowej fotometrem **PoolLab 1.0**:
profile basenów, kreator testów krok‑po‑kroku, tabela wyników z analizą i przybliżonym dawkowaniem chemii.
Dane przechowywane w **Google Sheets**.

## Funkcje

- **Profile** (bez hasła) — każdy ma własną objętość wody i historię.
- **Ustawienia** profilu — objętość basenu w litrach (podstawa do dawkowania).
- **Pełny test** — kreator prowadzi: włącz urządzenie → nalej wodę → ZERO → kolejne tabletki i przyciski.
- **Pojedynczy pomiar** — tylko wybrany parametr.
- **Tabela wyników** — co jest OK, czego brakuje, co dodać (z dawką wg objętości).
- **Historia** testów.

### Obsługiwane odczynniki → parametry

| Odczynnik | Parametr | Przycisk na PoolLab |
|---|---|---|
| Phenol Red | pH | `pH` |
| DPD No. 1 | chlor wolny | `Cl` |
| DPD No. 3 | chlor całkowity (→ związany) | `Cl` |
| Alkalinity-M | zasadowość (TA) | `Alka` |
| CYA Test | stabilizator (kwas cyjanurowy) | `CYA` |

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz http://localhost:3000. Bez konfiguracji Google Sheets dane zapisują się lokalnie w `.data/db.json`
(plik ignorowany przez git, działa tylko lokalnie).

## Konfiguracja Google Sheets (baza danych)

1. Wejdź na https://console.cloud.google.com → utwórz projekt.
2. Włącz **Google Sheets API** (APIs & Services → Library).
3. Utwórz **Service Account** (IAM & Admin → Service Accounts) i wygeneruj klucz **JSON**.
4. Z pliku JSON weź `client_email` i `private_key`.
5. Utwórz arkusz Google i **udostępnij go** adresowi `client_email` z prawem **Edytujący**.
6. ID arkusza skopiuj z URL: `.../spreadsheets/d/`**`<TO_ID>`**`/edit`.
7. Skopiuj `.env.example` do `.env.local` i uzupełnij:

```env
GOOGLE_SHEET_ID=<id arkusza>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Zakładki `Users` i `Tests` (z nagłówkami) tworzą się automatycznie przy pierwszym zapisie.

## Wdrożenie na GitHub + Vercel

```bash
git init
git add .
git commit -m "PoolHero - initial"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

1. Wejdź na https://vercel.com → **Add New… → Project** → zaimportuj repo z GitHub.
2. W **Environment Variables** dodaj `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
   (przy wklejaniu klucza zachowaj `\n`).
3. **Deploy**. Vercel sam wykryje Next.js.

> ⚠️ Na Vercel fallback do pliku JSON nie działa (serverless) — Google Sheets jest wymagany w produkcji.

## Uwaga

Dawki chemii są **przybliżone** i zależą od stężenia konkretnego preparatu. Zawsze sprawdzaj etykietę.
Normy: typowy basen prywatny (pH 7,0–7,4; chlor wolny 1–3 mg/l; TA 80–120 mg/l; CYA 30–50 mg/l).
