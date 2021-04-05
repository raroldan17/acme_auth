const express = require('express');
const app = express();
app.use(express.json());
const {
  models: { User, Note },
} = require('./db');
const path = require('path');

async function requireToken(req, res, next) {
  try{
    const auth = await User.byToken(req.headers.authorization);
    req.user = auth;
    next();
  } catch(e) {
    next(e);
  }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/notes", requireToken, async (req, res, next) => {
  try{
    const auth = req.user;

    if (req.params.id == auth.id) {
      const user = await User.findByPk(auth.id, { include: Note })
    res.send(user.notes)
    }
    else {
      res.sendStatus(404)
    }
  } catch(e){
    next(e)
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
