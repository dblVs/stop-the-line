const PORT = Number(process.env.PORT) || 8080;
import * as bodyParser from 'body-parser';
import * as express from 'express';

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post('/stoptheline', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');

  res.end(`User ${req.body.user_name} stopped the line`);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${ PORT }`);
});
