const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../outputs/Bellhaven-CRM-Review.html');
http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(file))}).listen(8766,'127.0.0.1',()=>console.log('Review dashboard: http://127.0.0.1:8766'));

