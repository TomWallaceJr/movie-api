require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const movies = require('./movielibrary');
const app = express();


const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;

  const authToken = req.get('Authorizon');
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});



app.get('/movie', function getMovies(req, res) {
  let reply = movies;
  if (req.query.genre) {
    reply = reply.filter(film =>
      film.genre.toLowerCase()
        .includes(req.query.genre.toLowerCase())
    );
  }

  if (req.query.country) {
    reply = reply.filter(film =>
      film.country.toLowerCase()
        .includes(req.query.country.toLowerCase())
    );
  }
  if (req.query.avg_vote) {
    reply = reply.filter(film =>
      Number(film.avg_vote) >= Number(req.query.avg_vote)
    );
  }
  res.json(reply);
});

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
})
