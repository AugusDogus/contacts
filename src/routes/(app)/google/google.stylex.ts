import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  container: { maxWidth: 850 },
  connection: { padding: { default: 32, [media.mobile]: 23 } },
  identity: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 },
  google: {
    display: 'grid',
    placeItems: 'center',
    width: 52,
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    color: '#4b7cd1',
    fontFamily: 'Arial,sans-serif',
    fontWeight: 600,
    fontSize: 28
  },
  name: { flexGrow: 1 },
  description: {
    color: tokens.muted,
    fontSize: 13,
    lineHeight: 1.85,
    maxWidth: 620,
    marginBottom: 22
  },
  actions: { display: 'flex', alignItems: 'center', gap: 13, flexWrap: 'wrap', marginTop: 22 },
  syncInfo: {
    backgroundColor: '#f6f8fc',
    borderRadius: 8,
    padding: 17,
    fontSize: 13,
    color: '#697c9b'
  },
  exportPanel: {
    marginTop: 24,
    padding: 28,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 18,
    flexWrap: { default: 'nowrap', [media.mobile]: 'wrap' }
  },
  exportInfo: { flexGrow: 1 },
  exportTitle: { fontSize: 18, marginBottom: 8 },
  exportText: { fontSize: 12, color: tokens.muted, maxWidth: 430, lineHeight: 1.8 },
  note: {
    display: 'flex',
    gap: 9,
    alignItems: 'flex-start',
    fontSize: 12,
    color: tokens.muted,
    marginTop: 24,
    maxWidth: 650,
    lineHeight: 1.8
  },
  uncertain: {
    marginTop: 20,
    fontSize: 12,
    color: '#947134',
    backgroundColor: '#fff9ec',
    padding: 16,
    borderRadius: 8
  },
  uncertainList: { paddingLeft: 20, marginBottom: 0 },
  reconnect: {
    borderWidth: 0,
    color: tokens.blue,
    backgroundColor: 'transparent',
    fontSize: 12,
    padding: 0
  }
});
