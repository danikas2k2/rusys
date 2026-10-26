# Frontend observability

Rusys uses Grafana Faro for optional browser diagnostics. The Grafana Cloud application is `rusys-web` (ID `8029`). This
implements section 9 of the [monitoring roadmap](MONITORING-ROADMAP.lt.md) with a narrower privacy configuration.

## Collection and consent

Collection is off until the user selects **Menu → Share optional diagnostics**. The adjacent disclosure explains the
destination and data categories. The choice is stored under `rusys-observability-consent-v1` in this browser's local
storage. Storage failures leave collection off. Turning the option off pauses Faro and aborts pending transport
requests; other tabs receive the storage change. Requests already received by Grafana cannot be recalled by this
control. Do Not Track and Global Privacy Control override consent. The SDK is loaded only after consent, on the exact
production origin, with a valid collector URL and a production build. Local development and preview origins do not
collect.

The outgoing allowlist reconstructs telemetry rather than editing arbitrary SDK payloads:

| Signal                                  | Retained data                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Web Vitals                              | Finite nonnegative CLS, FCP, FID, INP, LCP and TTFB values when supported by the browser                |
| Browser errors and unhandled rejections | A standard error type and a fixed redacted message                                                      |
| Custom events                           | A fixed event name, timestamp and event-specific static category attributes                             |
| Metadata                                | Fixed application name/environment, build version, SDK name/version and a random memory-only session ID |

The session ID is required by the Cloud collector and changes on each opt-in/reload; it is not an account identifier and
is never stored. No session instrumentation or session history is enabled. Default metadata collectors, console capture,
automatic clicks, page views, resource timings, tracing and replay are excluded. Error messages, causes, stack traces,
DOM selectors, inventory names, search text, counts, account details, URLs, query strings, referrers, browser
identifiers and arbitrary attributes are removed. The only event attributes retained are code-owned enum values listed
in `src/lib/observability/events.ts`; the transport validates them again at runtime. Values, labels, IDs, counts and
error messages are never read from form controls for analytics. The transport omits credentials and sets
`referrerPolicy: no-referrer`. The collector necessarily receives network metadata including the source IP; Grafana
geolocation is disabled.

## Product usage events

The existing content-free events remain: `telemetry_enabled`, debounced `search_performed`, `filter_applied`,
`item_created`, `image_uploaded` and `export_started`. Additional usage categories are:

| Event                                      | Static attributes                        | Meaning                                                                                             |
| ------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `dialog_opened`, `dialog_closed`           | `dialog`                                 | Dialog visibility transitions, including confirmation and error dialogs                             |
| `form_field_changed`                       | `form`, `field`                          | First dirty blur per field per dialog session, plus explicit image/file selection events; no values |
| `form_submitted`, `form_validation_failed` | `form`, optionally `field` on validation | Submission attempt or rejected form validation                                                      |
| `form_result`                              | `form`, `result`                         | Form success or failure                                                                             |
| `checkbox_changed`                         | `control`, `state`                       | Explicit checkbox intent with checked/unchecked state                                               |
| `list_reordered`                           | `list`, `result`                         | Completed group/variant reorder or failure; no item IDs or positions                                |
| `refresh`                                  | `source`, `result`                       | Toolbar or pull-to-refresh start/success/error                                                      |
| `auth`                                     | `action`, `result`                       | Google login/logout start/success/error; no account information or provider errors                  |
| `navigation`                               | `page`                                   | Static application page category; no route IDs, URL or query string                                 |
| `tab_changed`, `view_changed`              | `tab` or `view`                          | Quantity/history tab and detailed/total view choice                                                 |
| `data_action`                              | `entity`, `action`, `result`             | Mutation start/success/error for editing, recycling, importing and other data actions               |

All attribute names and values are bounded by the event-specific schema. Success means the corresponding operation
resolved; it does not imply that a following refresh succeeded. Failed operations retain only the category `error`. The
form field event describes interaction, not completion or validity. Repeated blurs of the same dirty field within a
dialog session are deduplicated. The stored preference key is unchanged; the disclosure now describes broader
interaction categories. The operator remains responsible for the consent/privacy notice scope.

These statistics cover opted-in browsers only, not every visitor or every interaction. They cannot measure unique
people: the random session ID is memory-only, not a user ID. Late opt-in misses earlier interactions, errors and some
navigation measurements. Events already in flight can be lost during navigation, logout or network failure, and browser
privacy signals override the preference. No replay, automatic DOM click capture or input content capture is enabled.

### Usage queries

Import the [product usage dashboard](../../docker/monitoring/frontend-usage-dashboard.json) into Grafana with the
Frontend Observability Loki data source. The application remains `rusys-web` (ID `8029`). Faro custom-event attributes
appear in Loki as `event_data_<attribute>` after `logfmt` parsing. For example, compare events over the selected
dashboard range:

```logql
sum by (event_name) (count_over_time({app_id="8029"} | logfmt | kind="event" [$__range]))
```

Group opened dialogs by their static category:

```logql
sum by (event_data_dialog) (count_over_time({app_id="8029"} | logfmt | event_name="dialog_opened" [$__range]))
```

Inspect validation friction without collecting invalid values:

```logql
sum by (event_data_form, event_data_field) (count_over_time({app_id="8029"} | logfmt | event_name="form_validation_failed" [$__range]))
```

Compare mutation results, filtering by action/entity as needed:

```logql
sum by (event_data_entity, event_data_action, event_data_result) (count_over_time({app_id="8029"} | logfmt | event_name="data_action" [$__range]))
```

This conservative consent implementation does not determine the operator's legal basis. Before rollout the operator must
confirm the privacy notice, Grafana processor agreement and regional processing, retention, access roles and deletion
procedures for the actual deployment. Keep diagnostics optional and review payloads when upgrading Faro.

## Build and deployment

Set `NEXT_PUBLIC_FARO_URL` to the public collector URL shown by the `rusys-web` application in Grafana Cloud. It must be
HTTPS on a `faro-collector-*.grafana.net` host with a `/collect/<key>` path, without credentials, a query or fragment.
This ingestion key is public browser configuration; do not use a Grafana administrative token.

Next.js embeds public variables when building. Docker Compose forwards `NEXT_PUBLIC_FARO_URL` as a build argument.
`APP_VERSION` is also available in the builder; Next.js exposes it as `NEXT_PUBLIC_APP_VERSION`, falling back to the
package version for a local build. Rebuild and deploy the image when the collector or version changes. Changing only
container runtime variables does not update browser configuration. An omitted or invalid collector disables collection.

Cloud allowed origins must remain exactly `https://rusys.andriaus.com`, matching `FARO_ALLOWED_ORIGINS` in
`src/common/faroConfig.ts`. No wildcard, localhost or unrelated preview domains are allowed. A new production domain
requires updating both allowlists. The Content Security Policy permits only the validated collector origin in
`connect-src`; all other directives retain their existing restrictions. CORS is a browser restriction, not collector
authentication: a nonbrowser client can forge an Origin header. Apply Cloud quotas/access controls as appropriate.

## Verify a deployed release

1. Open `https://rusys.andriaus.com` with a fresh browser profile. Confirm no collector requests before consent.
2. Enable optional diagnostics in the menu. Reload to observe a full consented navigation; interact with the page and
   hide the tab so deferred Web Vitals are reported. Inspect collector POST bodies: allowlisted measurements, fixed
   metadata, SDK version and a random session ID only. Confirm the `X-Faro-Session-Id` header matches `meta.session.id`.
3. Search, navigate between pages/tabs, open/close dialogs, change/blur form fields, submit invalid and valid forms,
   mark review checkboxes, reorder groups/variants and refresh. Edit/recycle/import only expendable test data and
   exercise login/logout as appropriate. Confirm the expected event names and bounded category attributes appear in
   Grafana; verify entered values, item identifiers and error messages never appear in collector POST bodies.
4. In the browser console, schedule `setTimeout(() => { throw new TypeError('Faro verification'); }, 0)`. Confirm the
   exception appears with type `TypeError` and the fixed redacted message, without the supplied message.
5. In Grafana Frontend Observability select `rusys-web`; confirm Web Vitals, the exception and `telemetry_enabled` for
   this build. In Explore, the application's Loki records can be checked with `{app_id="8029"}`.
6. Disable diagnostics and confirm further actions produce no requests. Check another tab and reload. Repeat with
   DNT/GPC enabled and on an unrelated origin: collection must remain disabled. Verify Grafana rejects an unrelated
   browser origin and permits only the production origin in its CORS response.

Repository tests validate consent, revocation, privacy filtering and configuration. They cannot establish that a
deployed release is actually delivering measurements; the deployment checks above remain required.

## Source maps and trace correlation

Public production browser source maps remain disabled. Error stack details are currently discarded, so private map
uploads alone would not improve these redacted exceptions. If richer stack diagnostics are approved later, allowlist
only release-owned static chunk filenames and numeric positions, assess the privacy impact, and use Grafana's private
source-map upload flow. Current Grafana Next.js guidance uses bundle ID injection plus the Faro CLI uploader. Generate
maps in a protected build artifact step, upload with a scoped token, match the deployed application version/bundle IDs,
and remove maps from public images. No source-map token belongs in `NEXT_PUBLIC_*` variables. This repository does not
yet implement that upload pipeline or bundle ID injection.

Backend OpenTelemetry remains separate. Frontend tracing is intentionally disabled: no extra tracing dependency,
fetch/XHR instrumentation, trace headers or trace IDs are sent. Future correlation requires an explicit privacy and
security review, same-origin API allowlisting, sanitized span attributes/URLs and propagation aligned with backend
tracing. Do not enable blanket cross-origin trace-header propagation or log request/response bodies.

References: [Grafana Faro SDK](https://github.com/grafana/faro-web-sdk),
[Grafana Frontend Observability](https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/frontend-observability/),
[Next.js instrumentation client](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client),
[Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables).
