const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = { '/':'index.html', '/index.html':'index.html', '/game.js':'game.js', '/game.css':'game.css', '/battle.js':'battle.js', '/tactics.js':'tactics.js' };
http.createServer((req,res) => {
  const file = files[req.url.split('?')[0]];
  if(!file) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(fs.readFileSync(path.join(__dirname,file)));
}).listen(4173,'127.0.0.1',()=>console.log('Game ready at http://127.0.0.1:4173'));
