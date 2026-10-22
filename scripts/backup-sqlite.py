"""Online-consistent SQLite backup. Never copies cookies or credentials to chat."""
import argparse
import sqlite3
from pathlib import Path
from datetime import datetime,timezone

parser=argparse.ArgumentParser()
parser.add_argument('database',type=Path)
parser.add_argument('destination',type=Path)
args=parser.parse_args()
if not args.database.is_file():raise SystemExit('Source database not found')
args.destination.mkdir(parents=True,exist_ok=True)
target=args.destination/('nebula-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.db')
if target.exists():raise SystemExit('Backup already exists; nothing overwritten')
with sqlite3.connect(f'file:{args.database.resolve().as_posix()}?mode=ro',uri=True) as source,sqlite3.connect(target) as dest:
    source.backup(dest)
    assert dest.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
print('Backup created and integrity checked. Keep private: it includes accounts and learning records.')
