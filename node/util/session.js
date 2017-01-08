const railsSessionDecoder = require('rails-session-decoder');

function decodeCookieAsync(secret, cookie) {
  return new Promise((resolve, reject) => {
    const decoder = railsSessionDecoder(secret);
    decoder.decodeCookie(cookie, (err, sessionData) => {
      if (err) {
        return reject(err);
      }

      resolve(sessionData);
    });
  });
}

async function sessionDecoder(cookies) {
  const {SECRET_KEY_BASE, SESSION_NAME} = process.env;
  const sessionData = await decodeCookieAsync(SECRET_KEY_BASE, cookies[SESSION_NAME]);
  return JSON.parse(sessionData);
}

module.exports = {
  sessionDecoder,
};
