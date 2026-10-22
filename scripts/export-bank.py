"""Export public development fixtures for audit/import testing; never exports users."""
from pathlib import Path
import json
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'/'api'))
from app.seed import fixture_questions
target=Path(__file__).resolve().parents[1]/'question_bank'/'seeds'/'development-v1.json'
if target.exists():raise SystemExit('Refusing to overwrite an existing bank export')
target.write_text(json.dumps({'provenance':'development fixtures, not independent AI review','questions':list(fixture_questions())},indent=2,ensure_ascii=False),encoding='utf-8')
print('Exported 72 development question fixtures.')
