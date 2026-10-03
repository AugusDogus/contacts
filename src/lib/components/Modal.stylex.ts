import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  dialog: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 16,
    padding: 0,
    width: 'min(520px, calc(100vw - 32px))',
    maxHeight: 'calc(100dvh - 48px)',
    color: tokens.ink,
    boxShadow: '0 24px 100px #1b24452b',
    '::backdrop': { backgroundColor: '#17223d55', backdropFilter: 'blur(3px)' }
  },
  wide: { width: 'min(680px, calc(100vw - 32px))' },
  modalBody: { padding: { default: 28, [media.mobile]: 22 } },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 20
  },
  title: { fontSize: 22, margin: 0, overflowWrap: 'anywhere' }
});
