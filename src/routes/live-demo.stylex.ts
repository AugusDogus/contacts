import * as stylex from '@stylexjs/stylex';

// The app's own type scale inside the wells where the captures used to sit.
export const styles = stylex.create({
  live: { fontSize: 15, lineHeight: 1.55 },
  done: { paddingBlock: 48, justifyContent: 'center' }
});
