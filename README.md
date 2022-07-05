# Getting Started with Fingerprint task

This example demostrates defence from Multiple login attemts using Fingerprint library.

First of all we need to create a database and start the server to test the solution. For this run:
```sh
cd server
npm i
npm run database
npm start
```

In other terminal tab let's start the front server:
```sh
cd fingerprint-task
npm i
npm start
```

Open [http://localhost:3000](http://localhost:3000)

Try to click Submit with any credentials.
After 5 times, you will be locked for 5 minutes.

If you try to change visitorId, you will be locked FOREVER. =)

If you want to check successful login, then just use this:
login: admin
password: fingerprint

Login: 'hacker' is totally blocked in database.
Login: 'silly' is blocked for first 5 minutes database.

For more information check:
[Documentation for the JavaScript agent](https://dev.fingerprintjs.com/docs/quick-start-guide#js-agent)
[Documentation for the Server API](https://dev.fingerprintjs.com/docs/server-api)
