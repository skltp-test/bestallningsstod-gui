#!/usr/bin/env node
const httpProxy = require('http-proxy');
const fs = require('fs');
const http = require('http');
const morgan = require('morgan')('dev');

proxyBuilder('Proxy-Server - Valid cert', 'cert.p12', 'pass.txt', 25000);
//proxyBuilder('Invalid cert password', 'client-valid.p12', 'bad-password', 25001);
//proxyBuilder('Untrusted cert', 'client-untrusted.p12', 'test', 25002);
//proxyBuilder('Revoked cert', 'client-revoked.p12', 'test', 25003);
//proxyBuilder('Expired cert', 'client-expired.p12', 'test', 25004);
//proxyBuilder('Tampered cert', 'client-tampered.p12', 'test', 25005);

function proxyBuilder(testTitle, certPath, certPass, targetPort) {
  try {

    const proxy = new httpProxy.createProxyServer({
      target: {
        protocol: 'https:',
        host: 'qa.bestallningsstod.tjansteplattform.se',
        port: process.env.SERVER_PORT,
        pfx: fs.readFileSync(`${__dirname}/pki/${certPath}`),
        passphrase: fs.readFileSync(`${__dirname}/pki/${certPass}`)
      },
      secure: false,
      changeOrigin: true,
    });

    const proxyServer = http.createServer((req, res) => {
      console.log(testTitle);
      //morgan(req, res, () => null);
      proxy.web(req, res);
    });
	
    proxyServer.on('upgrade', (req, socket, head) => {
      console.log(testTitle);
      //morgan(req, socket, () => null);
      proxy.ws(req, socket, head);
    });

    proxyServer.listen(targetPort);
	console.log(testTitle);
  } catch (e) {
    console.error(`Problem starting ${testTitle}`);
    console.error(e);
  }

}