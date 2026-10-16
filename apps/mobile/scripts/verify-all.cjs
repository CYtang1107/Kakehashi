// Runs every verification suite in order and writes one summary.
// Domain suites need nothing else. Browser suites need, first:
//   1. EXPO_PUBLIC_API_URL=same-origin EXPO_PUBLIC_EVERCIRCLE_DEVELOPER=1 npx expo export -p web --output-dir dist --clear
//   2. node scripts/preview-design-system.cjs        (disposable fixture host on 127.0.0.1:4399)
//   3. Chrome with --headless=new --remote-debugging-port=9223 and a temporary --user-data-dir
// Usage: node scripts/verify-all.cjs [--domain-only]
const { spawnSync } = require('node:child_process');
const fs = require('node:fs'), path = require('node:path');
const here = __dirname, out = path.resolve(here, '../.impeccable/review');
fs.mkdirSync(out, { recursive: true });

const domain = ['verify-evercircle', 'verify-social', 'verify-home-demo', 'verify-orchestrator'];
const browser = [
  ['verify-stage2', '--interactions-only'], ['verify-stage3', '--interactions-only'], ['verify-stage4', '--interactions-only'],
  ['verify-stage5', '--interactions-only'], ['verify-stage6', '--interactions-only'], ['verify-stage7'], ['verify-stage8'],
];
const suites = [...domain.map(s => [s]), ...(process.argv.includes('--domain-only') ? [] : browser)];

// The browser suites share one Chrome profile; clear the fixture origin's storage so each starts clean
// (Stage 5 ends with matching enabled, which would turn Stage 7's expected denial into an allowed match).
async function clearBrowserStorage() {
  const target = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const cmd = (method, params = {}) => new Promise(resolve => {
    const mine = ++id;
    ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id === mine) resolve(m); });
    ws.send(JSON.stringify({ id: mine, method, params }));
  });
  await cmd('Page.navigate', { url: 'http://127.0.0.1:4399/' });
  await new Promise(r => setTimeout(r, 1500));
  await cmd('Runtime.evaluate', { expression: 'localStorage.clear(); sessionStorage.clear(); true' });
  ws.close(); await fetch('http://127.0.0.1:9223/json/close/' + target.id);
}

async function main() {
const summary = [];
for (const [name, ...args] of suites) {
  if (name.startsWith('verify-stage')) await clearBrowserStorage();
  const started = Date.now();
  const run = spawnSync(process.execPath, [path.join(here, name + '.cjs'), ...args], { encoding: 'utf8', timeout: 15 * 60 * 1000 });
  const output = (run.stdout || '') + (run.stderr || '');
  const passed = run.status === 0;
  summary.push({ suite: name, args, passed, exit: run.status, seconds: Math.round((Date.now() - started) / 1000), checks: (output.match(/^ok /gm) || []).length, tail: output.trim().split('\n').slice(-3) });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name} ${args.join(' ')} (${summary.at(-1).checks} ok lines, ${summary.at(-1).seconds}s)`);
}
fs.writeFileSync(path.join(out, 'verify-all.json'), JSON.stringify({ at: new Date().toISOString(), summary }, null, 2));
const failed = summary.filter(s => !s.passed);
console.log(`${summary.length - failed.length}/${summary.length} suites passed${failed.length ? '; failed: ' + failed.map(s => s.suite).join(', ') : ''}`);
process.exitCode = failed.length ? 1 : 0;
}
main().catch(e => { console.error(e); process.exit(1); });
