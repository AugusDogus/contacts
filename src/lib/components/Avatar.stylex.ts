import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({
  avatar: (size: number, color: string) => ({
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    color: '#475068',
    fontWeight: 600,
    width: size,
    height: size,
    fontSize: size * 0.32,
    backgroundColor: color
  }),
  image: { width: '100%', height: '100%', objectFit: 'cover' }
});
