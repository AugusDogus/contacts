// Keep accepting previously issued invitations.
export const invitationTokenPattern = /^(?:[A-Za-z0-9_-]{7}|[A-Za-z0-9_-]{24}|[A-Za-z0-9_-]{43})$/;

export function invitationReference(invitation: { id: string; reference: string | null }) {
  return invitation.reference ?? invitation.id.slice(0, 8);
}
