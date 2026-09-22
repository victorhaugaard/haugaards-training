# Träning

Minimalistisk träningsplanerare för längdskidor. React + Vite + Firebase.

```
npm install
npm run dev
```

Utan Firebase-nycklar körs appen lokalt (localStorage). Med nycklar synkas allt via Firestore och delas mellan inloggade användare.

## Koppla Firebase

1. Skapa projekt på console.firebase.google.com.
2. **Build → Authentication → Sign-in method**: aktivera *Google*.
3. **Build → Firestore Database**: skapa databas (production mode).
4. **Firestore → Rules**: klistra in [firestore.rules](firestore.rules) med era två e-postadresser och publicera.
5. **Project settings → Your apps → Web (`</>`)**: registrera en webbapp och kopiera config.
6. `cp .env.example .env.local` och fyll i värdena. Starta om `npm run dev`.
7. **Authentication → Settings → Authorized domains**: lägg till Vercel-domänen när ni deployar.

## Vercel

Importera repot på Vercel (Framework: Vite) och lägg samma `VITE_FIREBASE_*`-variabler under *Environment Variables*.

## Startsidans bild

Lägg en liggande eller stående bild som `public/hero.jpg`. Den visas på startsidan. Saknas filen visas en ringgrafik i stället.

## Coach Smirnov (AI-coach)

Chatten nere till vänster kan svara på frågor och ändra planen (flytta, lägga till, ta bort pass, ändra volym, bygga om planen). Den körs av en serverfunktion, [api/coach.ts](api/coach.ts), så att API-nyckeln aldrig hamnar i webbläsaren. Modellen är `claude-haiku-4-5` (byt med `COACH_MODEL`).

Miljövariabler (i `.env.local` lokalt och under *Environment Variables* i Vercel):

| Variabel | Vad |
|---|---|
| `ANTHROPIC_API_KEY` | Nyckel från console.anthropic.com |
| `COACH_ALLOWED_EMAILS` | Kommaseparerade Google-konton som får använda coachen |

Funktionen kräver inloggning med Firebase och att kontot står i listan. Lokalt fungerar `npm run dev` (Vite kör samma funktion under `/api/coach`).

## Profilbilder (Firebase Storage)

1. **Build → Storage → Get started** i Firebase Console.
2. Klistra in [storage.rules](storage.rules) under *Rules* och publicera.
3. Om ditt projekt är äldre kan bucketen heta `<projekt>.appspot.com`. Sätt då `VITE_FIREBASE_STORAGE_BUCKET` i `.env.local` och i Vercel.

Bilden beskärs till en kvadrat på 256 px och sparas som `avatars/<personId>.jpg`. Utan Firebase sparas den lokalt i webbläsaren.

## Koppla Strava

Passen kan synkas automatiskt från Strava: när du avslutar ett pass i Strava dyker det upp i appen inom någon minut, matchat mot rätt planerat pass (bockas av och skalas till din faktiska tid) eller, om inget passar, som ett nytt pass märkt med Stravas orange märke.

**1. Skapa en Strava-app** (gratis, en per hushåll räcker):
- Gå till [strava.com/settings/api](https://www.strava.com/settings/api) och skapa en applikation.
- *Authorization Callback Domain*: er Vercel-domän utan `https://`, t.ex. `haugaards-training.vercel.app` (eller er egna domän).
- Kopiera **Client ID** och **Client Secret**.
- Strava tillåter bara appens ägare plus ett fåtal testare utan granskning. Lägg till din pappas Strava-konto som testare under appens inställningar om han också ska synka.

**2. Skapa en Firebase-servicenyckel** (så att synken kan skriva till Firestore utan att någon är inloggad):
- Firebase Console → Project settings → Service accounts → *Generate new private key*.
- Klistra in hela JSON-filens innehåll som `FIREBASE_SERVICE_ACCOUNT` (en rad, eller base64-kodad).

**3. Miljövariabler** (i `.env.local` och i Vercel):

| Variabel | Vad |
|---|---|
| `STRAVA_CLIENT_ID` | Från Strava-appen |
| `STRAVA_CLIENT_SECRET` | Från Strava-appen |
| `STRAVA_VERIFY_TOKEN` | En valfri hemlig sträng ni hittar på |
| `FIREBASE_SERVICE_ACCOUNT` | Service-nyckelns JSON |

**4. Skapa webhook-prenumerationen** (en gång, efter att ni deployat och miljövariablerna är satta i Vercel):

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=DIN_CLIENT_ID \
  -F client_secret=DIN_CLIENT_SECRET \
  -F callback_url=https://ER_DOMÄN/api/strava-webhook \
  -F verify_token=SAMMA_SOM_STRAVA_VERIFY_TOKEN
```

Strava anropar `callback_url` direkt för att verifiera den (måste alltså redan vara deployad och nå internet).

**5. Anslut i appen:** Profil → *Anslut Strava*, en gång per person. Var och en kopplar sitt eget Strava-konto till sin egen person i appen.

**Så matchas passen:** samma dag (±1) och samma idrott som ett planerat, ej avklarat pass, med den tid som ligger närmast. Hittas ingen matchning skapas ett nytt pass. Zonerna är en grov uppskattning (Strava skickar ingen tid-i-puls-zon via det gratis API:t), så justera dem gärna för hand efteråt. Tävlingspass (Strava-typen "Race") läggs som `Tävling`.

## Mobil och hemskärm

Appen är anpassad för mobil (flikrad längst ner, dagar under varandra, bottenark för dialoger, långtryck på pass för snabbmenyn) och kan läggas på hemskärmen:

- **iPhone (Safari):** Dela → *Lägg till på hemskärmen*.
- **Android (Chrome):** menyn ⋮ → *Installera app* eller *Lägg till på startskärmen*.

Ikoner och manifest ligger i `public/` (`manifest.webmanifest`, `icons/`, `apple-touch-icon.png`). Google-inloggning försöker först ett popup-fönster och går annars via omdirigering, vilket behövs på många mobiler.
