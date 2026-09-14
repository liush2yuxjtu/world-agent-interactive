"""In-memory preview fixture for restricted browsers; never shipped as an app artifact.
Only the transport is substituted: CSS is loaded from project files; ES modules are
combined with their imports removed; fetch(tokens.css) is fulfilled by this fixture.
Run browser.py against a real HTTP origin for integration/reload/download tests.
"""
from pathlib import Path
import re, json
ROOT=Path(__file__).resolve().parents[1]
def fixture():
    css='\n'.join((ROOT/p).read_text() for p in ['src/tokens.css','src/components.css','design-system/src/explorer.css'])
    parts=[]
    for name in ['src/icons.mjs','src/components.mjs','design-system/src/tokens.mjs','design-system/src/store.mjs','design-system/src/views.mjs','design-system/src/app.mjs']:
        text=(ROOT/name).read_text()
        text=re.sub(r'^import [^\n]+;\n','',text,flags=re.M)
        text=re.sub(r'^export \{[^\n]+\};\n','',text,flags=re.M)
        text=re.sub(r'\bexport (?=(?:const|function|async|class)\b)','',text)
        text=text.replace("const url=new URL('../../src/tokens.css',import.meta.url);","const url=new URL('https://fixture.example/src/tokens.css');")
        if name.endswith('/store.mjs'):
            text=text.replace("const response=await fetch(url,{cache:'no-store'});",'const response=new Response('+json.dumps((ROOT/'src/tokens.css').read_text())+');')
        if name.endswith('/views.mjs'):text='const e=escapeHTML;\n'+text
        parts.append(text)
    html=(ROOT/'design-system/index.html').read_text()
    html=re.sub(r'<link[^>]*>','',html)
    html=html.replace('</head>','<style>'+css+'</style></head>')
    html=html.replace('<script type="module" src="./src/app.mjs"></script>','<script type="module">'+'\n'.join(parts).replace('</script','<\\/script')+'</script>')
    return html
