module.exports = {
  db: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reactions_plus'
  },
  jwt: {
    secret: 'your_jwt_secret'
  },
  fb: {
    appSecret: 'XXX',
    appId: 'XXX',
    graphHost: 'graph.facebook.com',
    codePath: '/v2.8/oauth/access_token?',
    profilePath: '/me?fields=id&access_token=',
    facebookLoginUrl: 'http://localhost:3000/facebook-login',
    successUrl: 'http://localhost:3000/login-success?token='
  }
};
