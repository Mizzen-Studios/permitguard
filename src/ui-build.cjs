const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let revision='unknown';try{revision=execFileSync('git',['rev-parse','--short=12','HEAD'],{encoding:'utf8'}).trim();}catch{}
const buildLabel=revision+(execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim()?'-worktree':'');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'static/permit-app');
fs.mkdirSync(path.join(dir, 'dist'), { recursive: true });
// Label the data-free HTML shell before bridge evaluation; buildLabel is git-derived.
fs.writeFileSync(path.join(dir,'dist/index.html'),fs.readFileSync(path.join(dir,'index.html'),'utf8').replace('__PERMITGUARD_HTML_BUILD__',buildLabel));
fs.copyFileSync(path.join(dir,'styles.css'),path.join(dir,'dist/styles.css'));
esbuild.buildSync({ entryPoints: [path.join(dir, 'app.js')], bundle: true, define: { __PERMITGUARD_BUILD__: JSON.stringify(buildLabel) }, minify: true, platform: 'browser', target: 'es2022', outfile: path.join(dir, 'dist/app.js'), legalComments: 'none' });
console.log('Built connected PermitGuard UI: static/permit-app/dist');
