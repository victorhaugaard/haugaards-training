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
