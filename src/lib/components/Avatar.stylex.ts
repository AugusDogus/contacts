import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({
  avatar: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    fontWeight: 600,
    letterSpacing: 0.2,
    userSelect: 'none'
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' }
});
export const colors = stylex.create({
  violet: { backgroundColor: '#ebe7fb', color: '#5b4a9e' },
  sky: { backgroundColor: '#e2eef7', color: '#2f5f84' },
  peach: { backgroundColor: '#f8e9dd', color: '#8a5530' },
  mint: { backgroundColor: '#e3f0e6', color: '#3b6b4a' },
  rose: { backgroundColor: '#f6e4ea', color: '#8e4560' }
});
