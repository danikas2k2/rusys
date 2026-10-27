# RŪSYS diegimo monitoringo planas

Tai lietuviškas dabartinės Synology / Docker aplinkos monitoringo darbų planas. Nuo platformos nepriklausomos ribos
aprašytos [bendrajame plane](MONITORING-ROADMAP.md), o įgyvendinimo vadovai pateikti
[monitoringo apžvalgoje](MONITORING.md).

**Būsenos peržiūra: 2026-10-27.** Pažymėti punktai remiasi kodu ir **2026-10-26** užfiksuotais patikrinimais
telemetrijos saugyklose. Tai nėra naujas produkcinės aplinkos auditas. Įgyvendintas komponentas dar nereiškia, kad
atlikti visi likę priėmimo patikrinimai.

## 0. Principai

- Telemetriją saugoti atskirai nuo NAS; Alloy surenka metrikas, logus ir traces bei persiunčia juos į Grafana Cloud.
- Viešą prieinamumą tikrinti nepriklausomai nuo aplikacijos, duomenų bazės ir NAS kolektoriaus.
- Diegiant per blue/green išlaikyti paslaugos, aplinkos, versijos ir slot'o tapatybę.
- Duomenų bazės ir OTLP sąsajas laikyti privačias arba autentifikuotas; siuntimui ir administravimui naudoti atskirus,
  reikiamomis teisėmis apribotus prisijungimo duomenis.
- Nesiųsti prisijungimo duomenų, asmens duomenų ar neapriboto užklausų turinio; palikti tik apibrėžtus diagnostikos
  laukus.
- Migruojant pakeisti platformai būdingus kolektorius, išlaikant instrumentavimą ir privatumo ribas.

## 1. Etapų būsena

| Etapas | Sritis                      | Užfiksuota įgyvendinimo būsena                                                                      | Likę apribojimai                                                                                                       |
| ------ | --------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1      | NAS ir konteinerių resursai | Įdiegti Alloy, cAdvisor ir Unix exporter; resursų laiko eilutės matomos                             | Reikia užfiksuoti prijungtų katalogų auditą ir veikimo tęstinumą po restarto; sustabdyti slot'ai naujų matavimų neturi |
| 2      | Išorinis prieinamumas       | Sukonfigūruotos viešo puslapio ir `/api/health` patikros; sėkmingi matavimai matomi                 | Nepatvirtintas gavimas pašto dėžutėje ir laikinos išorinės patikros sutrikimo bei atsistatymo testas                   |
| 3      | Docker logai                | Struktūrizuoti, privatumo filtrais apdoroti logai surenkami į Loki                                  | Neatpažinta išvestis sąmoningai pakeičiama turinio pašalinimo įvykiais                                                 |
| 4      | NGINX užklausos             | JSON prieigos loguose pateikiami statusai ir užklausų bei upstream laikai                           | Upstream laikų sąrašų negalima laikyti viena skaitine trukme                                                           |
| 5      | MongoDB metrikos            | Įgyvendintas atskiras monitoringo vartotojas ir eksporterio integracija; būklė bei aktyvumas matomi | Reikia užfiksuoti įdiegtos aplinkos teisių ir atkūrimo po konteinerio sukūrimo iš naujo patikrinimus                   |
| 6      | Backend traces              | OpenTelemetry HTTP/protobuf siunčiamas per privatų kolektorių; traces matomi                        | Reikia priėmimo įrodymų apie tipinių autentifikuotų operacijų medžius ir įdiegtos aplinkos izoliaciją                  |
| 7      | Frontend telemetrija        | Įgyvendinti Faro Web Vitals, nuasmenintos klaidos ir apriboti įvykiai; telemetrija matoma           | Sesijų istorija, atkūrimas ir neapribotas automatinis veiksmų rinkimas sąmoningai neįtraukti                           |
| 8      | Dashboardai ir perspėjimai  | Įdiegti keturi dashboardai ir dešimt taisyklių; vertinimo ir pranešimų nukreipimo testai užfiksuoti | Trūksta backup duomenų šaltinio, aptarnaujamos versijos signalo, gavimo patvirtinimo ir rankinių dashboardų patikrų    |
| 9      | Istorijos saugojimas        | Poreikis įvertintas; dokumentuotas preliminarus 14 dienų laikotarpis                                | Laukia operatoriaus ir paskyros sąlygų patvirtinimas; nepriklausomas dienos archyvas atidėtas, neįdiegtas              |

## 2. Grafana Cloud konfigūracija

Metrikos, logai ir traces siunčiami atskirais keliais su atskirais prisijungimo duomenimis; administravimo duomenys taip
pat atskirti. Vietoje senų diegimo pavyzdžių naudoti dabartinę [Compose konfigūraciją](../../docker/compose.yaml) ir
konkrečių sričių vadovus. Nespausdinti galutinės diegimo konfigūracijos su slaptais duomenimis. Planuojamas 14 dienų
laikotarpis nėra patvirtinta paskyros suteikiama garantija; užfiksuoti stack metaduomenys rodė bandomąjį planą. Žr.
[istorijos saugojimo sprendimą](RETENTION.md).

## 3. NAS ir konteinerių resursai

[Alloy konfigūracija](../../docker/monitoring/config.alloy) renka cAdvisor ir Unix exporter duomenis. Hosto katalogų
prijungimas, Docker komponentų aptikimas ir slaptų duomenų perdavimas priklauso diegimo aplinkai. Nediegti Alloy tiesiai
į DSM ir nekeisti DSM sisteminių failų vien tam, kad atsirastų metrikos. Perkrauti tik susijusias paslaugas, nestabdyti
viso projekto.

Konteinerių užklausas riboti RŪSYS vardais ir projektu bei aplinka: užfiksuota cAdvisor `project` žyma apėmė ir
nesusijusius NAS konteinerius. CPU rodikliai reiškia branduolių ekvivalentus, jei nėra normalizuoti. Darbinės atminties
kiekis baitais tinka ir konteineriams be limito; procentiniai perspėjimai taikomi tik baigtiniams, nenuliniams limitams.
Tarp matavimų įvykę pikai gali likti nepastebėti. Žr. [dashboardų aprėptį](DASHBOARDS-AND-ALERTS.md#dashboard-coverage).

## 4. Išorinis prieinamumas

Išorinės patikros yra `rusys-homepage` ir `rusys-health`. Health maršrutas grąžina HTTP 200 ir
`Cache-Control: no-store`; jis tikrina aplikacijos gyvybingumą, nesikreipdamas į MongoDB. Sėkmingas health atsakymas
pats savaime neįrodo priklausomybių pasirengimo. Užfiksuotos patikros vyko kas penkias minutes. Perspėjimų laikotarpiai
ir matavimų kiekio apribojimai aprašyti [perspėjimų sąlygose](DASHBOARDS-AND-ALERTS.md#baseline-alert-conditions);
metrikų matavimai neįrodo atskirų, iš eilės vykusių patikros bandymų. Vadovautis
[Synthetic Monitoring vadovu](SYNTHETIC-MONITORING.md).

## 5. Centralizuoti Docker logai

Aplikacija naudoja apribotus struktūrizuotus įvykius ir papildomą privatumo filtrą Alloy kolektoriuje, o ne anksčiau
siūlytą `pino` priklausomybę. Aptinkami aplikacijos slot'ų, gateway, duomenų bazės ir monitoringo logai; sustabdyti
slot'ai išlaiko ankstesnę istoriją, bet naujų įrašų nesiunčia. [Logų vadove](DOCKER-LOGGING.md) apibrėžti palaikomi
laukai, prisijungimo duomenys ir patikros. Nepersiųsti neapribotos framework išvesties, išimčių teksto, antraščių ar
duomenų bazės dokumentų.

## 6. NGINX užklausos ir trukmė

Gateway siunčia apribotus JSON prieigos logus su statusu, skaitiniu `request_time`, upstream laikų eilutėmis ir atsakymo
baitų kiekiu. URL užklausų parametrai, slapukai ir autorizacijos antraštės neįtraukiami. Neatpažintų ar netaisyklingų
įrašų turinys pašalinamas. Žr. [dabartinę schemą](DOCKER-LOGGING.md). API diagnostika neapima `/api/health`; santykiniai
perspėjimai reikalauja bent 20 tikrų API užklausų per penkias minutes. Išorinio prieinamumo ir gateway telemetrijos
aprėpties taisyklės atskirai padengia mažo srauto atvejus.

## 7. MongoDB metrikos

Diegimas naudoja `DB_MONITORING_URI`, atskirą `clusterMonitor` vartotoją ir privataus duomenų bazės adreso aptikimą per
Docker. Hosto tinkle veikiantis kolektorius nesiremia Compose DNS ar viešu MongoDB portu. Prieš įjungiant monitoringą
diegimo patikros įsitikina, kad neautentifikuotas `serverStatus` atmetamas. Žr.
[MongoDB metrikų vadovą](MONGODB-METRICS.md) dėl prisijungimo duomenų, neigiamų teisių patikrų ir regresinių testų
laikinuose konteineriuose. Eksporterio pasiekiamumas ir ryšys su duomenų baze tikrinami atskirai; būklės ir aktyvumo
laiko eilutės neparodo aplikacijos duomenų bazės dydžio.

## 8. Backend OpenTelemetry

Node.js instrumentavimo hook inicializuoja aiškiai sukonfigūruotą provider ir HTTP/protobuf eksporterį, o ne ankstesnį
`@vercel/otel` pavyzdį. Atskira `traces` paslauga priima srautą privačiame aplikacijos tinkle ir persiunčia į saugyklą,
nepublikuodama imtuvo portų. Resursų atributai yra `service.name`, `service.version`, `deployment.environment.name` ir
`deployment.slot`; jų reikšmės imamos iš validuojamų aplinkos kintamųjų. Pasirinktiniai produktų, duomenų bazės ir
paveikslėlių spans atrenkami imties būdu, ribojami ir filtruojami. Žr. [backend tracing vadovą](BACKEND-TRACING.md).
Vien testų aprašymas neįrodo, kad papildomi Docker integraciniai testai buvo vykdyti ar patikrintos įdiegtos aplinkos
tinklo ribos.

## 9. Frontend stebėsena

Faro renka palaikomus Web Vitals, nuasmenintas naršyklės klaidas ir apribotus pasirinktinius įvykius.
[Frontend vadove](FRONTEND-OBSERVABILITY.md) aprašyti produkcinių origin apribojimai, privatumo filtrai, įvykiai ir
patikros; jo įgyvendinimas pakeičia seną bendrinį inicializavimo pavyzdį. Tik atmintyje laikomas sesijos ID, kurio
reikalauja kolektorius, neskaičiuoja unikalių vartotojų. Sesijų istorija, atkūrimas ir neapribotas sąveikų rinkimas
išjungti sąmoningai; tai nėra nebaigti darbai.

## 10. Dashboardai ir perspėjimai

Įdiegti dashboardai yra **Rusys Overview**, **Infrastructure**, **Application** ir **Frontend & Usage**. Dešimt
taisyklių apima prieinamumą ir trūkstamas patikras, NAS bei konteinerių atmintį, diską, trūkstamą gateway telemetriją,
API klaidas ir trukmę, MongoDB bei backup būseną. [Dashboardų vadove](DASHBOARDS-AND-ALERTS.md) užfiksuotos 53 priimtos
panelių užklausos, dešimt priimtų perspėjimų išraiškų ir sėkmingas taisyklių vertinimas. Laikinas užklausos, vertinimo
ir pranešimų nukreipimo testas pasiekė `firing`; Grafana užfiksavo sėkmingą el. laiško išsiuntimą **2026-10-26 21:30:21
UTC**, o testinė taisyklė buvo pašalinta. Išsiuntimas neįrodo gavimo pašto dėžutėje ar išorinės patikros sutrikimo ir
atsistatymo testo.

Nauji konteinerių matavimai ir paleidimo logai nėra patikimas signalas, kurią versiją šiuo metu aptarnauja NGINX. Backup
taisyklė dabar aptinka trūkstamą duomenų šaltinio integraciją; ji neįrodo sėkmingų suplanuotų atsarginių kopijų.

## 11. Istorijos saugojimas ir būsima migracija

[Istorijos saugojimo sprendimas](RETENTION.md) preliminariai numato 14 dienų dabartinių incidentų diagnostikai ir
naujausių versijų palyginimams. Ilgesnės istorijos poreikis nepatvirtintas. Peržiūrėti iki **2026-11-09**, arba
anksčiau, jei to reikia ataskaitoms, pajėgumų prognozėms, ilgesniems nei 14 dienų palyginimams ar migracijos resursų
vertinimui. Pasibaigus saugojimo laikotarpiui, istorijos vėliau atkurti nebus galima.

Jei prireiks, nepriklausomoje ilgalaikėje saugykloje saugoti dienos CPU/RAM p95 ir max, užklausų skaičių, API p95,
duomenų bazės dydį ir paveikslėlių saugyklos dydį. Archyvas neįdiegtas. Istorijos vadove aprašyti perkeliami įrašai, UTC
paros, aprėptis ir patikrinimai. AWS / Cloudflare migracija lieka ateities darbu: išlaikyti aplikacijos tapatybę bei
privatumo ribas ir NAS / Docker integracijas pakeisti palaikomomis platformos sąsajomis. Konteinerių metrikos ir Node.js
vykdymo aplinka ne į kiekvieną platformą perkeliamos be pakeitimų.

## 12. Atlikti ir likę darbai

Pažymėti punktai aprašo įgyvendinimą arba užfiksuotus patikrinimus. Nepažymėtiems reikia įgyvendinimo, operatoriaus
patvirtinimo arba priėmimo įrodymų; vien testo aprašymas ar vadovas jų neužbaigia.

### Įgyvendinta ir užfiksuota

- [x] Sukonfigūruoti metrikų remote write ir Alloy; matomos NAS ir veikiančių konteinerių CPU/RAM laiko eilutės.
- [x] Sukonfigūruotos išorinės viešo puslapio ir `/api/health` patikros; matomi sėkmingi matavimai.
- [x] Įgyvendintas `/api/health` su `Cache-Control: no-store`.
- [x] Privatumo filtrais apdoroti Docker logai ir struktūrizuoti aplikacijos įvykiai surenkami į Loki.
- [x] Įgyvendinti apriboti NGINX JSON prieigos logai su užklausų ir upstream laikų laukais.
- [x] Įgyvendintas atskiras MongoDB monitoringo vartotojas ir eksporterio integracija; matomos būklės ir aktyvumo
      metrikos.
- [x] Įgyvendintas backend OpenTelemetry per privatų kolektorių; backend traces matomi.
- [x] Įtraukti validuojami versijos, aplinkos ir diegimo slot'o resursų atributai.
- [x] Įgyvendinti Faro Web Vitals, nuasmenintos klaidos ir apriboti įvykiai; naršyklės telemetrija matoma.
- [x] Įdiegti keturi dashboardai ir dešimt taisyklių; užfiksuotos priimtos užklausos ir sėkmingas taisyklių vertinimas.
- [x] Patikrinta kontaktų integracija ir laikinas užklausos, vertinimo bei nukreipimo kelias; užfiksuotas sėkmingas
      siuntimas ir testinių resursų pašalinimas.
- [x] Įvertintas istorijos saugojimas; dokumentuotas preliminarus 14 dienų sprendimas, peržiūros data ir sąlyginio
      archyvo reikalavimai.

### Prioritetas: funkcionalumo spragos ir operatoriaus patvirtinimai

- [ ] Prijungti atsarginių kopijų planuoklio rezultatus prie `rusys_backup_last_success_timestamp_seconds` ir
      `rusys_backup_last_run_success`. Prieš priimant 26 valandų senumo slenkstį patvirtinti tvarkaraštį; su tikru
      duomenų šaltiniu patikrinti sėkmės, nesėkmės, pasenusio ir trūkstamo signalo atvejus.
- [ ] Pateikti patikimą aktyvaus slot'o ir versijos signalą, susietą su NGINX nukreipimu, ir rodyti jį Overview.
      Patikrinti perjungimą bei rollback, taip pat kai veikia abu slot'ai.
- [ ] Nepriklausomai nuo Grafana siuntimo rezultato patvirtinti pranešimo gavimą; užfiksuoti testo laiką ir rezultatą,
      neįkeliant kontaktinių ar prisijungimo duomenų į Git.
- [ ] Patvirtinti operatoriaus pageidaujamą istoriją ir tikrą paskyros saugojimo laikotarpį bei bandomojo plano pabaigą.
      Rezultatą įrašyti istorijos saugojimo sprendime ir peržiūrėti iki **2026-11-09** arba įvykus ankstesnei sąlygai.
- [ ] Iš naujo pamatuoti disko užimtumą: 2026-10-26 `/volume1` buvo užimtas 94,9 %. Nustatyti, kas naudoja vietą, ir
      suderinti saugų talpos ar saugojimo tvarkos pakeitimą; istorinis matavimas nėra dabartinės būklės rodmuo.

### Dar reikia užfiksuoti priėmimo įrodymus

- [ ] Patikrinti įdiegtą Docker root katalogą, prijungtus hosto katalogus, numatytų veikiančių konteinerių aprėptį ir
      kolektoriaus logus. Užfiksuoti kontroliuojamą Alloy restartą ir parodyti, kad duomenų rinkimas atsistato
      nekeičiant konfigūracijos.
- [ ] Su laikina išorine Synthetic Monitoring patikra išbandyti sutrikimą ir atsistatymą. Patikrinti bandymų vykdymą,
      perspėjimo vertinimą, nukreipimą ir atsistatymą; pašalinti testinius resursus, netrikdant produkcijos.
- [ ] Užfiksuoti autentifikuotus skaitymus, paieškas ir paveikslėlių įkėlimus su naudingais įdėtiniais traces, teisinga
      versijos bei slot'o tapatybe ir be jautraus turinio. Įdiegtos aplinkos privataus imtuvo ribas patikrinti atskirai
      nuo vietinių testų aprašymų.
- [ ] Užfiksuoti įdiegtos aplinkos MongoDB monitoringo teisių ribas ir atsistatymą pasikeitus duomenų bazės ar
      konteinerio adresui; vadovautis duomenų bazės vadovu ir neigiamoms patikroms naudoti laikinus duomenis.
- [ ] Atidaryti visus įdiegtus dashboardus ir patikrinti suprantamumą, valdymą klaviatūra, ekrano skaitytuvo žymas,
      kontrastą bei išdėstymą didinant mastelį. Priimta užklausa neįrodo atvaizdavimo patogumo ar prieinamumo.
- [ ] Peržiūrėti slenksčius po tipinės apkrovos ir naujų versijų; užfiksuoti stebėjimo laikotarpį bei pagrindimą,
      išlaikant mažo srauto apsaugas ir trūkstamos telemetrijos aptikimą.

### Sąlyginis darbas: nepriklausomas archyvas, jei reikia ilgesnės istorijos

- [ ] Patvirtinti 90 dienų arba 12 mėnesių laikotarpį ir atskirai patikrinti duomenų bazės bei paveikslėlių saugyklos
      dydžio šaltinius; bendras disko užimtumas nepakeičia nė vieno iš šių matavimų.
- [ ] Įgyvendinti perkeliamus visų šešių signalų grupių dienos agregatus su nepriklausoma saugykla ir planuokliu už NAS
      ribų, laikantis istorijos vadovo aprėpties, idempotentiškumo ir privatumo reikalavimų.
- [ ] Prieš paskelbiant archyvą veikiančiu, patikrinti įrašymą ir nuskaitymą išorinėje saugykloje, kitą suplanuotą
      dienos vykdymą, pasenusio ar trūkstamo archyvo perspėjimus ir įrašų skaitymą be prieigos prie NAS / Grafana.

## 13. Įgyvendinimo nuorodos

- [Diegimas ir platformų ribos](../DEVELOPMENT-AND-DEPLOYMENT.md)
- [Metrikų ir logų kolektorius](../../docker/monitoring/config.alloy) ir
  [traces kolektorius](../../docker/monitoring/traces.alloy)
- [Dashboardų ir perspėjimų generavimas](../../scripts/grafana-config.ts) ir
  [diegimo CLI](../../scripts/grafana-monitoring.ts)
- [Monitoringo vadovai](MONITORING.md)
