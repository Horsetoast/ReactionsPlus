module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  jwt: {
    secret: process.env.JWT_SECRET
  },
  fb: {
    appSecret: process.env.FB_APP_SECRET,
    appId: process.env.FB_APP_ID,
    graphHost: process.env.FB_GRAPH_HOST,
    codePath: process.env.FB_CODE_PATH,
    profilePath: process.env.FB_PROFILE_PATH,
    facebookLoginUrl: process.env.FB_LOGIN_URL,
    successUrl: process.env.FB_SUCCESS_URL
  }
};
