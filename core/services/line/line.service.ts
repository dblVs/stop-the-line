import { CollectionReference, DocumentReference, Firestore, QuerySnapshot } from '@google-cloud/firestore';
import { inject, injectable } from 'inversify';
import { DBToken } from '../../tokens/db.token';
import { LineIncidentInterface } from './intefaces/line-incident.interface';

export const LineServiceToken: string = 'line-service';

@injectable()
export class LineService {
  constructor(
    @inject(DBToken) private _database: Firestore
  ) {
  }

  public async reportIncident(
    tenantId: string,
    lineId: string,
    userId: string,
    reason: string = ''
  ): Promise<LineIncidentInterface> {
    const currentIncident: LineIncidentInterface = await this._getCurrentIncident(tenantId, lineId, Date.now(), 5);

    if (!currentIncident) {
      return this._createIncident(tenantId, lineId, userId, reason, Date.now());
    }

    return currentIncident;
  }

  private async _createIncident(tenantId: string, lineId: string, userId: string, reason: string, filedTime: number): Promise<LineIncidentInterface> {
    const lineIncident: DocumentReference = await this._getLineIncidents(tenantId, lineId).add({
      filedAt: filedTime,
      filedBy: userId,
      incidentReason: reason
    });

    return (await lineIncident.get()).data() as LineIncidentInterface;
  }

  private _getLineIncidents(tenantId: string, lineId: string): CollectionReference {
    return this._database.collection(`${ tenantId }/${ lineId }/incidents`);
  }

  private async _getCurrentIncident(tenantId: string, lineId: string, fromTimestamp: number, timeFrameInMinutes: number): Promise<LineIncidentInterface> {
    const timeFrameInMilliseconds: number = timeFrameInMinutes * 60 * 10000,
      timeFrameLimit: number = fromTimestamp - timeFrameInMilliseconds;

    const incident: QuerySnapshot = await this._getLineIncidents(tenantId, lineId)
    .where('filedAt', '>', timeFrameLimit)
    .limit(1)
    .get();

    return incident.empty ? null : incident.docs[0].data() as LineIncidentInterface;
  }
}
