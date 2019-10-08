const PORT: number = Number(process.env.PORT) || 8080;

import 'reflect-metadata';
import './core/controllers/line.controller';

import { Firestore } from '@google-cloud/firestore';
import * as bodyParser from 'body-parser';
import { Application, Express } from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { LineService, LineServiceToken } from './core/services/line/line.service';
import { DBToken } from './core/tokens/db.token';

// set up container
const container: Container = new Container();

// set up bindings
container.bind<LineService>(LineServiceToken).to(LineService);
container.bind<Firestore>(DBToken).toConstantValue(new Firestore());

// create server
const server: InversifyExpressServer = new InversifyExpressServer(container);
server.setConfig((applicationReference: Express) => {
  // add body parser
  applicationReference.use(bodyParser.urlencoded({
    extended: true
  }));
  applicationReference.use(bodyParser.json());
});

const app: Application = server.build();

app.listen(PORT, (): void => {
  console.log(`App listening on port: ${ PORT }`);
});
