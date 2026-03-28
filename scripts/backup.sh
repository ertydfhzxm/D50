#!/bin/bash
# Landing-C Database Backup Script

BACKUP_DIR="/Users/ertydfhzx/Documents/D50/diggers-v1-release/backups"
DB_FILE="/Users/ertydfhzx/Documents/D50/diggers-v1-release/db/landing_c.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/landing_c_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup using sqlite3 .backup or just cp since it's a small file and we want to avoid file lock issues
if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"
else
    cp "$DB_FILE" "$BACKUP_FILE"
fi

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/landing_c_*.db | tail -n +8 | xargs rm -- 2>/dev/null

echo "Backup completed: $BACKUP_FILE"
