import { Firestore } from '@google-cloud/firestore';
import { inject, injectable } from 'inversify';
import { DBToken } from '../tokens/db.token';

export const TokenRepoToken: string = 'TokenRepo';

@injectable()
export class TokenRepo {
  constructor(
    @inject(DBToken) private _database: Firestore
  ) {
  }

  public async getToken(tenantId: string): Promise<string> {
    return (await this._database.doc(`${ tenantId }/token`).get()).data().botToken;
  }

  public async setToken(tenantId: string, accessToken: string, botAccessToken: string): Promise<void> {
    this._database.doc(`${ tenantId }/token`).set({
      botToken: botAccessToken,
      appToken: accessToken
    });
  }
}
