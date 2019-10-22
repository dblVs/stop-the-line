import { ReportInterface } from './report.interface';

export interface LineIncidentInterface {
  filed_at: number;
  state: 'in-progress' | 'resolved';
  warning: ReportInterface;
  stop: ReportInterface;
  resolution: ReportInterface;
}
