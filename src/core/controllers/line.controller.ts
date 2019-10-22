import { Request } from 'express';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpPost, interfaces, request } from 'inversify-express-utils';
import { LineIncidentInterface } from '../services/line/intefaces/line-incident.interface';
import { LineService, LineServiceToken } from '../services/line/line.service';

@controller('/line')
export class LineController extends BaseHttpController {
  constructor(
    @inject(LineServiceToken) private _lineService: LineService
  ) {
    super();
  }

  @httpPost('/stop')
  public async reportIncident(
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {
    const requestData: {
      userId: string;
      tenantId: string;
      lineId: string;
      reason: string;
    } = rawRequest.body;
    try {
      const incident: LineIncidentInterface = await this._lineService.reportIncident(requestData.tenantId, requestData.lineId, requestData.userId, requestData.reason);

      return this.json({ incident }, 201);
    } catch (e) {
      return this.json({ error: { msg: e.message } }, 400);
    }
  }

  @httpPost('/resolve')
  public async resolveLine(
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {
    const requestData: {
      userId: string;
      tenantId: string;
      lineId: string;
      reason: string;
    } = rawRequest.body;
    try {
      const incident: LineIncidentInterface = await this._lineService.resolveIncident(requestData.tenantId, requestData.lineId, requestData.userId, requestData.reason);

      return this.json({ incident }, 201);
    } catch (e) {
      return this.json({ error: { msg: e.message } }, 400);
    }
  }
}
