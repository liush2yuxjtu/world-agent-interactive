import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {watch} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const production=process.argv.includes('--dist');
const root=production?path.join(project,'dist'):project;
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
const clients=new Set();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method not allowed');}
  if(!production&&url.pathname==='/__dev/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.write(': ready\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;}
  const decoded=decodeURIComponent(url.pathname);
  if(decoded.split('/').some(s=>s.startsWith('.')&&s!=='.'&&s!=='..')){res.writeHead(403);return res.end('Forbidden');}
  let target=path.resolve(root,'.'+decoded);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  let st=await stat(target);
  if(st.isDirectory()){
   if(!url.pathname.endsWith('/')){res.writeHead(302,{Location:url.pathname+'/'+url.search});return res.end();}
   target=path.join(target,'index.html');
  }
  const actual=await realpath(target);if(!actual.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  let bytes=await readFile(actual);
  if(!production&&target.endsWith('.html'))bytes=Buffer.from(bytes.toString().replace('</body>','<script>new EventSource("/__dev/events").onmessage = () => location.reload();</script></body>'));
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(error){res.writeHead(error.code==='ENOENT'?404:400);res.end(error.code==='ENOENT'?'Not found':'Bad request');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,host,()=>console.log(`World Agent Design System → http://${host}:${port}/design-system/`));
if(!production){let debounce;for(const dir of ['src','design-system'])watch(path.join(root,dir),{recursive:true},()=>{clearTimeout(debounce);debounce=setTimeout(()=>{for(const client of clients)client.write('data: reload\n\n');},180);});}
