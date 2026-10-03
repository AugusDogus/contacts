import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  columns: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0,1fr) 340px', '@media (max-width: 1150px)': '1fr' },
    gap: 30,
    alignItems: 'start'
  },
  form: { padding: { default: 30, [media.mobile]: 22 } },
  sectionTitle: { marginBottom: 22, fontSize: 20 },
  address: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe3eb',
    borderRadius: 8,
    marginTop: 7,
    backgroundColor: tokens.paper,
    paddingRight: 12
  },
  slugInput: { borderWidth: 0, minWidth: 70, width: '100%', margin: 0, paddingRight: 0 },
  suffix: { color: '#8994a8', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 400 },
  preview: {
    padding: 28,
    textAlign: 'center',
    backgroundColor: '#eef2fb',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e1e7f4'
  },
  previewLabel: { fontSize: 11, color: '#8190ae', marginBottom: 24 },
  profileAvatar: {
    display: 'grid',
    placeItems: 'center',
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#dbe4fb',
    color: '#6b80bd',
    fontSize: 28,
    fontFamily: tokens.heading,
    marginInline: 'auto',
    marginBottom: 18
  },
  previewTitle: { fontSize: 24 },
  previewText: {
    color: '#7383a0',
    fontSize: 12,
    marginTop: 14,
    lineHeight: 1.8,
    overflowWrap: 'anywhere'
  },
  previewFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 24,
    marginBottom: 20
  },
  previewField: {
    padding: 12,
    backgroundColor: '#ffffffaa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe6f7',
    borderRadius: 7,
    textAlign: 'left',
    fontSize: 11,
    color: '#97a4bb'
  },
  previewPrivacy: {
    fontSize: 10,
    color: '#8190ae',
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20
  },
  bottom: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 22,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    flexWrap: 'wrap'
  },
  shareBox: {
    marginTop: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10
  },
  url: { fontSize: 13, overflowWrap: 'anywhere' }
});
