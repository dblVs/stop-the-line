import { Firestore } from '@google-cloud/firestore';
import { Container } from 'inversify';
import { IncidentRepo, IncidentRepoToken } from './repos/incident.repo';
import { LineRepo, LineRepoToken } from './repos/line.repo';
import { TokenRepo, TokenRepoToken } from './repos/token.repo';
import { LineService, LineServiceToken } from './services/line/line.service';
import { SlackService, SlackServiceToken } from './services/slack/slack.service';
import { DBToken } from './tokens/db.token';

export async function CoreModuleInjector(container: Container): Promise<void> {
  container.bind(LineServiceToken).to(LineService);
  container.bind(IncidentRepoToken).to(IncidentRepo);
  container.bind(LineRepoToken).to(LineRepo);
  container.bind(DBToken).toConstantValue(new Firestore());
  container.bind(TokenRepoToken).to(TokenRepo);
  container.bind(SlackServiceToken).to(SlackService);
}
