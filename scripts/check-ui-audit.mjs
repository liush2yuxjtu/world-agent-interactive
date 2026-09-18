import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const report=JSON.parse(readFileSync('docs/ui-audit/audit.json','utf8'));
const failures=report.intent.filter(item=>item.status!=='PASS');
const runtime=JSON.parse(readFileSync('docs/ui-audit/runtime/results.json','utf8'));
for(const [file,sha] of Object.entries(runtime.artifactHashes)){if(createHash('sha256').update(readFileSync(file)).digest('hex')!==sha){console.error('FAIL: stale browser evidence for '+file);process.exit(1);}}
const complete=runtime.checks.at(-1)?.name==='No external writes, email sends, or data mutation requests';
if(!complete||runtime.failed||runtime.pageErrors.length||runtime.consoleErrors.length){console.error('FAIL: browser audit incomplete or failed');process.exit(1);}
if(report.developer.status!=='PASS'||failures.length){
 console.error('NOT ALL PASS');for(const item of failures)console.error(`${item.id}: ${item.reason}`);process.exit(1);
}
console.log('ALL PASS: runtime and both audit gates');
