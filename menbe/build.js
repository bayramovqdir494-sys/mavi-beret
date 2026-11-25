const fs=require('fs'),path=require('path');
const src=__dirname;
const files=fs.readdirSync(src).filter(f=>/^\d\d[a-z]?_.*\.js$/.test(f)).sort();
let js=files.map(f=>'// ---- '+f+' ----\n'+fs.readFileSync(path.join(src,f),'utf8')).join('\n');
const html=fs.readFileSync(path.join(src,'index.html'),'utf8').replace('/*__JS__*/',()=>js);
fs.mkdirSync(path.join(__dirname,'..'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'..','index.html'),html);
console.log('built',files.length,'files ->',(html.length/1024).toFixed(1)+' KB');
