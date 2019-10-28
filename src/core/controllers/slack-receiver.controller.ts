import { DocumentSnapshot, Firestore } from '@google-cloud/firestore';
import { WebClient } from '@slack/web-api';
import { Request } from 'express';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpPost, interfaces, request } from 'inversify-express-utils';
import { LineIncidentInterface } from '../services/line/intefaces/line-incident.interface';
import { LineService, LineServiceToken } from '../services/line/line.service';
import { DBToken } from '../tokens/db.token';

@controller('/slack')
export class SlackReceiverController extends BaseHttpController {
  private _slackWebClient: Promise<WebClient>;

  constructor(
    @inject(LineServiceToken) private _lineService: LineService,
    @inject(DBToken) db: Firestore
  ) {
    super();

    this._slackWebClient = db.doc('auth/slack').get().then((doc: DocumentSnapshot) => {
      return new WebClient(doc.data().token);
    });
  }

  @httpPost('/stop')
  public async stop(
    @request() { body}: Request
  ): Promise<interfaces.IHttpActionResult> {
    const [incident, webClient]: [LineIncidentInterface | string, WebClient] = await Promise.all([
        this._lineService.reportIncident(body.team_id, body.channel_id, body.user_id, body.text).catch((err: Error) => err.message),
        this._slackWebClient
      ]);

    let botMessage: string;

    if (typeof incident === 'string') {
      botMessage = incident;
    } else if (incident.stop) {
      botMessage = 'Line has been stopped by bob';
    } else {
      botMessage = 'Someone is experiencing issues with the line. Please be cautious!';
    }

    await Promise.all([
      webClient.chat.postMessage({
        channel: body.channel_id,
        text: botMessage
      })
    ]);

    return null;
  }

  @httpPost('/resolve')
  public async resolve(
    @request() { body }: Request
  ): Promise<interfaces.IHttpActionResult> {
    const [incident, webClient]: [LineIncidentInterface | string, WebClient] = await Promise.all([
      this._lineService.resolveIncident(body.team_id, body.channel_id, body.user_id, body.text).catch((err: Error) => err.message),
      this._slackWebClient
    ]);

    let botMessage: string;

    if (typeof incident === 'string') {
      botMessage = incident;
    } else {
      botMessage = 'Line has been resolved';
    }

    await Promise.all([
      webClient.chat.postMessage({
        channel: body.channel_id,
        text: botMessage
      })
    ]);

    return null;
  }

  @httpPost('/assignExperts')
  public async assign(
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {

    return null;
  }

  @httpPost('/status')
  public async status(
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {

    return null;
  }

  @httpPost('/receiver')
  public async eventReceiver(
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {

    return null;
  }
}
