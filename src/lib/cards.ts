import type { Category, Coach, Exercise, Group, Sport, TrainingCard, Zones } from '../types'
import { list } from './exercises'

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
  card('strength-push', 'Push: bröst, axlar & triceps', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 60, 'Press uppåt och framåt', {
    purpose: 'Pressövningar för bröst, axlar och triceps. Tillsammans med Pull och Ben + bål blir det en komplett vecka.',
    how: ['Värm upp 5–10 minuter och kör två lätta set på första övningen', 'Flerledsövningarna först: 3–4 set om 6–10 reps med 2–3 minuters vila', 'Avsluta med isoleringsövningar: 2–3 set om 10–15 reps med 60–90 s vila'],
    tip: 'Stanna 1–3 reps före failure. Klarar du översta repsiffran i alla set, öka vikten nästa gång.',
  }, {
    home: {
      purpose: 'Push hemma med kroppsvikt och lätta vikter.',
      how: ['Armhävningar, pike push-ups och dips mot en stol eller soffa', 'Gör svårare genom att höja fötterna eller ta 3 sekunder ner', 'Sidolyft med vattenflaskor eller gummiband'],
      tip: 'Klarar du mer än 15 reps, gör övningen svårare i stället för att köra fler.',
    },
  }),
  card('strength-pull', 'Pull: rygg & biceps', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 55, 'Drag och rodd', {
    purpose: 'Dragövningar för rygg, bakre axlar och biceps. Balanserar pressövningarna och ger en rak hållning.',
    how: ['Värm upp 5–10 minuter, gärna på roddmaskin', 'Chins eller latsdrag och skivstångsrodd: 3–4 set om 6–10 reps', 'Kabelrodd, face pulls och curls: 2–3 set om 10–15 reps'],
    tip: 'Starta varje drag med skulderbladen och låt armarna komma efter.',
  }, {
    home: {
      purpose: 'Pull hemma med bord, hantlar och gummiband.',
      how: ['Inverterad rodd under ett stadigt bord', 'Hantelrodd (eller en ryggsäck) och superman', 'Face pulls och curls med gummiband'],
      tip: 'Håll en sekund i toppläget på varje rep, så räcker lätta vikter långt.',
    },
  }),
  card('strength-legs-core', 'Ben + bål', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 60, 'Knäböj, marklyft och mage', {
    purpose: 'Ben, säte och bål. Veckans största pass och grunden för både styrka och kondition.',
    how: ['Värm upp 10 minuter med lätta knäböj och utfall', 'Knäböj och rumänsk marklyft: 3–4 set om 6–10 reps med 2–3 minuters vila', 'Bulgarisk split squat, lårcurl och vader, avsluta med bålen'],
    tip: 'Djup och kontroll före vikt. Gå aldrig till failure på knäböj och marklyft.',
  }, {
    home: {
      purpose: 'Ben och bål hemma med kroppsvikt och en vikt.',
      how: ['Goblet squat med kettlebell, hantel eller ryggsäck', 'Enbens marklyft, bulgarisk split squat och höftlyft', 'Avsluta med dead bug och sidoplanka'],
      tip: 'Ta tre sekunder ner på varje rep, så blir även lätta vikter tunga.',
    },
  }),
  card('strength-fb2', 'Styrka helkropp B', 'Styrka', 'strength', 'Styrka', [0, 0, 0, 0, 0], 55, 'Andra helkroppspasset', {
    purpose: 'Det andra helkroppspasset i veckan, med andra övningar än A. Två helkroppspass i veckan tränar varje muskel två gånger.',
    how: ['Värm upp 10 minuter', 'Marklyft, lutande press och latsdrag: 3 set om 6–10 reps', 'Utfall, sidolyft och pallof press avslutar'],
    tip: 'Stanna 1–3 reps före failure och öka vikten lite i taget.',
  }, {
    home: {
      purpose: 'Helkropp B hemma.',
      how: ['Enbens marklyft och utfall', 'Armhävningar, inverterad rodd och pike push-ups', 'Sidoplanka avslutar'],
      tip: 'Kör passet som en lugn cirkel om tiden är knapp.',
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

  // ——— Tester ———
  card('test-strength', 'Styrketest', 'Styrka', 'quality', 'Tester', [0, 0, 0, 0, 0], 60, 'Knäböj, bänkpress, marklyft och chins', {
    purpose: 'Mäter din styrka så att du kan följa utvecklingen. Gör testet utvilad, gärna samma tid på dagen varje gång.',
    how: ['Värm upp 10–15 minuter och kör några lätta set av varje övning', 'Bygg upp mot 3RM i 3–5 set: den tyngsta vikten du klarar 3 reps med god teknik', 'Vila 3–4 minuter mellan de tunga seten och avsluta med max chins'],
    tip: 'Teknik före vikt. Ett godkänt försök är ett med samma form som på uppvärmningen.',
  }, {
    home: {
      purpose: 'Mäter din styrka hemma utan tunga vikter.',
      how: ['Värm upp 10 minuter', 'Max armhävningar i ett set, vila 3 minuter', 'Knäböj på 2 minuter, vila 3 minuter, och planka så länge du orkar'],
      tip: 'Gör testet på samma sätt varje gång så blir resultaten jämförbara.',
    },
  }),
  card('test-run', 'Löptest 5 km', 'Löpning', 'quality', 'Tester', [20, 0, 0, 15, 10], 0, 'Så snabbt du kan, samma bana varje gång', {
    purpose: 'Visar hur din löpkondition utvecklas.',
    how: ['Jogga lugnt 15 minuter och gör 3–4 korta stegringar', '5 km så snabbt du kan hålla jämnt', 'Jogga ner 10 minuter'],
    tip: 'Starta lite lugnare än du tror. Öka sista kilometern om du har kvar.',
  }),
  card('test-conditioning', 'Konditionstest', 'Kondition', 'quality', 'Tester', [15, 0, 0, 5, 5], 0, '2 km rodd, eller burpees hemma', {
    purpose: 'Mäter din kondition på ett sätt som går att upprepa exakt.',
    how: ['Värm upp 10 minuter på roddmaskinen med några korta ryck', '2000 m rodd så snabbt du kan', 'Varva ner 5 minuter'],
    tip: 'Hitta ett tempo per 500 m som du kan hålla och spurta de sista 300 m.',
  }, {
    home: {
      purpose: 'Konditionstest hemma utan redskap.',
      how: ['Värm upp 10 minuter', 'Så många burpees du hinner på 5 minuter', 'Varva ner 5 minuter'],
      tip: 'Hitta en rytm du kan hålla i fem minuter.',
    },
  }),
  card('test-crossfit', 'Benchmark-WOD', 'CrossFit', 'quality', 'Tester', [12, 0, 5, 13, 5], 0, 'AMRAP 20 som du gör om och jämför', {
    purpose: 'Samma WOD varje gång, så att du ser hur din kapacitet växer.',
    how: ['Värm upp 10 minuter', '20 minuter: 5 chins, 10 armhävningar, 15 knäböj, så många varv du hinner', 'Skriv upp antal hela varv'],
    tip: 'Skala på samma sätt varje gång, annars går resultaten inte att jämföra.',
  }),
  card('test-bike', 'Cykeltest 20 min', 'Cykel', 'quality', 'Tester', [25, 0, 0, 10, 20], 0, 'Snittwatt på 20 minuter', {
    purpose: 'Mäter din tröskelkraft på cykeln (ungefär 95 % av snittwatten blir din FTP).',
    how: ['Värm upp 20 minuter med två korta hårda drag', '20 minuter så hårt du kan hålla jämnt', 'Varva ner 10 minuter'],
    tip: 'Kör på trainer eller samma backe varje gång.',
  }),

  // ——— CrossFit ———
  card('cf-amrap', 'AMRAP 20: chins, armhävningar, knäböj', 'CrossFit', 'hard', 'CrossFit', [12, 0, 5, 13, 5], 0, 'Så många varv som möjligt på 20 minuter', {
    purpose: 'En klassisk CrossFit-WOD som bygger uthållighet i hela kroppen. Du tävlar mot klockan och dig själv.',
    how: ['Värm upp 10 minuter: rodd, lätta knäböj och armhävningar', '20 minuter: 5 chins, 10 armhävningar, 15 knäböj, så många varv du hinner', 'Skriv upp antal varv. Målet är 8 eller fler'],
    tip: 'Dela upp reps tidigt i stället för att köra slut på första varven. Skala chins med gummiband.',
  }, {
    home: {
      purpose: 'AMRAP hemma med kroppsvikt och ett stadigt bord.',
      how: ['Värm upp 10 minuter', '20 minuter: 5 inverterade rodd under bordet, 10 armhävningar, 15 knäböj', 'Skriv upp antal varv'],
      tip: 'Armhävningar på knä räknas också. Hellre fler varv med bra form.',
    },
  }),
  card('cf-emom', 'EMOM 16 min', 'CrossFit', 'hard', 'CrossFit', [12, 0, 4, 10, 6], 0, 'En ny övning varje minut', {
    purpose: 'Every minute on the minute: jämnt tempo och inbyggd vila. Bygger kondition och arbetskapacitet.',
    how: ['Värm upp 10 minuter', 'Starta en ny övning varje hel minut, 4 varv: kettlebell swings, burpees, wall balls, rodd', 'Vila resten av minuten och avsluta med 5 minuter lugnt'],
    tip: 'Välj reps så att du får 15–20 sekunders vila varje minut. Hinner du inte, sänk reps.',
  }, {
    home: {
      purpose: 'EMOM hemma utan stora redskap.',
      how: ['Värm upp 10 minuter', 'Varje hel minut, 4 varv: hopp från knäböj, burpees, push press med hantlar, hopprep', 'Vila resten av minuten'],
      tip: 'Saknar du hopprep, kör höga knän i 40 sekunder.',
    },
  }),
  card('cf-fortime', '21-15-9: thrusters och chins', 'CrossFit', 'hard', 'CrossFit', [12, 0, 0, 8, 8], 0, 'For time, så snabbt du kan', {
    purpose: 'Kort och mycket intensivt. Ett av de mest kända CrossFit-uppläggen, bra att testa sig mot.',
    how: ['Värm upp 12 minuter med lätta thrusters och chins', '21, 15 och 9 reps av thrusters och chins, så snabbt du kan', 'Skriv upp tiden'],
    tip: 'Välj en vikt du klarar 10 thrusters i rad med. Skala chins med band eller hopp.',
  }, {
    home: {
      purpose: '21-15-9 hemma med hantlar.',
      how: ['Värm upp 10 minuter', '21, 15 och 9 reps av thrusters med hantlar och burpees', 'Skriv upp tiden'],
      tip: 'Ryggsäck med böcker fungerar som vikt.',
    },
  }),
  card('cf-chipper', 'Chipper', 'CrossFit', 'hard', 'CrossFit', [12, 0, 8, 12, 3], 0, 'En lång lista, beta av den', {
    purpose: 'Många reps av flera övningar i följd. Tränar uthållighet och att hålla tempot.',
    how: ['Värm upp 10 minuter', 'Beta av i ordning: 50 wall balls, 40 kettlebell swings, 30 boxhopp, 20 burpees, 10 chins', 'Dela upp i små set och fortsätt röra dig'],
    tip: 'Den första övningen lurar. Ta det lugnt där, det är i slutet det avgörs.',
  }, {
    home: {
      purpose: 'Chipper hemma med kroppsvikt.',
      how: ['Värm upp 10 minuter', '50 knäböj, 40 kettlebell swings (eller hopp från knäböj), 30 utfall, 20 burpees, 10 armhävningar', 'Dela upp i små set'],
      tip: 'Skriv upp tiden och försök slå den om några veckor.',
    },
  }),
  card('cf-strength-wod', 'Styrka + WOD', 'CrossFit', 'quality', 'CrossFit', [10, 0, 5, 8, 2], 20, 'Tung lyftdel och en kort AMRAP', {
    purpose: 'Typiskt CrossFit-pass: först en tung teknikövning, sedan en kort WOD.',
    how: ['Värm upp 10 minuter med tom stång', 'Frivändning 5 × 3 med 2 minuters vila, öka vikten för varje set', 'AMRAP 10 minuter: 8 toes to bar, 12 wall balls, 30 double unders'],
    tip: 'Tekniken i frivändningen går före vikten. Filma gärna ett set.',
  }, {
    home: {
      purpose: 'Styrka och WOD hemma med hantlar.',
      how: ['Värm upp 10 minuter', 'Push press 5 × 5 med hantlar', 'AMRAP 10 minuter: 15 sit-ups, 10 burpees, 30 hopprep'],
      tip: 'Välj hantlar du klarar 8 push press med, kör 5.',
    },
  }),
  card('cf-intervals', 'Intervaller: rodd, thrusters, burpees', 'CrossFit', 'hard', 'CrossFit', [12, 0, 0, 12, 8], 0, '5 varv, lika lång vila som arbete', {
    purpose: 'CrossFit-intervaller med vila mellan varven. Hög intensitet men går att hålla jämnt.',
    how: ['Värm upp 10 minuter', '5 varv: 250 m rodd, 10 thrusters, 10 burpees', 'Vila lika länge som varvet tog'],
    tip: 'Sikta på samma tid i alla fem varv.',
  }, {
    home: {
      purpose: 'Intervaller hemma.',
      how: ['Värm upp 10 minuter', '5 varv: 40 s höga knän, 10 thrusters med hantlar, 10 burpees', 'Vila lika länge som varvet tog'],
      tip: 'Håll jämnt tempo i alla varv.',
    },
  }),

  // ——— Gym & kondition ———
  card('cond-steady', 'Lugn kondition', 'Kondition', 'easy', 'Gym & kondition', [45, 0, 0, 0, 0], 0, 'Crosstrainer, roddmaskin eller cykel', {
    purpose: 'Bygger grundkondition utan att slita. Grunden som gör att du orkar de hårda passen.',
    how: ['Välj crosstrainer, roddmaskin eller motionscykel', 'Håll {z1} hela passet, du ska kunna prata', 'Byt maskin halvvägs om du vill ha omväxling'],
    tip: 'Det ska kännas lätt. Det är de lugna passen som gör att du återhämtar dig till nästa hårda.',
  }, { flex: true }),
  card('cond-threshold', 'Konditionspass tröskel 4×6 min', 'Kondition', 'quality', 'Gym & kondition', [21, 0, 0, 24, 0], 0, 'Roddmaskin eller crosstrainer', {
    purpose: 'Höjer tröskeln, alltså hur hårt du kan hålla länge.',
    how: ['Värm upp 10 minuter i {z1}', '4 × 6 minuter i {z4}, 2 minuter lugnt mellan', 'Avsluta med 5 minuter lugnt'],
    tip: 'Jämnt tempo i alla fyra. Är sista intervallen klart sämst gick du ut för hårt.',
  }),
  card('cond-intervals', 'Konditionsintervaller 8×2 min', 'Kondition', 'hard', 'Gym & kondition', [20, 0, 0, 6, 14], 0, 'Roddmaskin, airbike eller löpband', {
    purpose: 'Höjer maxkonditionen med korta, hårda intervaller.',
    how: ['Värm upp 10 minuter och kör två korta stegringar', '8 × 2 minuter i {z5}, 1 minuts lugn vila', 'Varva ner 5 minuter'],
    tip: 'Hårt men kontrollerat. Du ska kunna hålla samma tempo i alla åtta.',
  }),
  card('hiit-tabata', 'HIIT Tabata 4 block', 'Kondition', 'hard', 'Gym & kondition', [14, 0, 0, 4, 12], 0, 'Korta maxdrag, 20 s på och 10 s vila', {
    purpose: 'Mycket effekt på kort tid. Höjer maxkondition och snabbhet.',
    how: ['Värm upp 8 minuter med lätt rörelse och några korta ruscher', '4 block à 4 minuter: 20 sekunder max, 10 sekunder vila. Airbike, roddmaskin eller burpees', '2 minuter lugnt mellan blocken'],
    tip: 'Fullt ös på varje 20-sekundersdrag. Hellre fyra riktiga block än sex halvhjärtade.',
  }, {
    home: {
      purpose: 'Tabata hemma utan redskap. Kort och effektivt.',
      how: ['Värm upp 8 minuter med jogg på stället och höga knän', '4 block à 4 minuter (20 s max, 10 s vila): burpees, jump squats, mountain climbers, höga knän', '2 minuter lugnt mellan blocken'],
      tip: 'Landa mjukt. Lägg en matta under om golvet är hårt.',
    },
  }),
  card('hiit-circuit', 'Cirkelträning', 'Kondition', 'quality', 'Gym & kondition', [15, 5, 10, 10, 0], 0, 'Stationer med kroppsvikt och kettlebell', {
    purpose: 'Kombinerar styrka och kondition i samma pass.',
    how: ['Värm upp 10 minuter', '3–4 varv av 6 stationer, 40 sekunder arbete och 20 sekunder byte: kettlebell swing, roddmaskin, utfall, armhävningar, boxhopp, planka', '2 minuter vila mellan varven'],
    tip: 'Håll tekniken även när det blir tungt. Sänk vikten hellre än att slarva.',
  }, {
    home: {
      purpose: 'Cirkelträning hemma med kroppsvikt.',
      how: ['Värm upp 10 minuter', '3–4 varv av 6 stationer, 40 s arbete och 20 s vila: knäböj, armhävningar, utfall, mountain climbers, höftlyft, planka', '2 minuter vila mellan varven'],
      tip: 'Använd en ryggsäck med böcker som vikt om det blir för lätt.',
    },
  }),
  card('hiit-amrap', 'AMRAP 20 min', 'Kondition', 'hard', 'Gym & kondition', [10, 0, 5, 10, 5], 0, 'Så många varv som möjligt', {
    purpose: 'Hård och rolig kondition där du tävlar mot dig själv.',
    how: ['Värm upp 10 minuter', '20 minuter: så många varv som möjligt av 10 kettlebell swings, 10 burpees, 15 air squats och 200 m rodd', 'Skriv upp antal varv och slå det nästa gång'],
    tip: 'Hitta ett tempo du kan hålla i 20 minuter. Den som rusar första fem dör sist.',
  }, {
    home: {
      purpose: 'AMRAP hemma utan redskap.',
      how: ['Värm upp 10 minuter', '20 minuter: så många varv som möjligt av 10 burpees, 15 knäböj, 10 armhävningar och 20 mountain climbers', 'Skriv upp antal varv'],
      tip: 'Dela upp burpees i mindre set tidigt, så orkar du hela vägen.',
    },
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

export const CARD_GROUPS: Group[] = ['Distans', 'Kvalitet', 'Stakmaskin', 'Zwift & Tacx', 'Styrka', 'CrossFit', 'Gym & kondition', 'Tester', 'Tävling & övrigt']

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

export const SPORTS = ['Löpning', 'Rullskidor', 'Cykel', 'Skidor', 'Stakmaskin', 'Styrka', 'Kondition', 'CrossFit', 'Rörlighet', 'Tävling', 'Vila', 'Övrigt'] as const

export const CATEGORY_COLOR: Record<Category, string> = {
  easy: 'var(--c-easy)',
  quality: 'var(--c-quality)',
  hard: 'var(--c-hard)',
  strength: 'var(--c-strength)',
  race: 'var(--c-race)',
  other: 'var(--c-other)',
  rest: 'var(--c-rest)',
}

// Färdiga övningslistor per pass, för gym (eller enda versionen) och hemma
const EX: Record<string, [Exercise[], Exercise[]?]> = {
  strength: [
    list(['squat', 4, '5'], ['pullup', 4, '6'], ['barbell-row', 3, '8'], ['single-squat', 3, '8 per ben'], ['plank', 3, '45 s']),
    list(['single-squat', 4, '8 per ben'], ['pushup', 4, '12'], ['db-row', 3, '12 per arm'], ['plank', 3, '45 s'], ['side-plank', 3, '45 s per sida']),
  ],
  'strength-push': [
    list(['bench', 4, '6–8'], ['incline-press', 3, '8–10'], ['shoulder-press', 3, '8–10'], ['lateral-raise', 3, '12–15'], ['pushdown', 3, '10–12'], ['overhead-ext', 2, '10–12']),
    list(['pushup', 4, '8–15'], ['pike-pushup', 3, '6–10'], ['bench-dip', 3, '10–12'], ['lateral-raise', 3, '15'], ['close-pushup', 2, '8–12']),
  ],
  'strength-pull': [
    list(['pullup', 4, '5–8'], ['barbell-row', 3, '6–8'], ['cable-row', 3, '10–12'], ['face-pull', 3, '12–15'], ['curl', 3, '10–12'], ['hammer-curl', 2, '10–12']),
    list(['inverted-row', 4, '8–12'], ['db-row', 3, '10 per arm'], ['superman', 3, '12'], ['face-pull', 3, '15'], ['curl', 3, '12']),
  ],
  'strength-legs-core': [
    list(['squat', 4, '6–8'], ['rdl2', 3, '8–10'], ['bulgarian', 3, '8 per ben'], ['leg-curl', 3, '10–12'], ['calf', 3, '12–15'], ['hanging-leg', 3, '8–12'], ['plank', 3, '45 s']),
    list(['goblet-squat', 4, '12'], ['rdl', 3, '10 per ben'], ['bulgarian', 3, '10 per ben'], ['bridge', 3, '15'], ['calf', 3, '15'], ['dead-bug', 3, '10 per sida'], ['side-plank', 3, '30 s per sida']),
  ],
  'strength-fb2': [
    list(['deadlift', 3, '5'], ['incline-press', 3, '8–10'], ['lat', 3, '8–12'], ['lunge', 3, '10 per ben'], ['lateral-raise', 2, '12–15'], ['pallof', 3, '10 per sida']),
    list(['rdl', 3, '10 per ben'], ['pushup', 3, '10–15'], ['inverted-row', 3, '8–12'], ['lunge', 3, '10 per ben'], ['pike-pushup', 2, '8'], ['side-plank', 3, '30 s per sida']),
  ],
  'strength-upper': [
    list(['barbell-row', 4, '8'], ['lat', 3, '10'], ['pushdown', 3, '10'], ['back-ext', 3, '12'], ['core-rot', 3, '12 per sida']),
    list(['band-pole', 4, '15'], ['pushup', 3, '12'], ['db-row', 3, '10 per arm'], ['back-ext', 3, '12'], ['core-rot', 3, '12 per sida']),
  ],
  'strength-legs': [
    list(['squat', 4, '5'], ['lunge', 3, '8 per ben'], ['bridge', 3, '12'], ['calf', 3, '12']),
    list(['bulgarian', 4, '8 per ben'], ['step-up', 3, '10 per ben'], ['bridge', 3, '15'], ['calf', 3, '15']),
  ],
  'strength-back': [
    list(['barbell-row', 4, '8'], ['pullup', 3, '8'], ['back-ext', 3, '12'], ['face-pull', 3, '15'], ['superman', 2, '12']),
    list(['db-row', 4, '10 per arm'], ['back-ext', 3, '12'], ['superman', 3, '12'], ['face-pull', 3, '15']),
  ],
  'strength-core': [
    list(['plank', 3, '45 s'], ['side-plank', 3, '45 s per sida'], ['dead-bug', 3, '10 per sida'], ['pallof', 3, '10 per sida'], ['hanging-leg', 3, '12']),
    list(['plank', 3, '40 s'], ['side-plank', 3, '40 s per sida'], ['hollow', 3, '40 s'], ['dead-bug', 3, '12 per sida'], ['russian', 3, '12 per sida'], ['core-rot', 3, '12 per sida']),
  ],
  'strength-explosive': [
    list(['box-jump', 3, '6'], ['lateral-hop', 3, '10'], ['kb-swing', 3, '15'], ['med-ball', 3, '8'], ['burpee', 3, '10']),
    list(['lateral-hop', 3, '10'], ['burpee', 3, '10'], ['squat-jump', 3, '8']),
  ],
  'strength-stability': [list(['step-down', 3, '10 per ben'], ['balance', 3, '30 s per ben'], ['hip-abd', 3, '12 per ben'], ['monster', 3, '12 steg per håll'], ['nordic', 3, '5'], ['copenhagen', 3, '20 s per sida'])],
  mobility: [list(['plank', 2, '45 s'], ['side-plank', 2, '30 s per sida'], ['dead-bug', 2, '10 per sida'], ['bridge', 2, '12'])],
  'cf-amrap': [
    list(['pullup', 8, '5'], ['pushup', 8, '10'], ['squat', 8, '15']).map((e) => ({ ...e, rest: 0 })),
    list(['inverted-row', 8, '5'], ['pushup', 8, '10'], ['squat', 8, '15']).map((e) => ({ ...e, rest: 0 })),
  ],
  'cf-emom': [
    list(['kb-swing', 4, '15'], ['burpee', 4, '10'], ['wall-ball', 4, '12'], ['rower', 4, '12 kal']).map((e) => ({ ...e, rest: 0 })),
    list(['squat-jump', 4, '10'], ['burpee', 4, '10'], ['push-press', 4, '10'], ['double-under', 4, '40 s']).map((e) => ({ ...e, rest: 0 })),
  ],
  'cf-fortime': [
    list(['thruster', 3, '21–15–9'], ['pullup', 3, '21–15–9']).map((e) => ({ ...e, rest: 0 })),
    list(['thruster', 3, '21–15–9'], ['burpee', 3, '21–15–9']).map((e) => ({ ...e, rest: 0 })),
  ],
  'cf-chipper': [
    list(['wall-ball', 1, '50'], ['kb-swing', 1, '40'], ['box-jump', 1, '30'], ['burpee', 1, '20'], ['pullup', 1, '10']).map((e) => ({ ...e, rest: 0 })),
    list(['squat', 1, '50'], ['kb-swing', 1, '40'], ['lunge', 1, '30'], ['burpee', 1, '20'], ['pushup', 1, '10']).map((e) => ({ ...e, rest: 0 })),
  ],
  'cf-strength-wod': [
    [...list(['clean', 5, '3']), ...list(['toes-to-bar', 5, '8'], ['wall-ball', 5, '12'], ['double-under', 5, '30']).map((e) => ({ ...e, rest: 0 }))],
    [...list(['push-press', 5, '5']), ...list(['sit-up', 5, '15'], ['burpee', 5, '10'], ['double-under', 5, '30']).map((e) => ({ ...e, rest: 0 }))],
  ],
  'cf-intervals': [
    list(['rower', 5, '250 m'], ['thruster', 5, '10'], ['burpee', 5, '10']).map((e, i) => ({ ...e, rest: i === 2 ? 120 : 0 })),
    list(['high-knees', 5, '40 s'], ['thruster', 5, '10'], ['burpee', 5, '10']).map((e, i) => ({ ...e, rest: i === 2 ? 90 : 0 })),
  ],
  'hiit-circuit': [
    list(['kb-swing', 4, '40 s'], ['rower', 4, '40 s'], ['lunge', 4, '40 s'], ['pushup', 4, '40 s'], ['box-jump', 4, '40 s'], ['plank', 4, '40 s']).map((e) => ({ ...e, rest: 20 })),
    list(['squat', 4, '40 s'], ['pushup', 4, '40 s'], ['lunge', 4, '40 s'], ['mountain-climber', 4, '40 s'], ['bridge', 4, '40 s'], ['plank', 4, '40 s']).map((e) => ({ ...e, rest: 20 })),
  ],
  'hiit-tabata': [
    list(['rower', 8, '20 s'], ['burpee', 8, '20 s'], ['kb-swing', 8, '20 s'], ['mountain-climber', 8, '20 s']).map((e) => ({ ...e, rest: 10 })),
    list(['burpee', 8, '20 s'], ['squat-jump', 8, '20 s'], ['mountain-climber', 8, '20 s'], ['high-knees', 8, '20 s']).map((e) => ({ ...e, rest: 10 })),
  ],
  'hiit-amrap': [
    list(['kb-swing', 5, '10'], ['burpee', 5, '10'], ['squat', 5, '15'], ['rower', 5, '200 m']).map((e) => ({ ...e, rest: 0 })),
    list(['burpee', 5, '10'], ['squat', 5, '15'], ['pushup', 5, '10'], ['mountain-climber', 5, '20']).map((e) => ({ ...e, rest: 0 })),
  ],
}
for (const c of CARDS) {
  const e = EX[c.id]
  if (!e) continue
  c.exercises = e[0]
  if (e[1]) c.homeExercises = e[1]
}

// Övningslistan som ett nytt pass får (kopior, så att avbockningar inte delas)
export const cardExercises = (c: Pick<TrainingCard, 'exercises' | 'homeExercises'>, location?: 'gym' | 'home'): Exercise[] | undefined => {
  const src = location === 'home' && c.homeExercises ? c.homeExercises : c.exercises
  return src?.length ? src.map(({ done: _d, ...e }) => ({ ...e })) : undefined
}

const TEST_LISTS: Record<string, [string[], string[]?]> = {
  'test-strength': [['squat-3rm', 'bench-3rm', 'deadlift-3rm', 'pullups-max'], ['pushups-max', 'squats-2min', 'plank-max']],
  'test-run': [['run-5k']],
  'test-conditioning': [['row-2k'], ['burpees-5min']],
  'test-crossfit': [['wod-amrap20']],
  'test-bike': [['ftp-20']],
}
for (const c of CARDS) {
  const t = TEST_LISTS[c.id]
  if (!t) continue
  c.tests = t[0]
  if (t[1]) c.homeTests = t[1]
}

// Testerna ett pass mäter (hemmaversionen om passet görs hemma)
export const cardTests = (c: Pick<TrainingCard, 'tests' | 'homeTests'>, location?: 'gym' | 'home') => (location === 'home' && c.homeTests ? c.homeTests : c.tests) ?? []
