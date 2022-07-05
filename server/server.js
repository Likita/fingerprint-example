const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const axios = require('axios').default;

process.env.TZ = 'Europe/Amsterdam';

const db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.log('Create database firstly. ' + err);
    exit(1);
  }
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/auth', cors(), function (request, res, next) {
  let currentTimestamp = new Date();
  let monitorTime = new Date(currentTimestamp);
  monitorTime.setMinutes(currentTimestamp.getMinutes() - 5);

  currentTimestamp = currentTimestamp.toISOString();
  monitorTime = monitorTime.toISOString();
  const username = request.body.user;
  const password = request.body.password;
  const visitorId = request.body.visitorId;

  // Check that user with this credentials are not blocked already
  // - totally blocked
  // - temporaly blocked for last 5 minutes
  db.all(
    `SELECT * FROM lockouts WHERE username='${username}'
    AND (totally_blocked=true OR (timestamp >= '${monitorTime}'))`,
    (err, rows) => {
      if (err) console.log(err);
      if (rows && rows.length) {
        // User was already blocked. So, we don't go further.
        res.json({
          status: false,
          user: rows[rows.length - 1].username,
          ip: rows[rows.length - 1].ip,
          visitorId: rows[rows.length - 1].visitor_id,
          totallyBlocked: rows[rows.length - 1].totally_blocked,
          expires: new Date(rows[rows.length - 1].timestamp).getTime() + 30000,
        });
      } else {
        // Check that visitorId is real. It means we should see at least 1 element in [visits] array with current session
        axios
          .get(
            `https://eu.api.fpjs.io/visitors/${visitorId}?api_key=lCStvGG3XEvVeCePCg4C`
          )
          .then((response) => {
            if (response.data && response.data.visits && response.data.visits.length) {
              // If we have visits it means that visitorId exists. But we need to check that that visitorIds do not change each time.

              // We can use IP addresses from response to block hackers by IP
              const currentIp = response.data.visits[0].ip;

              // Save this attempt to login
              db.run(
                `INSERT INTO event_log (username, ip, visitor_id, timestamp)
                VALUES ('${username}', '${currentIp}', '${visitorId}', '${currentTimestamp}')`,
                (error) => {
                  error ? console.log(error) : console.log('Event saved');
                }
              );

              // Check: do we have a user with such credentials
              db.all(
                `SELECT * FROM users WHERE username='${username}' AND pass='${password}'`,
                (err, rows) => {
                  if (err) console.log(err);

                  if (rows && rows.length) {
                    // User loged in!
                    const userName = rows[rows.length - 1].display_name;
                    console.log(userName + ' logged in!');
                    res.json({ status: true, user: userName });
                  } else {
                    // Let's check how many attempts this user tried to login for the last 5 minutes.
                    // POSSIBLE IMPROVEMENT: In real life here we need to check attempts to login not only by username but by IP ot visitorId as well.
                    db.all(
                      `SELECT * FROM event_log WHERE username='${username}' AND (timestamp >= '${monitorTime}')`,
                      (err, rows) => {
                        if (err) console.log(err);
                        if (rows && rows.length >= 5) {

                          rows.forEach(function (row) {
                            // Here we can check if user send different visitorId for each attempt.
                            // It means that he used different browser or devices.
                            // Then we can block user FOREVER =)
                            // Also, we can check IP and block the machine by IP.
                            // console.log(row.visitor_id);
                          });

                          // In case of 5 unsuccessful attempts for last 5 minutes we block user for next 5 minutes
                          db.run(
                            `INSERT INTO lockouts (username, ip, visitor_id, totally_blocked, timestamp)
                            VALUES('${username}', '${currentIp}', '${visitorId}', false, '${currentTimestamp}');`,
                            (err) => {
                              err ? console.log(err) : console.log(`User ${username} is blocked for 5 minutes.`);
                            }
                          );

                          res.json({
                            status: false,
                            user: username,
                            ip: currentIp,
                            visitorId: visitorId,
                            blocked: 0,
                            expires:
                              new Date(currentTimestamp).getTime() + 30000,
                          });
                        } else {
                          res.json({
                            status: true,
                            user: username,
                            error:
                              'There is no user with such combination of username and password. You have maximun 5 attempts to login. Then you account will be blocked for 5 minutes.',
                          });
                        }
                      }
                    );
                  }
                }
              );
            } else {
              // In this case it means that there is no session for such visitorId for the last 10 days.
              // So, visitorId was changed on purpose. We should block this user totally. But we don't know visitor IP in this case.
              // That's why in this case we will block current login for 5 minutes.

              db.run(
                `INSERT INTO lockouts (username, ip, visitor_id, totally_blocked, timestamp)
                VALUES('${username}', 'unknown', '${visitorId}', false, '${currentTimestamp}');`,
                (err) => {
                  err
                    ? console.log(err)
                    : console.log(`User ${username} is blocked for 5 minutes.`);

                  res.json({
                    status: false,
                    user: username,
                    ip: 'unknown',
                    visitorId: visitorId,
                    totallyBlocked: 0,
                    expires: new Date(currentTimestamp).getTime() + 30000,
                  });
                }
              );

              // It's better to send the email to the user with such login, that his account is blocked.
            }
          })
          .catch((error) => {
            res.json({
              status: false,
              data: error.message,
            });
          });
      }
    }
  );
});

app.listen(8050, () => {
  console.log('CORS-enabled web server listening on PORT 8050');
});
