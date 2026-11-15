const esbuild = require('esbuild');
const fs = require('node:fs');
const dir = 'static/capability-probe';
fs.mkdirSync(dir+'/dist', {recursive:true});
for(const name of ['index.html','style.css','icon.svg']) fs.copyFileSync(dir+'/'+name,dir+'/dist/'+name);
esbuild.buildSync({entryPoints:[dir+'/app.js'],bundle:true,minify:true,platform:'browser',target:'es2022',outfile:dir+'/dist/app.js',legalComments:'none'});
