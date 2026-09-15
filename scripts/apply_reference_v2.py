"""Apply the reviewed source patch atomically after checking before/after hashes."""
from pathlib import Path
import hashlib, json
ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {'index.html', 'app/index.html', 'app/src/app.mjs', 'scripts/build.mjs'}
payload = json.loads((ROOT/'scripts/reference_patch.json').read_text())
assert set(payload) == ALLOWED, 'Unexpected migration paths'
updates=[]
for name, entry in payload.items():
    dest=ROOT/name
    text=dest.read_text()
    current=hashlib.sha256(text.encode()).hexdigest()
    if current==entry['after']: continue
    assert current==entry['before'], f'{name}: source changed; manual review needed'
    for start,end,replacement in reversed(entry['changes']):
        assert 0 <= start <= end <= len(text)
        text=text[:start]+replacement+text[end:]
    assert hashlib.sha256(text.encode()).hexdigest()==entry['after'], f'{name}: checksum mismatch'
    updates.append((dest,text))
for dest,text in updates: dest.write_text(text)
print(f'Applied {len(updates)} verified source updates')
