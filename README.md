# Web GUI tester för beställningsstödet

## Installation

Förberedelser
- Klona detta git repo
- Installera Node.js inkl. npm globalt
- Kör följande kommando i bestallningsstod-gui mappen för att installera moduler
`npm install`

## Starta proxy server (SITHS inloggning)

Kopiera mjukt TEST Siths-certifikat (.p12 fil) till 
`cp cert.p12 ./bestallningsstod-gui/proxy/pki/cert.p12`

Starta proxy server
`cd bestallningsstod-gui/proxy`
`PASSWORDVALIDCERT=***** node app.js`

### Möjligheter:
Proxy servern kan utökas med flera typer av certifikat (Se kommentarer och modifera ./proxy/app.js)

## Starta cypress testsvit

Öppna testsviten med användargränsnitt för felsökning och vidareutveckling
`cd ./bestallningsstod-gui`
`npm run cy:open`

Kör testsviten via CLI (genererar junit rapport)
`cd ./bestallningsstod-gui`
`cy:run:junit`

### Möjligheter:
Skapa fler npm script som använder olika rapporter eller testar specifika specifikationer i package.json

## Nattliga körningar av testsvit
Utförs i nationell jenkins
Pipeline är beskriven i ./bestallningsstod-gui/Jenkinsfile

### Möjligheter:
Lägg till integration mot teams, e-post eller slack för notifieringar vid avvikelser


