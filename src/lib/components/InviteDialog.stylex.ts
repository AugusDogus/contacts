import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  inviteForm: { marginTop: 24, display: 'flex', flexDirection: 'column', gap: 23 },
  countRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 },
  countLabel: { fontSize: 13, fontWeight: 500 },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 8
  },
  stepButton: {
    width: 32,
    height: 38,
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: tokens.muted
  },
  stepInput: {
    width: 42,
    minHeight: 38,
    paddingBlock: 5,
    paddingInline: 0,
    borderWidth: 0,
    textAlign: 'center',
    marginTop: 0,
    appearance: 'textfield',
    '::-webkit-inner-spin-button': { appearance: 'none' }
  },
  privacyNote: {
    display: 'flex',
    gap: 11,
    alignItems: 'center',
    backgroundColor: '#f5f7fb',
    padding: 15,
    borderRadius: 9,
    color: '#698178'
  },
  privacyText: { fontSize: 12, color: '#55655d' },
  privacyHelp: { fontSize: 11, color: tokens.muted },
  generatedLinks: {
    maxHeight: 300,
    overflow: 'auto',
    marginTop: 24,
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  generatedLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backgroundColor: tokens.surface,
    padding: 12,
    borderRadius: 8
  },
  generatedContent: { flexGrow: 1, minWidth: 0 },
  generatedLabel: { fontSize: 12, fontWeight: 500 },
  linkInput: {
    fontSize: 11,
    minHeight: 30,
    paddingBlock: 4,
    paddingInline: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens.muted
  },
  dialogActions: { display: 'flex', gap: 10, marginTop: 24 },
  action: { flexGrow: 1 },
  saveNote: { fontSize: 12, color: '#887347' }
});
