import * as stylex from '@stylexjs/stylex';
import { ink, at } from './landing-tokens.stylex';
import { tokens } from '#lib/tokens.stylex.ts';

// The two windows around the live demo. Inside them, the app keeps its own tokens.
export const styles = stylex.create({
  stage: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) minmax(0, 1fr)',
      [at.stack]: 'minmax(0, 1fr)'
    },
    gap: { default: 24, [at.phone]: 32 },
    alignItems: 'start'
  },
  window: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink.rule,
    borderRadius: ink.radiusCard,
    overflow: 'hidden',
    backgroundColor: tokens.surface,
    boxShadow: '0 1px 2px #1e23300a, 0 12px 32px -12px #1e23301f'
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
    margin: 0,
    paddingBlock: 8,
    paddingInline: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: ink.rule,
    backgroundColor: ink.paper,
    fontSize: 15,
    fontWeight: 600,
    color: ink.ink
  },
  screen: {
    height: { default: 680, [at.stack]: 'auto' },
    overflowY: 'auto',
    padding: ink.wellPad
  },
  done: { minHeight: 320, justifyContent: 'center' }
});
