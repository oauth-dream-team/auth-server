'use strict';

// 3rd Party Resources
const superagent = require('superagent');
const express = require('express');
const app = express();

app.use(express.static('./public'));
app.use(express.json());

// Should be in the ENV
let port = 3000;
const githubTokenServerUrl = 'https://github.com/login/oauth/access_token';
const githubAPI = 'https://api.github.com/user';
const GITHUB_CLIENT_ID = '60f5bfe00cd3af9fc8c7';
const GITHUB_CLIENT_SECRET = 'a28d864b353bdfb752e18b685ef873fd39e3cea9';
const API_SERVER = 'http://localhost:3000/oauth';

// Routes
app.get('/oauth', authorize);

function authorize (req,res) {

  let code = req.query.code;
  console.log('(1) CODE:', code);

  return superagent.post(githubTokenServerUrl)
    .send({
      code: code,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: API_SERVER,
      grant_type: 'authorization_code',
    })
    .then(response => {
      let access_token = response.body.access_token;
      console.log('(2) ACCESS TOKEN:', access_token);
      return access_token;
    })
    .then(token => {
      return superagent.get(githubAPI)
        .set('Authorization', `Bearer ${token}`)
        .then(response => {
          let user = response.body;
          console.log(`USER: ${user}`)
          res.status(200).json(user);
        })
        .catch(error => {console.error('ack', error); })
    })
    .catch(error => error);
}

app.listen( port, () => console.log(`Server up on ${port}`) );