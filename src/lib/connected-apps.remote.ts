import { command, query } from '$app/server';
import { z } from 'zod';
import { db } from './server/db';
import { connectedApps } from './server/connected-apps';
import { requireViewer } from './server/viewer';

const apps = connectedApps(db);

export const getConnectedApps = query(async () => {
  const viewer = requireViewer();
  // Demo workspaces have no account for an app to authorize.
  return viewer.kind === 'account' ? apps.list(viewer.id) : [];
});

export const disconnectApp = command(z.string(), async (id) => {
  const viewer = requireViewer();
  const disconnected = viewer.kind === 'account' && (await apps.disconnect(viewer.id, id));
  await getConnectedApps().refresh();
  return disconnected
    ? ({ ok: true } as const)
    : ({
        ok: false,
        message: 'That app was already disconnected. Refresh to see your connected apps.'
      } as const);
});
