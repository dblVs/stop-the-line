import Axios from 'axios';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpPost, interfaces, request, response } from 'inversify-express-utils';
import { AuthenticationMiddleware } from '../middleware/slack/authentication.middleware';
import { SlackService, SlackServiceToken } from '../services/slack/slack.service';

@controller('/slack', AuthenticationMiddleware)
export class SlackReceiverController extends BaseHttpController {
  constructor(
    @inject(SlackServiceToken) private _slackService: SlackService
  ) {
    super();
  }

  @httpPost('/stop')
  public stop(
    @request() { body }: Request,
    @response() resp: Response
  ): void {
    if (body.text) {
      resp.status(200).send('Alright, request received');

      this._slackService.stop(body.team_id, body.channel_id, body.user_id, body.text).then(() => {
        return this._removeMessage(body.response_url);
      }, (error: Error) => {
        return this._showErrorMessage(body.response_url, error);
      });
    } else {
      resp.status(200)
      .send('Oh noes! Reason for stopping the line is missing! Please let us know why you want to stop the line!');
    }
  }

  @httpPost('/resolve')
  public resolve(
    @request() { body }: Request,
    @response() resp: Response
  ): void {
    if (body.text) {
      resp.status(200).send('Alright, request received');

      this._slackService.resolveIncident(body.team_id, body.channel_id, body.user_id, body.text).then(() => {
        return this._removeMessage(body.response_url);
      }, (error: Error) => {
        return this._showErrorMessage(body.response_url, error);
      });

      return;
    }

    resp.status(200)
    .send('Oh noes! Reason for the fix is missing! Please let us know how you fixed the line and try again!');
  }

  @httpPost('/assign.experts')
  public async assign(
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {
    return this.json({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Pick one or more user to assign them as the duty experts'
          },
          accessory: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select the duty experts',
              emoji: true
            }
          }
        }
      ]
    });
  }

  @httpPost('/interactions')
  public interactions(
    @request() rawRequest: Request
  ): void {
    const body: { actions: { selected_users: Array<string> }, team: { id: string }, channel: { id: string }, response_url: string } = JSON.parse(rawRequest.body.payload),
      expertIds: Array<string> = body.actions[0].selected_users;

    this._slackService.setExperts(body.team.id, body.channel.id, expertIds).then(() => {
      return this._removeMessage(body.response_url);
    }, (error: Error) => {
      return this._showErrorMessage(body.response_url, error);
    });
  }

  private async _showErrorMessage(responseUrl: string, error?: Error): Promise<void> {
    await Axios.post(responseUrl, {
      replace_original: true,
      text: error ? error.message : 'Whoops there has been an issue with your request!'
    });
  }

  private async _removeMessage(responseUrl: string): Promise<void> {
    await Axios.post(responseUrl, {
      delete_original: true
    });
  }
}
