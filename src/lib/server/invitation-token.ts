import { randomBytes } from 'node:crypto';

export const InvitationToken = {
  generate(): string {
    // Reserve lowercase words for app routes, such as /privacy.
    let token: string;
    do {
      token = randomBytes(6).toString('base64url').slice(0, 7);
    } while (/^[a-z]+$/.test(token));
    return token;
  }
};
