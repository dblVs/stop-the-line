const PORT = Number(process.env.PORT) || 8080;
import * as express from 'express';

const app = express();

app.get('/stoptheline', (req, res) => {
  console.log('stopped the line');
  res.send('line stopped');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${ PORT }`);
});
