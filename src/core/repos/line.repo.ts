import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { inject, injectable } from 'inversify';
import { DBToken } from '../tokens/db.token';

export const LineRepoToken: string = 'LineRepoToken';

@injectable()
export class LineRepo {
  constructor(
    @inject(DBToken) private _database: Firestore
  ) {
  }

  public getLine(tenantId: string, lineId: string): DocumentReference {
    return this._database.doc(`${ tenantId }/${ lineId }`);
  }

  public setExperts(tenantId: string, lineId: string, experts: Array<string>): Promise<DocumentReference> {
    return this.getLine(tenantId, lineId).collection('experts').add({
      experts,
      changed_at: Date.now()
    });
  }

  public async getExperts(tenantId: string, lineId: string): Promise<Array<string>> {
    const experts: {
      experts: Array<string>;
      changed_at: number;
    } = (await (await this.getLine(tenantId, lineId)
      .collection('experts')
      .orderBy('changed_at', 'desc')
      .limit(1)
      .get()
    ).docs[0]?.ref.get())?.data() as unknown as {
      experts: Array<string>;
      changed_at: number;
    };

    if (!experts) {
      throw new Error('No experts selected');
    }

    return experts.experts;
  }
}
