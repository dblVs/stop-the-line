import { WebClient } from '@slack/web-api';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';
import { TokenRepo, TokenRepoToken } from '../../repos/token.repo';
import { LineIncidentInterface } from '../line/intefaces/line-incident.interface';
import { LineService, LineServiceToken } from '../line/line.service';

export const SlackServiceToken: string = 'Slack service token';

@injectable()
export class SlackService {
  constructor(
    @inject(LineServiceToken) private _lineService: LineService,
    @inject(TokenRepoToken) private _tokenRepo: TokenRepo
  ) {
  }

  public async stop(team: string, channel: string, userId: string, reason: string): Promise<void> {
    const client: WebClient = await this._getClient(team),
      experts: Array<string> = await this._lineService.getExperts(team, channel);

    if (!await this._checkChannel(client, channel)) {
      throw new Error('This is a private channel. Stop the line can only be used in public channels.');
    }

    return this._lineService.reportIncident(team, channel, userId, reason)
    .then(async (incident: LineIncidentInterface) => {
      if (!incident.stop) {
        await this._warnChannel(client, userId, channel, reason);
      } else {
        await this._contactRespondents(client, userId, channel, reason, experts);
      }
    });
  }

  public async resolveIncident(team: string, channel: string, userId: string, reason: string): Promise<void> {
    const client: WebClient = await this._getClient(team),
      incident: LineIncidentInterface = await this._lineService.resolveIncident(team, channel, userId, reason);

    if (!await this._checkChannel(client, channel)) {
      throw new Error('This is a private channel. Make the channel public before using Stop the line.');
    }

    const incidentDuration: number = incident.resolution.filed_at - incident.filed_at;

    await client.chat.postMessage({
      channel,
      text: `The line has been resolved by <@${ userId }>, while the incident lasted for ${ moment.duration(incidentDuration)
      .humanize() }! Solution to the issue was: \`\`\`${ reason }\`\`\``
    });
  }

  public async setExperts(team: string, channel: string, expertIds: Array<string>): Promise<void> {
    const client: WebClient = await this._getClient(team);

    if (!await this._checkChannel(client, channel)) {
      throw new Error('This is a private channel. Make the channel public before using Stop the line.');
    }

    await this._lineService.setExperts(team, channel, expertIds);
    await (await this._getClient(team)).chat.postMessage({
      channel,
      text: `Users ${ expertIds.map((userId: string) => `<@${ userId }>`)
      .join(', ') } have been selected as duty experts!`
    });
  }

  private async _checkChannel(client: WebClient, channel: string): Promise<boolean> {
    try {
      const { channel: channelInfo }: { channel: { is_channel: boolean, is_private: boolean } } = await client.channels.info({
        channel
      }) as unknown as { channel: { is_channel: boolean, is_private: boolean } };

      return channelInfo.is_channel && !channelInfo.is_private;
    } catch {
      return false;
    }
  }

  private async _getClient(team: string): Promise<WebClient> {
    return new WebClient(await this._tokenRepo.getToken(team));
  }

  private async _warnChannel(client: WebClient, userId: string, channel: string, reason: string): Promise<void> {
    await client.chat.postMessage({
      channel,
      text: `<@${ userId }> is experiencing issues at the moment. Warning reason: \`\`\`${ reason }\`\`\` If you also experience some issues at the moment, please stop the line.`
    });
  }

  private async _contactRespondents(client: WebClient, userId: string, channel: string, reason: string, experts: Array<string>): Promise<void> {
    await client.chat.postMessage({
      channel,
      text: `<@${ userId }> stopped the line! Contacting the duty experts now`
    });

    const conversation: { channel: { id: string } } = await client.conversations.open({
      users: experts.join(',')
    }) as unknown as {
      channel: { id: string }
    };

    await client.chat.postMessage({
      channel: conversation.channel.id,
      text: `<@${ userId }> stopped the <#${ channel }> line which you respond to! Reason for stopping the line: \`\`\`${ reason }\`\`\` When you solve the issue please resolve the line with your reason. Example: \`\`\`/fixtheline Fixed broken SQL script\`\`\``
    });
  }
}
