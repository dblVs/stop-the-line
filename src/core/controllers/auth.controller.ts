import Axios from 'axios';
import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, request } from 'inversify-express-utils';
import { TokenRepo, TokenRepoToken } from '../repos/token.repo';

@controller('/auth')
export class AuthController {
  constructor(
    @inject(TokenRepoToken) private _tokenRepo: TokenRepo
  ) {
  }

  @httpGet('/redirect')
  public async redirect(
    @request() req: Request
  ): Promise<string> {
    try {
      const token: {
        access_token: string;
        team_id: string;
        bot: { bot_access_token: string }
      } = (await Axios.get(`https://slack.com/api/oauth.access?code=${ req.query.code }&client_id=${ process.env.SLACK_APP_CLIENT_ID }&client_secret=${ process.env.SLACK_APP_SECRET }&=redirect_uri=${ encodeURIComponent('https://stop-the-line.appspot.com/auth/redirect') }`)).data;

      await this._tokenRepo.setToken(token.team_id, token.access_token, token.bot.bot_access_token);

      return 'done';
    } catch (error) {
      return 'shit!';
    }
  }
}
