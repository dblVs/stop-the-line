import * as bodyParser from 'body-parser';
import { Application, Express } from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { CoreModuleInjector } from './core/injector';
import './core/main';

const PORT: number = Number(process.env.PORT) || 8080;

const container: Container = new Container();

CoreModuleInjector(container);

const server: InversifyExpressServer = new InversifyExpressServer(container);
server.setConfig((applicationReference: Express) => {
  applicationReference.use(bodyParser.urlencoded({
    extended: true
  }));
  applicationReference.use(bodyParser.json());
});

const app: Application = server.build();

app.listen(PORT, (): void => {
  console.log(`App listening on port: ${ PORT }`);
});
