"""Run existing browser suites against one isolated, real HTTP origin.
Never attach to an unrelated process that happens to own the default dev port.
"""
import os,socket,subprocess,sys,time,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
server=None
base=os.environ.get('BASE_URL','').removesuffix('/design-system/').rstrip('/')
try:
 if not base:
  with socket.socket() as sock:
   sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
  server=subprocess.Popen(['node','scripts/dev.mjs'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
  base=f'http://127.0.0.1:{port}'
  for _ in range(60):
   if server.poll() is not None:raise RuntimeError('isolated HTTP server failed')
   try:urllib.request.urlopen(base+'/design-system/');break
   except Exception:time.sleep(.1)
  else:raise RuntimeError('isolated HTTP server not ready')
 for name in ['browser.py','eve_chat_browser.py','product_demo_browser.py']:
  url=base if name=='product_demo_browser.py' else base+'/design-system/'
  subprocess.run([sys.executable,str(ROOT/'tests'/name)],cwd=ROOT,env={**os.environ,'BASE_URL':url,'OFFLINE_FIXTURE':'0'},check=True)
finally:
 if server:server.terminate();server.wait(timeout=10)
