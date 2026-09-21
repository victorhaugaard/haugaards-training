// Kontaktuppgifter och juridiska texter. Fyll i företagsuppgifter här innan tjänsten säljs eller öppnas för andra.
export const LEGAL = {
  company: 'Script Collective',
  email: 'hello@scriptcollective.com',
  address: '', // t.ex. gatuadress, postnummer och ort. Visas om den fylls i.
  orgNumber: '', // organisationsnummer. Visas om det fylls i.
  law: 'svensk rätt', // tillämplig lag i användarvillkoren
  updated: '2026-09-21',
}

export interface LegalSection {
  h: string
  p: string[]
}
export interface LegalDoc {
  title: string
  intro: string
  sections: LegalSection[]
}
type Lang2 = 'sv' | 'en'

const fill = (s: string) => s.replaceAll('{company}', LEGAL.company).replaceAll('{email}', LEGAL.email).replaceAll('{law}', LEGAL.law)

const RAW: Record<'privacy' | 'terms', Record<Lang2, LegalDoc>> = {
  privacy: {
    sv: {
      title: 'Integritetspolicy',
      intro: 'Den här policyn förklarar vilka personuppgifter Haugaards training behandlar, varför, och vilka rättigheter du har.',
      sections: [
        { h: '1. Vem ansvarar för dina uppgifter?', p: ['Personuppgiftsansvarig är {company}. Du når oss på {email}.'] },
        {
          h: '2. Vilka uppgifter behandlar vi?',
          p: [
            'Konto: e-postadress, namn och profilbild från ditt Google-konto när du loggar in.',
            'Träningsdata: personer du skapar (namn och eventuell profilbild), träningsplaner, pass, avklarade pass, anteckningar, tävlingar och inställningar som löpning och vilodag.',
            'Coach-chatten: de meddelanden du skriver, samt en sammanfattning av din plan (senaste och kommande pass) som skickas med för att coachen ska kunna svara och ändra planen. Skriver du om skada eller sjukdom kan det räknas som hälsouppgifter, som är särskilt skyddsvärda.',
            'Teknisk information: IP-adress och loggar hos våra leverantörer när tjänsten används. Vi använder ingen reklam eller spårning för marknadsföring.',
            'Lagring i din webbläsare: språk, tema, vald vy, chatthistorik, peppmeddelanden och inloggningen sparas lokalt i din webbläsare så att tjänsten fungerar. Det är inga reklamcookies.',
          ],
        },
        {
          h: '3. Varför och på vilken grund?',
          p: [
            'Vi behandlar uppgifterna för att tillhandahålla tjänsten till dig (avtal, artikel 6.1 b i GDPR) och för att hålla tjänsten säker och felsöka (berättigat intresse, artikel 6.1 f).',
            'Hälsouppgifter som du själv skriver i coach-chatten behandlas bara med ditt samtycke (artikel 9.2 a). Du väljer själv om du vill dela sådana uppgifter, och du kan när som helst återkalla samtycket.',
          ],
        },
        {
          h: '4. Vilka delar vi uppgifter med?',
          p: [
            'Vi använder följande leverantörer som personuppgiftsbiträden: Google (Firebase Authentication, Firestore och Storage) för inloggning och lagring, Vercel för hosting, och Anthropic för AI-coachen, dit dina chattmeddelanden och plansammanfattningen skickas för att ett svar ska kunna skapas.',
            'Vi säljer aldrig dina uppgifter och delar dem inte i marknadsföringssyfte.',
          ],
        },
        { h: '5. Överföring utanför EU/EES', p: ['Våra leverantörer kan behandla uppgifter i USA eller andra länder utanför EU/EES. Överföringen sker med lämpliga skyddsåtgärder, till exempel EU-kommissionens standardavtalsklausuler eller EU–US Data Privacy Framework.'] },
        {
          h: '6. Hur länge sparar vi uppgifterna?',
          p: [
            'Vi sparar dina uppgifter så länge du har ett konto och använder tjänsten. Raderar du en plan eller en person i appen tas den bort. Du kan också be oss radera allt genom att skriva till {email}.',
            'Chatthistorik som sparas i din webbläsare tar du bort med Nytt samtal i chatten eller genom att rensa webbplatsdata.',
          ],
        },
        {
          h: '7. Dina rättigheter',
          p: [
            'Du har rätt att få tillgång till dina uppgifter, få dem rättade eller raderade, begränsa eller invända mot behandlingen, och få ut dem i ett läsbart format (du kan exportera din data i menyn i appen). Du kan återkalla ett samtycke när som helst.',
            'Kontakta oss på {email} så hjälper vi dig. Du har också rätt att klaga hos tillsynsmyndigheten, i Sverige Integritetsskyddsmyndigheten (IMY) och i Norge Datatilsynet.',
          ],
        },
        { h: '8. Barn', p: ['Tjänsten riktar sig inte till personer under 16 år.'] },
        { h: '9. Säkerhet', p: ['Åtkomsten kräver inloggning, uppgifterna lagras hos leverantörer med åtkomstregler och all trafik sker över krypterad anslutning (HTTPS). Ingen tjänst kan dock garanteras vara helt säker.'] },
        { h: '10. Ändringar', p: ['Vi kan uppdatera policyn. Datumet överst visar när den senast ändrades.'] },
        { h: '11. Kontakt', p: ['Frågor om integritet: {email}.'] },
      ],
    },
    en: {
      title: 'Privacy Policy',
      intro: 'This policy explains which personal data Haugaards training processes, why, and what rights you have.',
      sections: [
        { h: '1. Who is responsible for your data?', p: ['The data controller is {company}. You can reach us at {email}.'] },
        {
          h: '2. What data do we process?',
          p: [
            'Account: email address, name and profile picture from your Google account when you sign in.',
            'Training data: people you create (name and optional profile picture), training plans, sessions, completed sessions, notes, races and settings such as running and rest day.',
            'The coach chat: the messages you write, plus a summary of your plan (recent and upcoming sessions) that is sent along so the coach can answer and change the plan. If you write about injury or illness it may count as health data, which is especially sensitive.',
            'Technical information: IP address and logs at our providers when the service is used. We do not use advertising or tracking for marketing.',
            'Storage in your browser: language, theme, selected view, chat history, motivational messages and your login are stored locally in your browser so the service works. These are not advertising cookies.',
          ],
        },
        {
          h: '3. Why and on what basis?',
          p: [
            'We process the data to provide the service to you (contract, GDPR article 6.1 b) and to keep the service secure and troubleshoot it (legitimate interest, article 6.1 f).',
            'Health data you write yourself in the coach chat is processed only with your consent (article 9.2 a). You choose whether to share such data and you can withdraw your consent at any time.',
          ],
        },
        {
          h: '4. Who do we share data with?',
          p: [
            'We use the following providers as data processors: Google (Firebase Authentication, Firestore and Storage) for sign-in and storage, Vercel for hosting, and Anthropic for the AI coach, where your chat messages and the plan summary are sent so a reply can be generated.',
            'We never sell your data and do not share it for marketing purposes.',
          ],
        },
        { h: '5. Transfers outside the EU/EEA', p: ['Our providers may process data in the United States or other countries outside the EU/EEA. Transfers take place with appropriate safeguards, such as the European Commission’s standard contractual clauses or the EU–US Data Privacy Framework.'] },
        {
          h: '6. How long do we keep the data?',
          p: [
            'We keep your data for as long as you have an account and use the service. If you delete a plan or a person in the app it is removed. You can also ask us to delete everything by writing to {email}.',
            'Chat history stored in your browser is removed with New conversation in the chat or by clearing site data.',
          ],
        },
        {
          h: '7. Your rights',
          p: [
            'You have the right to access your data, have it corrected or erased, restrict or object to the processing, and receive it in a readable format (you can export your data in the app menu). You can withdraw consent at any time.',
            'Contact us at {email} and we will help you. You also have the right to lodge a complaint with a supervisory authority, in Sweden the Swedish Authority for Privacy Protection (IMY) and in Norway Datatilsynet.',
          ],
        },
        { h: '8. Children', p: ['The service is not intended for persons under 16.'] },
        { h: '9. Security', p: ['Access requires sign-in, data is stored with providers that use access rules, and all traffic uses an encrypted connection (HTTPS). No service can be guaranteed to be completely secure, however.'] },
        { h: '10. Changes', p: ['We may update this policy. The date at the top shows when it was last changed.'] },
        { h: '11. Contact', p: ['Privacy questions: {email}.'] },
      ],
    },
  },
  terms: {
    sv: {
      title: 'Användarvillkor',
      intro: 'Genom att använda Haugaards training godkänner du de här villkoren.',
      sections: [
        { h: '1. Tjänsten', p: ['Haugaards training är en planerare för träning, med kalender, statistik och en AI-coach. Tjänsten tillhandahålls av {company}.'] },
        { h: '2. Konto och åtkomst', p: ['Du loggar in med ett Google-konto. Åtkomst kan begränsas till godkända konton. Du ansvarar för ditt konto och för allt som sker med det.'] },
        { h: '3. Tillåten användning', p: ['Du får inte försöka ta dig förbi åtkomstskydd, störa tjänsten, överbelasta AI-coachen eller ladda upp innehåll du inte har rätt att använda, till exempel andras bilder.'] },
        {
          h: '4. Ingen medicinsk rådgivning',
          p: [
            'Träningsplaner, coachtexter och AI-svar är allmän vägledning och ersätter inte läkare, fysioterapeut eller annan yrkesperson. Vid sjukdom, skada, smärta eller om du är osäker på om du kan träna ska du kontakta vården.',
            'Du tränar på eget ansvar. Anpassa alltid träningen efter hur du mår.',
          ],
        },
        {
          h: '5. AI-coacherna',
          p: [
            'Coacherna drivs av AI och kan svara felaktigt eller ofullständigt. Kontrollera viktiga råd och ändringar i din plan.',
            'Coacher som är inspirerade av kända personer är AI-karaktärer med en lekfull stil. De är inte de riktiga personerna och har ingen koppling till eller något godkännande från dem.',
          ],
        },
        { h: '6. Ditt innehåll', p: ['Du behåller rättigheterna till det du lägger in. Du ger oss rätt att lagra och visa det i den utsträckning som behövs för att leverera tjänsten. Du ansvarar för att du har rätt att använda det du laddar upp.'] },
        { h: '7. Immateriella rättigheter', p: ['Tjänsten, dess design, kod och texter tillhör {company} eller våra licensgivare. Du får en personlig, icke-exklusiv rätt att använda tjänsten.'] },
        { h: '8. Tillgänglighet och ändringar', p: ['Tjänsten tillhandahålls i befintligt skick. Vi kan ändra, pausa eller avsluta funktioner, och vi garanterar inte att tjänsten alltid är tillgänglig eller felfri.'] },
        { h: '9. Ansvarsbegränsning', p: ['I den utsträckning lag tillåter ansvarar vi inte för indirekta skador, förlorad data, skador som uppstår vid träning eller följder av att du följer råd från tjänsten eller AI-coachen.'] },
        { h: '10. Avslut', p: ['Du kan sluta använda tjänsten när som helst och be oss radera dina uppgifter via {email}. Vi kan stänga av konton som bryter mot villkoren.'] },
        { h: '11. Ändringar i villkoren', p: ['Vi kan uppdatera villkoren. Fortsätter du använda tjänsten efter en ändring godkänner du de nya villkoren.'] },
        { h: '12. Tillämplig lag', p: ['På de här villkoren tillämpas {law}.'] },
        { h: '13. Kontakt', p: ['Frågor om villkoren: {email}.'] },
      ],
    },
    en: {
      title: 'Terms of Service',
      intro: 'By using Haugaards training you agree to these terms.',
      sections: [
        { h: '1. The service', p: ['Haugaards training is a training planner with a calendar, statistics and an AI coach. The service is provided by {company}.'] },
        { h: '2. Account and access', p: ['You sign in with a Google account. Access may be limited to approved accounts. You are responsible for your account and everything that happens with it.'] },
        { h: '3. Acceptable use', p: ['You may not try to bypass access controls, disrupt the service, overload the AI coach or upload content you do not have the right to use, such as other people’s pictures.'] },
        {
          h: '4. No medical advice',
          p: [
            'Training plans, coach texts and AI answers are general guidance and do not replace a doctor, physiotherapist or other professional. If you are ill, injured, in pain or unsure whether you can train, contact a healthcare provider.',
            'You train at your own risk. Always adapt your training to how you feel.',
          ],
        },
        {
          h: '5. The AI coaches',
          p: [
            'The coaches are powered by AI and may answer incorrectly or incompletely. Check important advice and changes to your plan.',
            'Coaches inspired by well-known people are AI characters with a playful style. They are not the real people and have no connection to or endorsement from them.',
          ],
        },
        { h: '6. Your content', p: ['You keep the rights to what you add. You give us the right to store and display it to the extent needed to deliver the service. You are responsible for having the right to use what you upload.'] },
        { h: '7. Intellectual property', p: ['The service, its design, code and texts belong to {company} or our licensors. You get a personal, non-exclusive right to use the service.'] },
        { h: '8. Availability and changes', p: ['The service is provided as is. We may change, pause or end features, and we do not guarantee that the service is always available or error-free.'] },
        { h: '9. Limitation of liability', p: ['To the extent permitted by law we are not liable for indirect damages, lost data, injuries that occur during training or the consequences of following advice from the service or the AI coach.'] },
        { h: '10. Termination', p: ['You can stop using the service at any time and ask us to delete your data via {email}. We may suspend accounts that break these terms.'] },
        { h: '11. Changes to the terms', p: ['We may update the terms. If you keep using the service after a change you accept the new terms.'] },
        { h: '12. Governing law', p: ['These terms are governed by {law}.'] },
        { h: '13. Contact', p: ['Questions about the terms: {email}.'] },
      ],
    },
  },
}

const LAW_EN: Record<string, string> = { 'svensk rätt': 'Swedish law' }

export const legalDoc = (kind: 'privacy' | 'terms', lang: 'sv' | 'no' | 'en'): LegalDoc => {
  const l: Lang2 = lang === 'sv' ? 'sv' : 'en'
  const d = RAW[kind][l]
  const fx = (s: string) => fill(s).replaceAll(LEGAL.law, l === 'en' ? (LAW_EN[LEGAL.law] ?? LEGAL.law) : LEGAL.law)
  return { title: d.title, intro: fx(d.intro), sections: d.sections.map((s) => ({ h: fx(s.h), p: s.p.map(fx) })) }
}
