import { Request } from 'express';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpPost, interfaces, request, requestParam } from 'inversify-express-utils';
import { LineIncidentInterface } from '../services/line/intefaces/line-incident.interface';
import { LineService, LineServiceToken } from '../services/line/line.service';

@controller('/:tenantId/line')
export class LineController extends BaseHttpController {
  constructor(
    @inject(LineServiceToken) private _lineService: LineService
  ) {
    super();
  }

  @httpPost('/:lineId/stop')
  public async reportIncident(
    @requestParam('tenantId') tenantId: string,
    @requestParam('lineId') lineId: string,
    @request() rawRequest: Request
  ): Promise<interfaces.IHttpActionResult> {
    const requestData: {
      userName: string;
      reason: string;
    } = rawRequest.body;
    const incident: LineIncidentInterface = await this._lineService.reportIncident(tenantId, lineId, requestData.userName, requestData.reason);

    return this.json({ incident }, 201);
  }
}
