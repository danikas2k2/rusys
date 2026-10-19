# Rūsio projekto monitoringas

> **Tikslas:** vienoje Grafana Cloud aplinkoje stebėti Rūsio aplikacijos prieinamumą, Synology NAS ir kiekvieno Docker
> konteinerio apkrovą, NGINX užklausas, MongoDB, Next.js backend ir frontend būklę, klaidas bei svarbiausius vartotojų
> veiksmus.
>
> **Dabartinė infrastruktūra:** Synology DS923+ su DSM Container Manager, vienas `rusys` Docker Compose projektas,
> MongoDB, NGINX, Next.js `blue` ir `green` konteineriai.
>
> **Ateities kryptis:** AWS arba Cloudflare; telemetrijos saugykla lieka nepriklausomoje Grafana Cloud paskyroje.

## 0. Pagrindiniai principai

- **Grafana Cloud** saugo ir vaizduoja telemetriją; nereikia NAS paleisti Prometheus, Loki, Tempo ar Grafana serverių.
- **Grafana Alloy** veikia kaip papildomas `monitoring` servisas **esamame** Rūsio Compose projekte. Taigi NAS nereikia
  vykdyti `alloy install` ar diegti `unzip`.
- Monitoringas turi veikti nepriklausomai nuo to, ar tuo metu užklausas aptarnauja `blue`, ar `green`.
- Naudojami OpenTelemetry standartai, kur įmanoma, o metrikos žymimos nuosekliais `service.name`, `service.version`,
  `deployment.environment`, `deployment.slot` atributais.
- **Prieinamumas tikrinamas iš išorės** per Grafana Cloud Synthetic Monitoring; taip bus matomas ir visiškas NAS /
  interneto ryšio sutrikimas.
- Nesaugoti asmens duomenų, autentifikavimo antraščių, slapukų, prisijungimo tokenų ar slaptų URL parametrų loguose ir
  traces.
- Grafana Cloud Free planas neturi 14 dienų naudojimo termino: **14 dienų yra pagrindinės telemetrijos išlaikymo
  laikotarpis**. Kiti apribojimai priklauso nuo duomenų tipo bei plano. Free Synthetic Monitoring turi iki 100 000 API
  patikrinimų per mėnesį (tikrinti paskyros sąlygas).

## 1. Bendras planas

| Etapas | Kur keičiame                             | Komponentai                             | Rezultatas                                                        | Būsena                                                 |
| ------ | ---------------------------------------- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| 1      | Grafana Cloud + esamas `rusys` Compose   | Alloy, cAdvisor, Unix exporter          | Kiekvieno konteinerio ir NAS CPU, RAM, diskai, tinklas            | Servisas įgyvendintas kode; NAS/Grafana dar netikrinta |
| 2      | Grafana Cloud                            | Synthetic Monitoring                    | Viešo puslapio ir `/api/health` prieinamumas, uptime, perspėjimai | Laukia                                                 |
| 3      | Alloy / Docker / Next.js                 | Docker logs, Pino                       | Centralizuoti struktūrizuoti logai                                | Laukia                                                 |
| 4      | NGINX konfigūracija                      | JSON access logs                        | Requestai, statusai, upstream ir atsakymo laikai                  | Laukia                                                 |
| 5      | MongoDB + Alloy                          | Monitoring vartotojas, MongoDB exporter | DB connections, operacijos ir apkrova                             | Laukia                                                 |
| 6      | Next.js serveris + Alloy                 | OpenTelemetry, OTLP                     | API traces, latency, išimtys, custom spans                        | Laukia                                                 |
| 7      | Next.js klientas + Grafana Cloud         | Grafana Faro                            | Web Vitals, naršyklės klaidos, sesijos, custom events             | Laukia                                                 |
| 8      | Grafana Cloud                            | Dashboards, alerts                      | Bendras Overview ir diagnostiniai dashboardai                     | Laukia                                                 |
| 9      | Atskira ilgalaikė saugykla, jei prireiks | Dienos agregatai                        | Mėnesių/metų apkrovų tendencijos                                  | Laukia                                                 |

**Rekomenduojama vykdymo tvarka:** pirma konteinerių CPU/RAM, iš karto po to išorinis uptime, tada logai ir aplikacijos
instrumentavimas. Kiekvieną etapą patikrinti prieš jungiant kitą.

## 2. Grafana Cloud paruošimas

1. Grafana Cloud stack'e pasirinkti **Connections → Hosted Prometheus metrics → Via Grafana Alloy**. Renkamės būtent
   Alloy, **ne** „From my local Prometheus server“.
2. Iš Grafana Cloud pasiimti:
    - **Prometheus remote write URL**;
    - **Metrics username / instance ID**;
    - **Access Policy token** su `metrics:write` teise.
3. Vėliau, įjungiant logus, pasiimti Loki endpoint, logs username ir tokeną su `logs:write`.
4. Vėliau, įjungiant traces, pasiimti Grafana Cloud OTLP endpoint ir tinkamos apimties tokeną.
5. Pradėti nuo minimalios apimties tokenų, jų **necommitinti** į Git.

Grafana puslapyje siūlomų `alloy install` komandų Synology OS nevykdyti. Alloy bus paleistas Docker image.

## 3. Esamo Compose projekto papildymas

### 3.1. Failų struktūra

```text
rusys/
├── .env                         # serverio Docker konfigūracija; ne Git
├── docker/
│   ├── compose.yaml             # esamas, papildytas vienu servisu
│   ├── monitoring/
│   │   └── config.alloy
│   └── nginx.conf.template
└── ...
```

### 3.2. Įgyvendintas `monitoring` servisas

Toliau pateiktas jau įgyvendinto **Compose serviso fragmentas**. Jis yra esamo `services:` bloko dalis; jo nereikia
kopijuoti dar kartą:

```yaml
services:
    # Esami nginx, mongodb, blue, green servisai lieka nepakeisti.

    monitoring:
        image: grafana/alloy:v1.20.1
        container_name: rusys-monitoring
        restart: unless-stopped
        privileged: true
        command:
            - run
            - --server.http.listen-addr=127.0.0.1:12345
            - --storage.path=/var/lib/alloy/data
            - /etc/alloy/config.alloy
        network_mode: host
        environment:
            GC_METRICS_URL: ${GC_METRICS_URL:?Set GC_METRICS_URL in the server .env}
            GC_METRICS_USER: ${GC_METRICS_USER:?Set GC_METRICS_USER in the server .env}
            GC_METRICS_TOKEN: ${GC_METRICS_TOKEN:?Set GC_METRICS_TOKEN in the server .env}
        volumes:
            - monitoring-alloy-data:/var/lib/alloy/data
            - ./monitoring/config.alloy:/etc/alloy/config.alloy:ro
            - /var/run/docker.sock:/var/run/docker.sock:ro
            - /:/rootfs:ro
            - /proc:/host/proc:ro
            - /sys:/sys:ro
            - /var/run:/var/run:ro
            - ${DOCKER_ROOT_DIR:?Set DOCKER_ROOT_DIR to the NAS DockerRootDir in the server .env}:/var/lib/docker:ro
            - /dev/disk:/dev/disk:ro

volumes:
    monitoring-alloy-data:
```

**Svarbu dėl Synology ir saugumo:** cAdvisor gali reikalauti privilegijuoto konteinerio, Docker socket ir hosto
katalogų. Tai plačios teisės; Alloy UI ir OTLP portų neatidaryti į internetą. DSM versija gali turėti kitokį Docker
duomenų katalogą – jį patikrinkite SSH komanda:

```bash
docker info --format '{{.DockerRootDir}}'
```

Jei kelias kitoks, `/var/lib/docker` bind mount'ą reikia pakeisti į tikrą hosto kelią (dešinė konteinerio pusė gali
likti `/var/lib/docker`). DSM specifinės metrikos gali neveikti lygiai kaip įprastame Linux; tikriname atskirai.
Nekeisti DSM sisteminių failų.

Galima pradėti nuo minimalaus Alloy serviso be host mount'ų, kad patikrintumėte startą, ir tada pridėti juos po vieną.
Gamyboje apsvarstyti atskirą monitoring servisą / mažesnes teises, jei saugumo rizika tampa reikšminga.

`.env` pavyzdys (fiktyvios reikšmės):

```dotenv
GC_METRICS_URL=https://prometheus-EXAMPLE.grafana.net/api/prom/push
GC_METRICS_USER=123456
GC_METRICS_TOKEN=replace-me
DOCKER_ROOT_DIR=/actual/path/from/docker-info
```

### 3.3. Alloy konfigūracija: Docker + NAS

`monitoring/config.alloy`:

```alloy
prometheus.exporter.cadvisor "docker" {
  docker_only            = true
  store_container_labels = false
}

prometheus.exporter.unix "nas" {
  rootfs_path = "/rootfs"
  procfs_path = "/host/proc"
  sysfs_path  = "/sys"
}

prometheus.scrape "docker" {
  targets         = prometheus.exporter.cadvisor.docker.targets
  scrape_interval = "15s"
  forward_to      = [prometheus.remote_write.grafana_cloud.receiver]
}

prometheus.scrape "nas" {
  targets         = prometheus.exporter.unix.nas.targets
  scrape_interval = "15s"
  forward_to      = [prometheus.remote_write.grafana_cloud.receiver]
}

prometheus.remote_write "grafana_cloud" {
  external_labels = {
    project     = "rusys",
    environment = "production",
    host        = "synology-ds923",
  }

  endpoint {
    url = sys.env("GC_METRICS_URL")

    basic_auth {
      username = sys.env("GC_METRICS_USER")
      password = sys.env("GC_METRICS_TOKEN")
    }
  }
}
```

> **Pastaba:** `prometheus.exporter.cadvisor` turi konkrečius hosto mount reikalavimus, priklausančius nuo Linux/Docker.
> Synology diegimą būtina patvirtinti realiu testu. Jei Alloy komponentas nepasiekiamas ar rodo klaidą, tikrinti
> aktualią oficialią Alloy versijos dokumentaciją; pirmiau pašalinti neveikiantį bloką, negu spėlioti apie DSM mount'us.

### 3.4. Paleidimas

Synology **Container Manager → Project** atnaujinti esamą Rūsio projektą su nauju Compose turiniu. Arba per SSH:

```bash
cd /volume1/docker/rusys  # pakeisti tikru projekto keliu
docker compose config
docker compose up -d monitoring
docker compose logs -f monitoring
```

**Nenaudoti `docker compose down` visam projektui vien norint atnaujinti monitoringą**, nes taip sustabdytumėte ir
produkcinę aplikaciją.

### 3.5. Validacija Grafana Cloud → Explore → Prometheus

```promql
container_memory_working_set_bytes
```

```promql
rate(container_cpu_usage_seconds_total[5m])
```

```promql
node_memory_MemAvailable_bytes
```

Kai bus aiškūs realūs Docker labeliai (`name`, `container`, `image` ar kiti), pridėti filtrus ir legendas. **Nespėti jų
iš anksto**.

24 val. konteinerio RAM pikas (užfiksuotų reikšmių, ne absoliutus tarp matavimų):

```promql
max_over_time(container_memory_working_set_bytes[24h]) / 1024 / 1024
```

CPU rodiklis `rate(container_cpu_usage_seconds_total[5m])` grąžina branduolių ekvivalentus (`1` ≈ vienas pilnai
apkrautas branduolys), o ne procentus nuo visų NAS branduolių. 15 s scrape praleis labai trumpus šuolius.

**Priėmimo kriterijai:** matomos MongoDB, NGINX, blue, green konteinerių atskiros laiko eilutės, NAS RAM/CPU, veikia 24
h maksimumų užklausos; Alloy restartas nesugadina monitoringo.

## 4. Viešas uptime: Grafana Cloud Synthetic Monitoring

**Šis etapas veikia visiškai be papildomo NAS konteinerio.** Patikrinimai vykdomi iš išorės, todėl jie parodo ir NAS ar
interneto ryšio sutrikimą.

1. Grafana Cloud atverti **Testing & synthetics / Synthetic Monitoring** (meniu pavadinimas gali skirtis pagal UI).
2. Sukurti **HTTP/API Endpoint** check viešam pagrindinio Rūsio puslapio `https://<rusys-domain>/` adresui.
3. Tikrinti `GET`, numatytą **HTTP 200** (ar numatytą redirect/anoniminio puslapio būseną); rinktis bent vieną Europos
   probe.
4. Sukurti antrą patikrinimą `https://<rusys-domain>/api/health`.
5. Pradėti nuo **kas 5 min.** ir vienos probe vietos; įjungti perspėjimą po kelių nesėkmingų bandymų. Dvi patikros kas 5
   min. ≈ 17 280 vykdymų per 30 dienų (jei viena probe kiekvienai).
6. Susikurti kontaktinį tašką (el. paštas ar kita prieinama pranešimų integracija), ištestuoti perspėjimą.
7. Dashboarde rodyti būseną, paskutinį patikrinimą, response time, uptime % ir sutrikimų istoriją.

### Next.js `/api/health`

`app/api/health/route.ts`:

```typescript
export const dynamic = 'force-dynamic';

export async function GET() {
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
```

Tai yra **liveness** patikra: Next.js atsako, bet nebūtinai veikia MongoDB. Jei reikia realaus **readiness**, sukurti
atskirą `/api/ready` endpointą su trumpu MongoDB `ping` timeout (neatskleisti vidinės klaidos detalių viešai). Visų DB
priklausomybių netikrinti kiekvienu `/api/health` kvietimu be reikalo.

Blue/Green niuansas: viešas check tikrina NGINX aktyviai aptarnaujamą versiją. Jei reikia tikrinti abu slotus atskirai,
daryti vidinius readiness check per deploymentą, ne viešinti neaktyvių konteinerių endpointus.

**Priėmimo kriterijus:** išorinė patikra teisingai rodo, kai puslapis pasiekiamas, o pabandžius saugiai imituoti
sutrikimą testinėje aplinkoje pasirodo alertas. Neatlikti sąmoningų produkcinio NAS išjungimų be poreikio.

## 5. Centralizuoti Docker logai

**Kodo pakeitimas (pageidautina):** Node.js pusėje naudoti JSON loggerį (`pino`) į stdout/stderr. Maskuoti secrets ir
asmens duomenis, loguose laikyti `service`, `slot`, `version`.

```bash
npm install pino
```

```typescript
import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: {
        service: 'rusys-web',
        slot: process.env.DEPLOYMENT_SLOT,
        version: process.env.APP_VERSION,
    },
    redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
});
```

**Alloy konfigūracijos papildymas** (pridėti prie jau esančio failo):

```alloy
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

discovery.relabel "logs" {
  targets = discovery.docker.containers.targets

  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    target_label = "project"
    replacement  = "rusys"
  }
}

loki.source.docker "containers" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.logs.output
  forward_to = [loki.write.cloud.receiver]
}

loki.write "cloud" {
  endpoint {
    url = sys.env("GC_LOKI_URL")
    basic_auth {
      username = sys.env("GC_LOKI_USER")
      password = sys.env("GC_LOKI_TOKEN")
    }
  }
}
```

Pridėti `GC_LOKI_URL`, `GC_LOKI_USER`, `GC_LOKI_TOKEN` į Compose `environment` ir `.env`. Tokenui reikia `logs:write`.
**Nekelti aukšto kardinalumo laukų, pvz. vartotojo ID, į Loki labels**; laikyti JSON log body.

Explore → Loki patikra:

```logql
{project="rusys"}
```

**Priėmimo kriterijus:** matomi ir blue, ir green stdout/stderr įrašai, galima filtruoti pagal konteinerį.

## 6. NGINX requestai ir trukmė

Esamo NGINX `http` kontekste pridėti JSON `log_format` (nepublikuoti query string, cookies, Authorization):

```nginx
log_format observability escape=json
  '{'
    '"time":"$time_iso8601",'
    '"method":"$request_method",'
    '"uri":"$uri",'
    '"status":$status,'
    '"request_time":$request_time,'
    '"upstream_time":"$upstream_response_time",'
    '"upstream_addr":"$upstream_addr",'
    '"bytes_sent":$body_bytes_sent'
  '}';

access_log /dev/stdout observability;
error_log /dev/stderr warn;
```

Jei NGINX log formatas įtrauktas kitur, išvengti dubliuoto `access_log`. `nginx -t` ir tik tada reload/recreate.

`$upstream_response_time` gali būti `-` arba kelių laikų eilutė, todėl jos nereikia aklai interpretuoti kaip vieno
skaičiaus.

Pradinis logų kiekio query:

```logql
sum(count_over_time({project="rusys",container="rusys-nginx"}[5m]))
```

Pakeisti `rusys-nginx` tikru konteinerio pavadinimu. Loki 14 dienų istorija tinka diagnostikai; ilgalaikiam request rate
ir p95 geriau eksportuoti agreguotas metrikas.

## 7. MongoDB metrikos

**MongoDB pakeitimas:** sukuriamas tik monitoringui skirtas vartotojas `admin` DB:

```javascript
use admin

db.createUser({
  user: 'grafana_monitor',
  pwd: passwordPrompt(),
  roles: [{ role: 'clusterMonitor', db: 'admin' }],
});
```

Tam turi veikti autentifikavimas. Jei MongoDB nenaudoja autentifikavimo, pirmiau sutvarkyti jos saugumą.
`clusterMonitor` gali nepakakti kai kurioms kolekcijų statistikoms; teises plėsti tik pagal poreikį.

**Alloy konfigūracijos papildymas:**

```alloy
prometheus.exporter.mongodb "rusys" {
  mongodb_uri = sys.env("MONGODB_MONITOR_URI")
}

prometheus.scrape "mongodb" {
  targets         = prometheus.exporter.mongodb.rusys.targets
  scrape_interval = "30s"
  forward_to      = [prometheus.remote_write.cloud.receiver]
}
```

Prieš įtraukiant `MONGODB_MONITOR_URI` į Compose `environment` ir serverio `.env`, suplanuoti privatų ryšį tarp Alloy ir
MongoDB. Dabartinis Alloy servisas naudoja `network_mode: host`, todėl jis **nemato Compose tinklo DNS vardų**;
`mongodb` ar kitas Compose serviso vardas iš jo neveiks. Šiam etapui reikės pakeisti tinklo topologiją arba įrengti
atskirą, tik patikimiems komponentams pasiekiamą ryšį su autentifikuota MongoDB. URI hostą parinkti tik patikrinus tą
ryšį. MongoDB porto nepublikuoti internete, o URI slaptažodžio neįrašyti į Git.

**Priėmimo kriterijus:** Grafana Explore matomos MongoDB exporter metrikos; galima atsekti connections ir operacijų
intensyvumo tendencijas.

## 8. Next.js backend – OpenTelemetry

**Aplikacijos pakeitimai:** oficialus Next.js `instrumentation.ts` hook, OpenTelemetry ir kelios custom span vietos.

Minimalus variantas su oficialiu Next.js siūlomu instrumentavimu:

```bash
npm install @vercel/otel @opentelemetry/api
```

`instrumentation.ts`:

```typescript
import { registerOTel } from '@vercel/otel';

export function register() {
    registerOTel({ serviceName: 'rusys-web' });
}
```

**Svarbi praktinė pastaba:** `@vercel/otel` eksportavimo elgsena ir papildomi paketai priklauso nuo versijos. Patikrinti
pagal įdiegtos Next.js versijos dokumentaciją, kad **OTLP/HTTP** siuntimas į Alloy `4318` tikrai suveiktų; jei ne,
konfigūruoti aiškų OTLP exporterį pagal tos versijos API, o ne manyti, kad env reikšmių užtenka.

Blue/Green konteinerių aplinkoje, įrengus saugų OTLP ryšį, nustatyti:

```dotenv
OTEL_SERVICE_NAME=rusys-web
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,deployment.slot=blue,service.version=YOUR_RELEASE
```

Green naudoja `deployment.slot=green`. Dabartinis Alloy veikia NAS host tinkle, o aplikacijos konteineriai – Compose
bridge tinkle, todėl `http://monitoring:4318` nėra pasiekiamas adresas. Dabartiniame Alloy nėra ir OTLP imtuvo. Prieš
pridedant `OTEL_EXPORTER_OTLP_ENDPOINT` ir `otelcol.receiver.otlp`, reikia atskirai suprojektuoti abiem aplikacijos
slotams pasiekiamą **privatų, autentifikuotą arba tinklo taisyklėmis apribotą** OTLP kelią. Vienas variantas – privatus
bridge tinklas su atskiru OTLP priėmimo servisu; kitas – tik patikimiems šaltiniams pasiekiamas NAS adresas su TLS ir
autentifikavimu. Tai yra vėlesnio etapo tinklo topologijos pakeitimas, ne šios fazės konfigūracijos papildymas. OTLP
imtuvo nejungti prie `0.0.0.0:4318` NAS host tinkle be prieigos kontrolės, nes tai atvertų neautentifikuotą prievadą.

Tik įrengus šį ryšį, nustatyti `OTEL_EXPORTER_OTLP_ENDPOINT` pagal patikrintą privatų adresą ir į Compose `environment`
bei `.env` pridėti `GC_OTLP_ENDPOINT`, `GC_OTLP_USER`, `GC_OTLP_TOKEN` iš Grafana Cloud **OTLP connection** puslapio.
`GC_OTLP_ENDPOINT` yra bazinis URL su `/otlp`, ne `/v1/traces`.

> Jei siekiama rinkti tik traces, galima apriboti pipeline iki traces. Renkant visus tris signalus reikia atitinkamų
> Grafana Cloud rašymo teisių ir kvotų.

Toliau pridėti kelis rankinius spans didesnėms operacijoms (`items.get`, `search`, nuotraukų apdorojimas, DB užklausos).
Nežymėti vartotojo asmens duomenų kaip span atributų.

**Priėmimo kriterijus:** Grafana rodo `rusys-web` spans su blue/green ir konkrečiu release, galima atsekti lėtą HTTP
operaciją.

## 9. Next.js frontend – Grafana Faro

Grafana Cloud sukurti Frontend Observability aplikaciją `rusys-web`, pasiimti **collector URL** ir nustatyti leidžiamus
Rūsio domenus / origins.

```bash
npm install @grafana/faro-web-sdk @grafana/faro-web-tracing
```

`components/FrontendObservability.tsx` (paprastas klientinis inicializavimas):

```tsx
'use client';

import { useEffect } from 'react';
import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export function FrontendObservability() {
    useEffect(() => {
        if (faro.api) return;

        const url = process.env.NEXT_PUBLIC_FARO_URL;
        if (!url) return;

        initializeFaro({
            url,
            app: {
                name: 'rusys-web',
                environment: 'production',
                version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
            },
            instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
        });
    }, []);

    return null;
}
```

Įdėti `<FrontendObservability />` į pagrindinį `app/layout.tsx` (body viduje). Next.js maršrutų sekimą, source maps ir
trace correlation įjungti pagal konkrečios SDK versijos dokumentaciją. `NEXT_PUBLIC_*` reikšmės įprastai įdedamos
**build metu**, todėl Blue/Green jau sukurtam image runtime env keitimas gali neveikti.

**Custom events pavyzdys:**

```typescript
import { faro } from '@grafana/faro-web-sdk';

faro.api?.pushEvent('search_performed', {
    category: 'items',
    resultCount: '12',
});
```

Pirmiausia registruoti `search_performed`, `image_uploaded`, `item_created`, `filter_applied`, `export_started`. **Faro
nėra pilnavertė autocapture / heatmaps / product funnels platforma**, todėl universalaus „kas kur clickino“ vien įjungus
SDK negausi. Jei to prireiks, vertinti PostHog kaip atskirą, specializuotą produktinės analitikos sluoksnį.

Prieš siunčiant browser telemetry įvertinti BDAR, slapukų/sutikimo reikalavimus ir asmens duomenų maskavimą.

**Priėmimo kriterijus:** matomi Web Vitals, JS klaidos ir testinis custom eventas be jautrių duomenų.

## 10. Dashboardai ir perspėjimai

Rekomenduojami dashboardai:

1. **Rūsio Overview:** svetainės Online/Offline, uptime 24 h / 7 d., NAS CPU/RAM, aktyvaus slot'o versija, HTTP klaidų
   dalis, API p95.
2. **Infrastructure:** NAS ir `mongodb`, `nginx`, `blue`, `green` CPU/RAM, pikas, diskas, network, restartai.
3. **Application:** NGINX requestai, atsakymų trukmės, OpenTelemetry spans, errors, MongoDB.
4. **Frontend & Usage:** Core Web Vitals, frontend klaidos, sesijos, pasirinktų veiksmų skaičius.

Pradinių alertų pavyzdžiai (slenksčius koreguoti išmatavus realias apkrovas):

| Alertas                         | Pradinis kriterijus                                                        |
| ------------------------------- | -------------------------------------------------------------------------- |
| Viešas endpointas nepasiekiamas | 2–3 iš eilės nesėkmingi Synthetic Monitoring bandymai                      |
| NAS RAM                         | Available mažiau kaip 15 % 10 min.                                         |
| Docker konteinerio RAM          | Virš 85 % _nustatyto limito_ 5 min. (tik jei limitas apskritai nustatytas) |
| Diskas                          | Užimta daugiau nei 80 %                                                    |
| API 5xx                         | Daugiau nei 2 % per 5 min., tik esant reikšmingam užklausų skaičiui        |
| API p95                         | Ilgiau nei 1 s bent 10 min.                                                |
| MongoDB                         | Exporteris / DB nepasiekiami                                               |
| Backup                          | Nėra suplanuoto sėkmingo backupo arba paskutinis nepavyko                  |

Atskirai testuoti, ar tikrai ateina perspėjimai el. paštu / pasirinktame kanale. **Alloy signalų nebuvimas nėra
pakankamas išorinio uptime įrodymas**, nes gali sugesti pats Alloy ar internetinis siuntimas; tam ir naudojamas
Synthetic Monitoring.

## 11. Istorija ir būsima migracija

- Grafana Cloud Free pagrindinių metrics/logs/traces istorija: **14 dienų**, ne 14 dienų paskyros galiojimas.
- Jei reikės istorinių 3–12 mėnesių resursų pikų, kasdien saugoti suvestines atskiroje išorinėje saugykloje: CPU
  p95/max, RAM p95/max, request count, API p95, DB dydis, atvaizdų saugyklos dydis.
- Perėjimas į **AWS**: išlaikyti aplikacijos OTEL/Faro ir Grafana dashboardus, pakeisti NAS/Docker eksporterius AWS
  atitinkančiomis integracijomis.
- Perėjimas į **Cloudflare**: infrastruktūros telemetrijos rinkimas skirsis nuo Docker/EC2 (Workers CPU laikas,
  requests, platformos logai/traces ir integracijų apribojimai). **Nesitikėti**, kad cAdvisor/OpenTelemetry visur veiks
  identiškai.
- Versiją žymėti realiu release / Git SHA, o `blue`/`green` laikyti tik deployment slotais.

## 12. Užduočių kontrolinis sąrašas

- [ ] Grafana Cloud metrics remote write endpoint ir rašymo tokenas.
- [x] `monitoring` servisas esamame Compose projekte (įgyvendintas kode; NAS/Grafana dar netikrinta).
- [ ] Patikrinti Synology Docker root dir, mount'us, Alloy logus.
- [ ] Grafana mato kiekvieno Docker konteinerio CPU/RAM ir NAS CPU/RAM.
- [ ] Grafana Synthetic HTTP check pagrindiniam viešam URL.
- [ ] Next.js `/api/health` su `Cache-Control: no-store`.
- [ ] Synthetic HTTP check `/api/health`, patikrinti perspėjimus.
- [ ] Docker logai per Alloy → Loki.
- [ ] NGINX JSON access logs (be jautrių duomenų).
- [ ] MongoDB ribotų teisių monitoring vartotojas ir exporter.
- [ ] Next.js backend OpenTelemetry → Alloy OTLP → Grafana Cloud.
- [ ] Blue/Green `service.version` ir `deployment.slot` atributai.
- [ ] Next.js Faro, Web Vitals, JS errors ir pasirinkti custom events.
- [ ] 4 dashboardai ir baziniai alertai.
- [ ] Įvertinti 14 dienų istorijos ribą; prireikus išorinis dienos agregatų archyvas.

## 13. Oficiali dokumentacija

- [Grafana Alloy: Monitor Docker containers](https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/)
- [Alloy cAdvisor](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.cadvisor/)
- [Alloy Unix / node exporter](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.unix/)
- [Alloy Prometheus remote write](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.remote_write/)
- [Alloy Docker logs](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.docker/)
- [Alloy MongoDB exporter](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.mongodb/)
- [Alloy OTLP HTTP exporter](https://grafana.com/docs/alloy/latest/reference/components/otelcol/otelcol.exporter.otlphttp/)
- [Grafana Cloud Synthetic Monitoring](https://grafana.com/products/cloud/synthetic-monitoring/)
- [Synthetic Monitoring HTTP checks](https://grafana.com/docs/grafana-cloud/observe-and-act/testing/synthetic-monitoring/create-checks/checks/http/)
- [Grafana Frontend Observability / Next.js](https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/frontend-observability/get-started/instrument-nextjs/)

---

**Statusas:** 1 etapo `monitoring` servisas įgyvendintas kode; jo veikimas NAS ir metrikų gavimas Grafana Cloud dar
nepatikrinti. Kiti etapai laukia. Prieš produkcinį įjungimą patvirtinti Docker mount'us, Alloy konfigūraciją, tikrus
konteinerių vardus, Grafana Cloud endpointus, sąnaudas ir jautrių duomenų filtravimą.
