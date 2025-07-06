# Database Backup Instructions

## External PostgreSQL Database
This project uses an external PostgreSQL database. To create a backup:

1. **Full database dump:**
   ```bash
   pg_dump -h localhost -U username -d ticketing_system > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Compressed backup:**
   ```bash
   pg_dump -h localhost -U username -d ticketing_system | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
   ```

3. **Custom format (recommended):**
   ```bash
   pg_dump -h localhost -U username -d ticketing_system -Fc > backup_$(date +%Y%m%d_%H%M%S).dump
   ```

## Restore Instructions
```bash
# From SQL file
psql -h localhost -U username -d ticketing_system < backup_file.sql

# From custom format
pg_restore -h localhost -U username -d ticketing_system backup_file.dump
```

