import { Firestore } from '@google-cloud/firestore';
import { Container } from 'inversify';
import { IncidentRepo, IncidentRepoToken } from './repos/incident.repo';
import { LineRepo, LineRepoToken } from './repos/line.repo';
import { LineService, LineServiceToken } from './services/line/line.service';
import { DBToken } from './tokens/db.token';

export function CoreModuleInjector(container: Container): void {
  container.bind(LineServiceToken).to(LineService);
  container.bind(IncidentRepoToken).to(IncidentRepo);
  container.bind(LineRepoToken).to(LineRepo);
  container.bind(DBToken).toConstantValue(new Firestore());
}
