import *as http from 'http';
import *as url from 'url'
import *as fs from 'fs'
import *as readline from 'readline'
import { stdin, stdout } from 'process';

let a = 0;

function getClientIP(req: any) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

function closeServer() {
    for (let item of sockets) {
        item.destroy();
    }
    server.close();
    console.log("Server is closed.");
    rl.close();
}

let ip = getIPAdress();

let server = http.createServer((req, res) => {
    let num = ++a;
    console.log(`Get request#${num}: ` + req.url + ' from ' + getClientIP(req));

    if (!req.url) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end();
        console.log(`Response to #${num} :500`);
        return;
    }
    let path = url.parse(req.url).pathname;
    if (path == '/exit') {
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end();
        console.log(`#${num} is a sign to close server`);
        closeServer();
        return;
    }
    if (path == '/') path = '/index.html';
    fs.readFile('.' + path, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end();
            console.log(`Response to #${num} :404`);

        } else {
            let type = path?.substring(path.lastIndexOf('.') + 1);
            switch (type) {
                case 'html':
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    break;
                case 'css':
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                    break;
                case 'js':
                    res.writeHead(200, { 'Content-Type': 'text/javascript' });
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end();
                    console.log(`Response to #${num} :404`);
                    return;
            }
            res.write(data.toString());
            res.end();
            console.log(`Response to #${num} :200 with ${path}`);
        }
    });

});

let sockets: any[] = [];

server.on('connection', (socket) => {
    sockets.push(socket);
    socket.once('close', () => {
        sockets.splice(sockets.indexOf(socket), 1);
    })
})

server.listen(80);
console.log(`Server is listening on ${ip}:80`);

let rl = readline.createInterface(stdin, stdout);
rl.on('line', (input) => {
    if (input.toLowerCase() == 'exit') {
        closeServer();
    }
})
