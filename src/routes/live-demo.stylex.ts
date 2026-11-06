import * as stylex from '@stylexjs/stylex';
import { ink, at } from './landing-tokens.stylex';
import { tokens } from '#lib/tokens.stylex.ts';

// Where a capture used to sit: the app's own background, framed like the image was.
export const styles = stylex.create({
  live: {
    // On phones the app gets the well's full width, as the phone captures did.
    padding: { default: 20, [at.phone]: 0 },
    borderRadius: 8,
    outline: { default: `1px solid ${ink.rule}`, [at.phone]: 'none' },
    outlineOffset: -1,
    backgroundColor: { default: tokens.surface, [at.phone]: 'transparent' },
    fontSize: 15,
    lineHeight: 1.5
  },
  // The friend's form is long, so it scrolls in place beside the pinned pane.
  scroll: { maxHeight: { default: 760, [at.phone]: 'none' }, overflowY: 'auto' },
  done: { minHeight: 320, justifyContent: 'center' }
});
