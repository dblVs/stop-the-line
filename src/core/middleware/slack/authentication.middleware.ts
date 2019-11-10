import { createHmac, timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { stringify } from 'qs';

export function AuthenticationMiddleware(req: Request, res: Response, next: NextFunction): Response {
  const slackSignature: string = req.headers['x-slack-signature'] as string;

  if (!slackSignature) {
    return res.status(400).send('Slack signing secret is empty.');
  }

  const timestamp: number = parseInt(req.headers['x-slack-request-timestamp'] as string, 10);

  if (isRequestStale(timestamp)) {
    return res.status(400).send('Ignore this request.');
  }

  const requestBody: string = stringify(req.body, { format: 'RFC1738' });
  if (timingSafeEqual(Buffer.from(getHmac(timestamp, requestBody), 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
    next();
  } else {
    return res.status(400).send('Verification failed');
  }
}

function getHmac(timestamp: number, body: string): string {
  return `v0=${ createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
  .update(`v0:${ timestamp }:${ body }`, 'utf8')
  .digest('hex') }`;
}

function isRequestStale(timestamp: number): boolean {
  return Math.abs(Date.now() / 1000 - timestamp) > 300;
}
