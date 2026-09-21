import type { Category, Coach, Group, Sport, TrainingCard, Zones } from '../types'

type C = (
  id: string,
  name: string,
  sport: Sport,
  category: Category,
  group: Group,
  zones: Zones,
  nonZone: number,
  hint: string,
  coach: Coach,
  opts?: { flex?: boolean; home?: Coach },
) => TrainingCard

const card: C = (id, name, sport, category, group, zones, nonZone, hint, coach, opts) => ({
  id,
  name,
  sport,
  category,
  group,
  zones,
  nonZone,
  hint,
  coach,
  ...(opts?.flex ? { flex: true } : {}),
  ...(opts?.home ? { home: opts.home } : {}),
})

export const CARDS: TrainingCard[] = [
  // ——— Distans ———
  card('easy-run', 'Lugn löpning', 'Löpning', 'easy', 'Distans', [60, 0, 0, 0, 0], 0, 'Rent lugnt, samtalstempo', {
    purpose: 'Bygger aerob bas och uthållighet. Bra som omväxling, men ta det försiktigt.',
    how: ['Jogga i samtalstempo, du ska kunna prata hela vägen', 'Håll dig i {z1}. Gå hellre uppför än att pressa', 'Avsluta med 4 korta stegringar på 20 sekunder'],
    tip: 'Välj mjukt underlag. Känns det i knäna, byt mot cykel.',
  }, { flex: true }),
  card('long-run', 'Långpass löpning', 'Löpning', 'easy', 'Distans', [100, 20, 0, 0, 0], 0, 'Terräng, stavgång i backar', {
    purpose: 'Veckans längsta löppass. Tränar hållbarhet och fettförbränning.',
    how: ['Jämnt och lugnt tempo, mest {z1}', 'Lägg in stavgång i de längre backarna', 'Ät och drick var 30–40:e minut'],
    tip: 'Kör terräng eller grus. Undvik asfalt om det går.',
  }, { flex: true }),
  card('easy-bike', 'Lugn cykel', 'Cykel', 'easy', 'Distans', [90, 0, 0, 0, 0], 0, 'Rent lugnt, låg belastning', {
    purpose: 'Aerob bas utan stötbelastning. Skonsamt för knän och leder.',
    how: ['Håll {z1} hela passet, lätt trampmotstånd', 'Trampa runt på hög kadens, 85–95 varv', 'Sitt avslappnat, släpp axlarna'],
    tip: 'Ska kännas nästan för lätt. Det är meningen.',
  }, { flex: true }),
  card('long-bike', 'Långpass cykel', 'Cykel', 'easy', 'Distans', [110, 40, 0, 0, 0], 0, 'Veckans längsta pass, skonsamt', {
    purpose: 'Bygger volym och uthållighet utan att slita på kroppen.',
    how: ['Börja lugnt i {z1} de första 45 minuterna', 'Låt mittendelen glida upp mot {z2} på flacka partier', 'Ät och drick regelbundet, öva på 60–90 g kolhydrater i timmen'],
    tip: 'Passar både ute och på Zwift/Tacx om vädret är dåligt.',
  }, { flex: true }),
  card('rs-easy', 'Rullskidor distans', 'Rullskidor', 'easy', 'Distans', [45, 45, 0, 0, 0], 0, 'Teknikfokus, lugn–distans', {
    purpose: 'Skidspecifik uthållighet med fokus på teknik.',
    how: ['Växla mellan diagonal och stakning', 'Fokus på kraftig avstamp och hög höft', 'Håll {z1}–{z2}. Tekniken går före tempot'],
    tip: 'Kör gärna med filmning av teknik varannan vecka.',
  }, { flex: true }),
  card('rs-long', 'Långpass rullskidor', 'Rullskidor', 'easy', 'Distans', [110, 40, 0, 0, 0], 0, 'Veckans längsta pass', {
    purpose: 'Bygger skidspecifik uthållighet och muskelutholdighet i överkroppen.',
    how: ['Jämn fart i {z1}, en stund i {z2} på slutet', 'Byt teknik varje 15–20 minut så att inget tröttnar', 'Ta med vatten och något att äta'],
    tip: 'Välj en väg med lite trafik och bra asfalt.',
  }, { flex: true }),
  card('ski-easy', 'Skidor distans', 'Skidor', 'easy', 'Distans', [60, 30, 0, 0, 0], 0, 'På snö, lugn–distans', {
    purpose: 'Skidspecifik bas på snö. Tekniken sätts under lugna former.',
    how: ['Lugnt tempo, mest {z1}', 'Fokus på glid och balans på det främre benet', 'Testa olika spår och underlag'],
    tip: 'Finns ingen snö ännu? Byt mot rullskidor eller cykel.',
  }, { flex: true }),
  card('ski-long', 'Långpass skidor', 'Skidor', 'easy', 'Distans', [110, 40, 0, 0, 0], 0, 'På snö, långt och lugnt', {
    purpose: 'Bygger volym på snö. Det här är det viktigaste passet inför Nordenskiöldsloppet och dess 220 km.',
    how: ['Lugn början, håll {z1} första timmen', 'Låt farten stiga lite mot {z2} sista timmen', 'Ät något varje 40:e minut'],
    tip: 'Träna på matintaget. På 220 km avgör det hur långt du orkar.',
  }, { flex: true }),

  // ——— Kvalitet ———
  card('int-4x8', 'Intervaller 4×8 min', 'Löpning', 'quality', 'Kvalitet', [44, 0, 0, 32, 0], 0, 'Tröskel, 3 min vila. Kärnpass', {
    purpose: 'Höjer tröskeln. Det viktigaste passet för uthållighetsprestation.',
    how: ['Värm upp 20 minuter i {z1}', '4 × 8 minuter i {z4}, 3 minuters lugn vila mellan', 'Sista intervallen ska vara lika snabb som den första'],
    tip: 'Går den sista sämre än den första var tempot för högt.',
  }),
  card('int-bike', 'Cykelintervaller 4×8 min', 'Cykel', 'quality', 'Kvalitet', [44, 0, 0, 32, 0], 0, 'Tröskel, skonsam version av 4×8', {
    purpose: 'Samma stimulans som löpintervaller men utan stötbelastning.',
    how: ['Värm upp 20 minuter i {z1}', '4 × 8 minuter i {z4}, 3 minuters lugn trampning mellan', 'Håll en jämn kadens kring 85–95'],
    tip: 'Perfekt att köra inomhus på Zwift/Tacx, där effekten är lätt att hålla.',
  }),
  card('int-rs', 'Rullskidintervaller 5×6', 'Rullskidor', 'quality', 'Kvalitet', [44, 0, 0, 30, 0], 0, 'Tröskel, stakning/diagonal', {
    purpose: 'Tröskelträning i skidspecifik rörelse.',
    how: ['Värm upp 20 minuter, gärna med några stegringar', '5 × 6 minuter i {z4}, 2–3 minuters vila', 'Håll samma teknik hela vägen, även när det bränner'],
    tip: 'Välj en slinga där du kan hålla jämn belastning.',
  }),
  card('tempo', 'Tempo 3×15 min', 'Löpning', 'quality', 'Kvalitet', [35, 0, 45, 0, 0], 0, 'Tempo, jämnt och kontrollerat', {
    purpose: 'Bygger uthållighet på tävlingsnära fart med måttlig trötthet.',
    how: ['Värm upp 15 minuter', '3 × 15 minuter i {z3}, 3 minuters vila', 'Kontrollerat och jämnt, inte hårt'],
    tip: 'Du ska känna att du kunde ha kört längre.',
  }),
  card('fartlek', 'Fartlek', 'Löpning', 'quality', 'Kvalitet', [45, 15, 10, 10, 0], 0, 'Lekfull växling upp till tröskel', {
    purpose: 'Varierad intensitet som är roligare än strikta intervaller.',
    how: ['Börja med 15 minuter lugnt', 'Växla fritt mellan {z2}, {z3} och korta drag i {z4}', 'Avsluta med 10 minuter i {z1}'],
    tip: 'Låt terrängen bestämma. Gasa i backarna, vila på nedförsbackarna.',
  }),
  card('int-short', 'Korta intervaller 6×3', 'Löpning', 'hard', 'Kvalitet', [45, 0, 0, 0, 18], 0, 'Max, full återhämtning', {
    purpose: 'Höjer maxsyreupptaget, den fysiologiska taket.',
    how: ['Värm upp 20 minuter med tre stegringar', '6 × 3 minuter i {z5}, 3 minuters lugn vila', 'Gå ut jämnt. Sista intervallen ska vara den hårdaste'],
    tip: 'Sov bra och ät ordentligt dagen innan. Det här passet kräver färska ben.',
  }),
  card('opener', 'Skärpepass 5×1 min', 'Skidor', 'quality', 'Kvalitet', [45, 0, 0, 0, 5], 0, 'Väcker kroppen inför tävling', {
    purpose: 'Håller kroppen vaken inför tävling utan att trötta ut den.',
    how: ['20–30 minuter lugnt', '4–5 × 1 minut i {z4}–{z5} med 2 minuters vila', 'Avsluta lugnt. Du ska känna dig pigg, inte trött'],
    tip: 'Kör passet på tävlingsutrustningen. Testa skid och vallning också.',
  }),
  card('int-hill', 'Hufs, backintervaller med stavar 6×4', 'Löpning', 'hard', 'Kvalitet', [50, 0, 0, 8, 16], 0, 'Stavgång uppför, hufs på norska', {
    purpose: 'Bygger skidspecifik kraft och fart uppför. Det kallas hufs på norska.',
    how: ['Värm upp 20 minuter med stavar på lugna backar', '6 × 4 minuter uppför i {z4}–{z5} med stavar: gå eller löp med kraftig stavisättning, jogga eller gå ned som vila', 'Håll hög frekvens och pressa igenom stavarna ända ner i höften'],
    tip: 'Välj en jämn backe som tar ungefär fyra minuter. Har du ont i knäna, byt mot rullskidor uppför eller stakmaskin.',
  }),

  // ——— Stakmaskin (Ercolina) ———
  card('erg-tech', 'Stakmaskin teknik & balans', 'Stakmaskin', 'easy', 'Stakmaskin', [45, 0, 0, 0, 0], 0, 'Lätt motstånd, stå på rullskidor', {
    purpose: 'Finslipar stakningen och balansen med låg belastning.',
    how: ['Stå på rullskidor. Lätt motstånd och hög frekvens', '3 × 10 minuter, fokus på höft framåt och lång sträck', 'Spänn bålen, låt kraften komma från kroppsvikten'],
    tip: 'Filma från sidan. Höften ska följa med framåt i varje drag.',
  }),
  card('erg-long', 'Stakmaskin distans', 'Stakmaskin', 'easy', 'Stakmaskin', [55, 20, 0, 0, 0], 0, 'Måttligt motstånd, rullskidor på', {
    purpose: 'Bygger uthållighet i överkroppen. Ersätter ett lugnt pass när vädret är dåligt.',
    how: ['Stå på rullskidor, måttligt motstånd', 'Jämnt hela passet i {z1}–{z2}', 'Växla mellan dubbelstakning och diagonalstakning varje 10 minut'],
    tip: 'Ha en fläkt och vatten framme. Det blir varmt.',
  }, { flex: true }),
  card('erg-int', 'Stakmaskin intervaller 6×4', 'Stakmaskin', 'quality', 'Stakmaskin', [36, 0, 0, 24, 0], 0, 'Tröskel med tyngre motstånd', {
    purpose: 'Bygger muskelutholdighet i överkroppen på tröskelnivå.',
    how: ['Värm upp 15 minuter, lätt motstånd', '6 × 4 minuter i {z4} med måttligt tungt motstånd, 90 s vila', 'Stå på rullskidor och jobba hela kroppen'],
    tip: 'Håll teknik och rytm. Ger tekniken vika, sänk motståndet.',
  }),
  card('erg-power', 'Stakmaskin kraft 8×45 s', 'Stakmaskin', 'hard', 'Stakmaskin', [34, 0, 0, 0, 6], 0, 'Tungt motstånd, explosivt', {
    purpose: 'Bygger maxkraft och snabbhet i stakningen.',
    how: ['Värm upp 15 minuter och kör 3 korta accelerationer', '8 × 45 sekunder med tungt motstånd, så snabbt du kan, 2 minuters vila', 'Full rörelse, sträck ut hela kroppen varje drag'],
    tip: 'Kvalitet framför kvantitet. Avbryt när kraften faller.',
  }),
  card('erg-single', 'Stakmaskin enbensstakning', 'Stakmaskin', 'easy', 'Stakmaskin', [40, 0, 0, 0, 0], 0, 'Balans och teknik på ett ben', {
    purpose: 'Bygger balans och stabilitet över glidbenet, precis som i spåret.',
    how: ['Stå på rullskidor, lätt motstånd', 'Byt ben varje 2 minuter, håll höften hög och stabil', 'Lugn rytm. Fokus på balansen, inte på farten'],
    tip: 'Ha något att greppa i om du tappar balansen. Det är helt normalt i början.',
  }),
  card('erg-pyr', 'Stakmaskin pyramid 1-2-3-4-3-2-1', 'Stakmaskin', 'quality', 'Stakmaskin', [40, 0, 0, 16, 0], 0, 'Tröskel med varierande längd', {
    purpose: 'Tröskelträning som går fort att genomföra. Pyramiden gör passet roligare.',
    how: ['Värm upp 15 minuter, lätt motstånd', 'Intervaller på 1-2-3-4-3-2-1 minuter i {z4}, lika lång vila som arbete', 'Håll samma rytm i varje intervall, även de korta'],
    tip: 'Håll motståndet konstant och variera bara tiden.',
  }),
  card('erg-30', 'Stakmaskin 30/30 ×3 set', 'Stakmaskin', 'hard', 'Stakmaskin', [40, 0, 0, 0, 12], 0, 'Korta hårda drag, tät återhämtning', {
    purpose: 'Höjer maxsyreupptaget i överkroppen med korta, hårda drag.',
    how: ['Värm upp 15 minuter och kör tre korta accelerationer', '3 set med 8 × (30 sekunder hårt i {z5}, 30 sekunder lugnt), 4 minuter vila mellan seten', 'Sista draget ska vara lika kraftigt som det första'],
    tip: 'Går rytmen sönder, avsluta setet. Kvaliteten är viktigast.',
  }),
  card('erg-heavy', 'Stakmaskin tungt motstånd 4×8', 'Stakmaskin', 'quality', 'Stakmaskin', [30, 0, 16, 16, 0], 0, 'Styrkeuthållighet i stakningen', {
    purpose: 'Bygger muskelutholdighet i armar, rygg och bål med tyngre motstånd.',
    how: ['Värm upp 15 minuter', '4 × 8 minuter i {z3}–{z4} med tungt motstånd och lägre frekvens, 2 minuters vila', 'Kraftigt avstamp med hela kroppen, inte bara armarna'],
    tip: 'Ska kännas i lår, bål och rygg, inte bara i axlarna.',
  }),

  // ——— Zwift & Tacx ———
  card('zw-endu', 'Zwift/Tacx lugn distans', 'Cykel', 'easy', 'Zwift & Tacx', [60, 15, 0, 0, 0], 0, 'Inomhus, gärna med grupp eller film', {
    purpose: 'Lugn bas inomhus när det är mörkt eller dåligt väder.',
    how: ['Välj ett lugnt distanspass eller en grupptur i Zwift/Tacx', 'Håll {z1} med korta inslag i {z2}', 'Fokus på jämn och lätt kadens'],
    tip: 'Ha en fläkt på. Inomhus blir det varmare än man tror.',
  }, { flex: true }),
  card('zw-sst', 'Zwift/Tacx Sweet spot 3×12', 'Cykel', 'quality', 'Zwift & Tacx', [24, 0, 18, 18, 0], 0, 'Kontrollerat hårt, bygger tröskel', {
    purpose: 'Tröskelnära arbete som är effektivt utan att bli för trött.',
    how: ['Välj ett Sweet spot-pass i appen (3 × 12 minuter)', 'Håll dig strax under tröskel, ungefär {z3}–{z4}', 'Kör sittande med jämn kadens'],
    tip: 'Ska kännas jobbigt men hanterbart. Det ska gå att upprepa flera gånger i veckan.',
  }),
  card('zw-ou', 'Zwift/Tacx Över-under', 'Cykel', 'quality', 'Zwift & Tacx', [25, 0, 15, 20, 0], 0, 'Växlar över och under tröskel', {
    purpose: 'Tränar kroppen att återhämta sig medan du fortfarande jobbar. Bra inför tävling.',
    how: ['Välj ett Över-under-pass i Zwift/Tacx', 'Växla 2 minuter strax över tröskel med 1 minut strax under', 'Håll flytande övergångar utan att tappa kadens'],
    tip: 'Fokusera på andningen på "under"-delen, så repar du dig snabbare.',
  }),
  card('zw-vo2', 'Zwift/Tacx VO₂-intervaller 5×4', 'Cykel', 'hard', 'Zwift & Tacx', [40, 0, 0, 8, 12], 0, 'Hårda intervaller, skonsamt för knän', {
    purpose: 'Höjer maxsyreupptaget utan stötbelastning.',
    how: ['Välj ett VO₂max-pass, 5 × 4 minuter', 'Kör i {z4}–{z5} med 3 minuters lugn vila', 'Sätt en jämn hård nivå från start'],
    tip: 'Ta bort allt som stör. Fokus, musik och kall fläkt.',
  }),
  card('zw-tempo', 'Zwift/Tacx Tempo 2×25 min', 'Cykel', 'quality', 'Zwift & Tacx', [30, 0, 50, 0, 0], 0, 'Jämnt och kontrollerat', {
    purpose: 'Bygger uthållighet och muskelutholdighet på jämn, tävlingsnära nivå.',
    how: ['Välj ett Tempo-pass i Zwift/Tacx, 2 × 25 minuter', 'Håll {z3}, jämn effekt och lugn andning', 'Sitt avslappnat, släpp axlar och händer'],
    tip: 'Perfekt för en 220 km-tävling, där jämn fart är allt.',
  }),
  card('zw-cad', 'Zwift/Tacx Lågkadens 5×6', 'Cykel', 'quality', 'Zwift & Tacx', [40, 0, 30, 0, 0], 0, 'Kraft med tungt trampmotstånd', {
    purpose: 'Bygger benstyrka med låg belastning på lederna.',
    how: ['Värm upp 15 minuter', '5 × 6 minuter i {z3} på låg kadens, 50–60 varv, med tungt motstånd', '3 minuter lugn trampning mellan'],
    tip: 'Håll ryggen rak och bålen spänd. Får du ont i knäna, sänk motståndet.',
  }),
  card('zw-pyr', 'Zwift/Tacx Pyramid', 'Cykel', 'quality', 'Zwift & Tacx', [44, 0, 0, 12, 8], 0, 'Varierande intervaller upp mot max', {
    purpose: 'Tröskel och VO₂ i samma pass. Variationen gör det lättare att hålla fokus.',
    how: ['Välj ett Pyramid-pass i Zwift/Tacx eller gör 1-2-3-4-3-2-1 minuter själv', 'De längre intervallerna i {z4}, de kortaste i {z5}', 'Lika lång vila som arbete'],
    tip: 'Håll tillbaka på de första intervallerna så att de sista blir starka.',
  }),
  card('zw-3030', 'Zwift/Tacx 30/30 ×3 set', 'Cykel', 'hard', 'Zwift & Tacx', [50, 0, 0, 0, 15], 0, 'Korta hårda drag', {
    purpose: 'Höjer maxsyreupptaget med korta hårda drag som är lättare att härda ut än långa intervaller.',
    how: ['Välj ett 30/30-pass eller kör själv', '3 set med 10 × (30 sekunder hårt i {z5}, 30 sekunder lätt), 5 minuters vila mellan seten', 'Håll samma effekt i alla dragen'],
    tip: 'Ha fläkt och vatten framme. Passet är kort men intensivt.',
  }),
  card('zw-ramp', 'Zwift/Tacx Ramptest', 'Cykel', 'quality', 'Zwift & Tacx', [20, 4, 4, 4, 3], 0, 'Test för att sätta rätt nivåer', {
    purpose: 'Mäter din nivå så att du kan sätta rätt effekt i de andra passen.',
    how: ['Välj Ramptest i Zwift eller motsvarande i Tacx', 'Effekten ökar var minut. Fortsätt tills du inte orkar mer', 'Trampa av 10 minuter efteråt'],
    tip: 'Gör testet utvilad och gör det med jämna mellanrum, till exempel var sjätte vecka.',
  }),
  card('zw-group', 'Zwift grupptur', 'Cykel', 'easy', 'Zwift & Tacx', [70, 25, 0, 0, 0], 0, 'Social och lugn inomhustur', {
    purpose: 'Lugn volym med sällskap. Bra när du behöver motivation.',
    how: ['Anmäl dig till en grupptur i Zwift', 'Håll dig i {z1} med lite {z2} i backarna', 'Chatta och ha kul, det är ett lugnt pass'],
    tip: 'Kör med din pappa i samma tur, så kan ni träna ihop på distans.',
  }),

  // ——— Styrka ———
  card('strength', 'Styrka helkropp', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 60, 'Ben, bål och överkropp', {
    purpose: 'Bygger kraft och skadeförebyggande styrka för hela kroppen.',
    how: ['Uppvärmning 10 minuter, rörlighet och lätta set', 'Knäböj eller marklyft 4×5, chins 4×6, rodd 3×8', 'Enbensböj 3×8 och bålövning 3 × 45 s'],
    tip: 'Tungt men med bra teknik. Lämna 1–2 reps kvar i tanken.',
  }, {
    home: {
      purpose: 'Håller styrkan uppe hemma med lätta redskap.',
      how: ['Uppvärmning 10 minuter', 'Enbensböj med ryggsäck 4×8, armhävningar 4×12, rodd med gummiband 3×12', 'Planka och sidoplanka 3 × 45 s'],
      tip: 'Sänk farten i nedfarten, 3 sekunder, så blir det tungt nog.',
    },
  }),
  card('strength-upper', 'Styrka överkropp & bål', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 45, 'Stakstyrka, bål', {
    purpose: 'Bygger stakstyrka och stabil bål. Det viktigaste för skidåkare.',
    how: ['Kabeldrag eller skivstångsrodd 4×8', 'Triceps och latsdrag 3×10', 'Ryggresningar och rotationsövningar 3×12'],
    tip: 'Håll överkroppen stabil och kör hela rörelsen.',
  }, {
    home: {
      purpose: 'Stakstyrka hemma med lätta redskap.',
      how: ['Stakdrag med gummiband ankrat högt 4×15', 'Armhävningar med bred grepp 3×12, hantelrodd 3×10', 'Ryggresningar och rotationer med gummiband 3×12'],
      tip: 'Använd tyngre band eller sänk hastigheten om det blir för lätt.',
    },
  }),
  card('strength-legs', 'Benstyrka', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 60, 'Knäböj, marklyft och enbensövningar', {
    purpose: 'Bygger kraft i ben och höfter, som ger stabilitet och tryck i varje skidtag och backe.',
    how: ['Uppvärmning 10 minuter med lätta set', 'Knäböj eller marklyft 4×5, utfall 3×8 per ben', 'Vadhöjningar och höftlyft 3×12'],
    tip: 'Kör tungt men med bra teknik. Lämna 1–2 reps kvar i tanken.',
  }, {
    home: {
      purpose: 'Bygger benstyrka hemma med kroppsvikt och lätta redskap.',
      how: ['Uppvärmning 10 minuter', 'Enbensböj eller bulgarisk split squat 4×8 per ben, step-ups 3×10', 'Höftlyft 3×15 och vadhöjningar 3×15'],
      tip: 'Sänk dig långsamt, tre sekunder ner, så blir det tungt nog.',
    },
  }),
  card('strength-back', 'Ryggstyrka', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 45, 'Rodd, drag och ryggresningar', {
    purpose: 'Bygger en stark rygg som bär stakningen och skyddar ländryggen på långa pass.',
    how: ['Rodd med skivstång 4×8, chins eller latsdrag 3×8', 'Ryggresningar 3×12 och face pulls 3×15', 'Avsluta med superman 2×12'],
    tip: 'Dra med ryggen, inte med armarna. Håll bröstet uppe.',
  }, {
    home: {
      purpose: 'Ryggstyrka hemma med gummiband och hantlar.',
      how: ['Hantelrodd 4×10 per arm', 'Ryggresningar och superman 3×12', 'Face pulls med gummiband 3×15'],
      tip: 'Klämm ihop skulderbladen och håll en sekund i toppläget.',
    },
  }),
  card('strength-core', 'Bål & stabilitet', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 30, 'Planka, rotation och dead bug', {
    purpose: 'En stark bål ger kraftöverföring mellan över- och underkropp i varje skidtag.',
    how: ['Planka och sidoplanka 3 × 45 s', 'Dead bug 3×10 och pallof press 3×10 per sida', 'Hängande benlyft eller hollow hold 3×12'],
    tip: 'Kvalitet framför kvantitet. Håll ländryggen stilla och andas.',
  }, {
    home: {
      purpose: 'Bålträning hemma utan redskap.',
      how: ['Planka, sidoplanka och hollow hold 3 × 40 s', 'Dead bug och rysk twist 3×12', 'Bålrotation med gummiband 3×12'],
      tip: 'Bra som avslutning efter ett lugnt pass.',
    },
  }),
  card('strength-explosive', 'Explosiv styrka', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 40, 'Hopp, kettlebell och kast', {
    purpose: 'Tränar snabbhet och kraft i avstampet och stakningen. Bra som skärpa.',
    how: ['Uppvärmning 10 minuter', 'Boxhopp eller sidohopp 3×6, kettlebell swings 3×15', 'Medicinbollskast 3×8 och burpees 3×10'],
    tip: 'Explosivt men kontrollerat. Vila fullt mellan seten.',
  }, {
    home: {
      purpose: 'Explosiv träning hemma med kroppsvikt.',
      how: ['Uppvärmning 10 minuter', 'Sidohopp 3×10 och burpees 3×10', 'Hopp upp från knäböj 3×8'],
      tip: 'Landa mjukt på framfoten och böj knäna.',
    },
  }),
  card('strength-stability', 'Knä- & höftstabilitet', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 30, 'Förebygger skador, skonsamt', {
    purpose: 'Stärker höfter och knän så att du klarar mer träning utan skador. Extra bra om du har känsliga knän.',
    how: ['Step-downs 3×10 per ben, enbensbalans 3 × 30 s', 'Höftabduktion med band och monster walk 3×12', 'Nordic hamstring 3×5 och copenhagen plank 3 × 20 s'],
    tip: 'Långsamt och kontrollerat. Knät ska peka åt samma håll som tårna.',
  }),
  card('strength-custom', 'Eget styrkepass', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 45, 'Välj övningarna själv', {
    purpose: 'Ett styrkepass där du väljer övningarna själv, för gym eller hemma.',
    how: ['Välj övningar och antal set och reps', 'Värm upp 10 minuter före första setet', 'Lämna 1–2 reps kvar i tanken'],
    tip: 'Blanda ben, rygg och bål så blir passet balanserat.',
  }),
  card('mobility', 'Rörlighet & core', 'Rörlighet', 'strength', 'Styrka', [0, 0, 0, 0, 0], 30, 'Kort och lätt', {
    purpose: 'Håller kroppen smidig och skadefri. Bra på lugna dagar.',
    how: ['10 minuter höft- och ryggrörlighet', '10 minuter bål: planka, sidoplanka, dead bug', '5–10 minuter stretch eller skumrulle'],
    tip: 'Gör det hemma på mattan. Kort och regelbundet slår långt och sällan.',
  }),

  // ——— Tävling & övrigt ———
  card('race', 'Tävling', 'Tävling', 'race', 'Tävling & övrigt', [30, 0, 0, 40, 20], 0, 'Skriv själv, t.ex. ett annat lopp', {
    purpose: 'Dags att prestera. Skriv namn och uppskattad tid.',
    how: ['Ät bra dagen innan och väl uppvärmd', 'Gå ut jämnt de första 20 minuterna', 'Låt det släppa i andra halvan'],
    tip: 'Anpassa minuterna per zon efter loppet, så stämmer statistiken.',
  }),
  card('rest', 'Vilodag', 'Vila', 'rest', 'Tävling & övrigt', [0, 0, 0, 0, 0], 0, 'Ingen träning, bara återhämtning', {
    purpose: 'Kroppen blir starkare när den vilar. Vilodagarna är en del av planen, inte ett avbrott.',
    how: ['Ingen planerad träning', 'Sov 8–9 timmar och ät ordentligt', 'En lugn promenad är helt okej'],
    tip: 'Känns du sliten flera dagar i rad, lägg in en extra vilodag hellre än att pressa.',
  }),
  card('other', 'Övrigt', 'Övrigt', 'other', 'Tävling & övrigt', [60, 0, 0, 0, 0], 0, 'Valfritt pass och zoner', {
    purpose: 'Valfritt pass. Skriv namn och fördela minuterna själv.',
    how: ['Välj typ och minuter per zon', 'Skriv en anteckning om upplägget'],
    tip: 'Bra för läger, tester eller vilodagsaktiviteter.',
  }),
]

export const CARD_GROUPS: Group[] = ['Distans', 'Kvalitet', 'Stakmaskin', 'Zwift & Tacx', 'Styrka', 'Tävling & övrigt']

export const cardById = (id: string) => CARDS.find((c) => c.id === id)

export type ZoneSystem = 'no' | 'us'

// Data lagras alltid i fem nivåer (lugn → max). Systemet styr bara namnen.
// Norska (Olympiatoppen): I1 lugn, I2 distans, I3 tempo, I4 tröskel, I5 max.
// Engelska (pulsbaserade, som Garmin/Polar): I1 = Z2 (lugn jogg), I2 = Z3, I3 = Z4, I4 = Z4+, I5 = Z5.
export const ZONE_SYSTEMS: Record<ZoneSystem, { title: string; labels: string[]; names: string[] }> = {
  no: { title: 'Norska I1–I5', labels: ['I1', 'I2', 'I3', 'I4', 'I5'], names: ['Lugn', 'Distans', 'Tempo', 'Tröskel', 'Max'] },
  us: { title: 'Engelska Z2–Z5', labels: ['Z2', 'Z3', 'Z4', 'Z4+', 'Z5'], names: ['Lugn jogg', 'Aerob', 'Tempo', 'Tröskel', 'VO₂max'] },
}

export const fillZones = (text: string, labels: string[]) => text.replace(/\{z([1-5])\}/g, (_, n) => labels[+n - 1])

export const SPORTS = ['Löpning', 'Rullskidor', 'Cykel', 'Skidor', 'Stakmaskin', 'Styrka', 'Rörlighet', 'Tävling', 'Vila', 'Övrigt'] as const

export const CATEGORY_COLOR: Record<Category, string> = {
  easy: 'var(--c-easy)',
  quality: 'var(--c-quality)',
  hard: 'var(--c-hard)',
  strength: 'var(--c-strength)',
  race: 'var(--c-race)',
  other: 'var(--c-other)',
  rest: 'var(--c-rest)',
}
