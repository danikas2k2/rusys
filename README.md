# RUSYS

RUSYS manages stock, product categories, variants, reviews, and change history. It uses Next.js, React, Mantine,
TanStack Query, and MongoDB.

```sh
pnpm install
pnpm dev
```

Set `DB` and `PORT=3021` in `.env.local`. See [local setup](docs/DEVELOPMENT-AND-DEPLOYMENT.md#local-development).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Data model and workflows](docs/DATA-AND-WORKFLOWS.md)
- [Development, CI, and deployment](docs/DEVELOPMENT-AND-DEPLOYMENT.md)
- [Backups and recovery](docs/BACKUP.md)
- [Monitoring](docs/monitoring/MONITORING.md)
- [Testing](src/tests/SPECS.md) and [accessibility](ACCESSIBILITY.md)
- [Table components](src/components/table/TABLE.md) and [service worker](src/components/app/ServiceWorker/README.md)
