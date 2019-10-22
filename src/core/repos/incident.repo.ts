import { CollectionReference, DocumentReference, Firestore, QuerySnapshot } from '@google-cloud/firestore';
import { inject, injectable } from 'inversify';
import { DBToken } from '../tokens/db.token';

export const IncidentRepoToken: string = 'incident-repo-token';

@injectable()
export class IncidentRepo {
  constructor(
    @inject(DBToken) private _database: Firestore
  ) {
  }

  public getLineIncidents(line: DocumentReference): CollectionReference {
    return line.collection('incidents');
  }

  public async resolveIncident(incident: DocumentReference, userId: string, reason: string, filedTime: number): Promise<DocumentReference> {
    await incident.set({
      state: 'resolved',
      resolution: {
        user_id: userId,
        filed_at: filedTime,
        reason
      }
    }, { merge: true });

    return incident;
  }

  public async recordStop(incident: DocumentReference, userId: string, reason: string, filedTime: number): Promise<DocumentReference> {
    await incident.set({
      stop: {
        user_id: userId,
        filed_at: filedTime,
        reason
      }
    }, { merge: true });

    return incident;
  }

  public async createIncident(line: DocumentReference, userId: string, reason: string, filedTime: number): Promise<DocumentReference> {
    return this.getLineIncidents(line).add({
      state: 'in-progress',
      filed_at: filedTime,
      warning: {
        filed_at: filedTime,
        filed_by: userId,
        reason
      }
    });
  }

  public async getLatestIncident(line: DocumentReference): Promise<DocumentReference> {
    const incident: QuerySnapshot = await this.getLineIncidents(line)
    .orderBy('filed_at', 'desc')
    .limit(1)
    .get();

    return incident.empty ? null : incident.docs[0].ref;
  }
}
