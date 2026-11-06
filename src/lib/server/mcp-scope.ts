/** OAuth scopes an MCP client can request beyond the OpenID defaults. */
export const McpScope = {
  readContacts: 'contacts:read',
  writeInvitations: 'invitations:write'
} as const;
export type McpScope = (typeof McpScope)[keyof typeof McpScope];
