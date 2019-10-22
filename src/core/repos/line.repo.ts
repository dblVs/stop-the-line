import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { inject, injectable } from 'inversify';
import { DBToken } from '../tokens/db.token';

export const LineRepoToken: string = 'LineRepoToken';

@injectable()
export class LineRepo {
  constructor(
    @inject(DBToken) private _database: Firestore
  ) {}

  public getLine(tenantId: string, lineId: string): DocumentReference {
    return this._database.doc(`${ tenantId }/${ lineId }`);
  }
}
