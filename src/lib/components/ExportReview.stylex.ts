import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  lead: { fontSize: 14, color: tokens.muted, textWrap: 'pretty' },
  layout: {
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: { default: '220px minmax(0, 1fr)', [media.mobile]: 'minmax(0, 1fr)' },
    gap: 20,
    gridTemplateRows: 'minmax(0, 1fr)',
    height: { default: 'min(62dvh, 560px)', [media.mobile]: 'min(56dvh, 560px)' }
  },
  people: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    paddingRight: 12,
    display: { default: 'flex', [media.mobile]: 'none' },
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: tokens.line
  },
  personButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderWidth: 0,
    borderRadius: 8,
    textAlign: 'left',
    color: tokens.ink,
    cursor: 'pointer',
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.hover } },
    transition: 'background-color 150ms ease'
  },
  personOpen: {
    backgroundColor: { default: tokens.blueSoft, [media.hover]: { ':hover': tokens.blueSoft } }
  },
  personText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  personName: {
    fontSize: 14,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  personStatus: { fontSize: 12, color: tokens.muted },
  pendingStatus: { color: '#8a6417' },
  detail: { overflowY: 'auto', minWidth: 0, minHeight: 0, paddingRight: 4 },
  detailHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 4,
    backgroundColor: tokens.paper
  },
  detailTitle: { flexGrow: 1, minWidth: 0 },
  detailName: { margin: 0, fontSize: 16, overflowWrap: 'anywhere' },
  detailStatus: { fontSize: 13, color: tokens.muted },
  stepper: { display: 'flex', alignItems: 'center', gap: 2 },
  count: { fontSize: 13, color: tokens.muted, marginRight: 6, whiteSpace: 'nowrap' },
  table: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'grid',
    gridTemplateColumns: {
      default: '88px minmax(0, 1fr) minmax(0, 1fr)',
      [media.mobile]: 'minmax(0, 1fr) minmax(0, 1fr)'
    },
    columnGap: 8,
    rowGap: 6,
    alignItems: 'start'
  },
  headings: { fontSize: 12, fontWeight: 600, color: tokens.faint, letterSpacing: 0.2 },
  headingLabel: { display: { default: 'block', [media.mobile]: 'none' } },
  quiet: { color: tokens.muted },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: tokens.muted,
    paddingTop: { default: 10, [media.mobile]: 6 },
    gridColumn: { default: 'auto', [media.mobile]: '1 / -1' }
  },
  cell: {
    minWidth: 0,
    minHeight: 40,
    paddingBlock: 9,
    paddingInline: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: tokens.surface,
    fontSize: 14,
    textAlign: 'left',
    color: tokens.ink
  },
  span: { gridColumn: { default: 'span 2', [media.mobile]: '1 / -1' } },
  sameCell: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  empty: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: tokens.line,
    color: tokens.faint,
    fontSize: 13
  },
  pickCell: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  pick: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 9,
    cursor: 'pointer',
    borderColor: { default: tokens.line, [media.hover]: { ':hover': tokens.field } },
    backgroundColor: tokens.paper,
    transition: 'background-color 150ms ease, border-color 150ms ease'
  },
  picked: {
    borderColor: { default: tokens.blue, [media.hover]: { ':hover': tokens.blue } },
    backgroundColor: tokens.blueSoft
  },
  mark: {
    flexShrink: 0,
    width: 16,
    height: 16,
    marginTop: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: tokens.field,
    backgroundColor: tokens.paper,
    color: tokens.paper,
    transition: 'background-color 150ms ease, border-color 150ms ease'
  },
  round: { borderRadius: 999 },
  markOn: { borderColor: tokens.blue, backgroundColor: tokens.blue },
  pickBody: { minWidth: 0, flexGrow: 1, transition: 'color 150ms ease' },
  // Google's value that this export replaces.
  removed: { color: tokens.faint, textDecoration: 'line-through' },
  // The card's value that this export leaves out.
  skipped: { color: tokens.faint },
  values: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-line'
  },
  value: { display: 'block' },
  photo: { display: 'block', width: 44, height: 44, borderRadius: 999, objectFit: 'cover' },
  nickname: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: tokens.muted },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line
  },
  summary: { fontSize: 13, color: tokens.muted },
  actions: { display: 'flex', gap: 8, marginLeft: 'auto' }
});
