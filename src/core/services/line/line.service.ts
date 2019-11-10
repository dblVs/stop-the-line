import { DocumentReference } from '@google-cloud/firestore';
import { inject, injectable } from 'inversify';
import { IncidentRepo, IncidentRepoToken } from '../../repos/incident.repo';
import { LineRepo, LineRepoToken } from '../../repos/line.repo';
import { LineIncidentInterface } from './intefaces/line-incident.interface';

export const LineServiceToken: string = 'line-service';

@injectable()
export class LineService {
  constructor(
    @inject(IncidentRepoToken) private _incidentRepo: IncidentRepo,
    @inject(LineRepoToken) private _lineRepo: LineRepo
  ) {
  }

  public async reportIncident(
    tenantId: string,
    lineId: string,
    userId: string,
    reason: string = ''
  ): Promise<LineIncidentInterface> {
    const currentLine: DocumentReference = this._lineRepo.getLine(tenantId, lineId),
      now: number = Date.now();

    let currentIncident: DocumentReference = await this._incidentRepo.getLatestIncident(currentLine),
      currentIncidentData: LineIncidentInterface = null;

    if (currentIncident) {
      currentIncidentData = (await currentIncident.get()).data() as LineIncidentInterface;
    }

    if (!currentIncidentData || currentIncidentData.state === 'resolved') {
      currentIncident = await this._incidentRepo.createIncident(currentLine, userId, reason, now);
    } else {
      if (!currentIncidentData.stop) {
        await this._incidentRepo.recordStop(currentIncident, userId, reason, now);
      } else {
        throw new Error('Cannot stop line while there is an on-going issue');
      }
    }

    return (await currentIncident.get()).data() as LineIncidentInterface;
  }

  public async resolveIncident(
    tenantId: string,
    lineId: string,
    userId: string,
    reason: string = ''
  ): Promise<LineIncidentInterface> {
    const currentIncident: DocumentReference = await this._incidentRepo.getLatestIncident(this._lineRepo.getLine(tenantId, lineId));

    if (currentIncident) {
      const currentIncidentData: LineIncidentInterface = (await currentIncident.get()).data() as LineIncidentInterface;

      if (currentIncidentData.state === 'in-progress') {
        await this._incidentRepo.resolveIncident(currentIncident, userId, reason, Date.now());

        return (await currentIncident.get()).data() as LineIncidentInterface;
      }
    }

    throw new Error('the line is currently not stopped');
  }

  public async setExperts(tenantId: string, lineId: string, experts: Array<string>): Promise<void> {
    await this._lineRepo.setExperts(tenantId, lineId, experts);
  }

  public async getExperts(tenantId: string, lineId: string): Promise<Array<string>> {
    return this._lineRepo.getExperts(tenantId, lineId);
  }
}
