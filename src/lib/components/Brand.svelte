<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './Brand.stylex.ts';
  let { href = '/' }: { href?: string } = $props();
</script>

<a {href} {...stylex.attrs(styles.brand)} aria-label="Gather home"
  ><img src="/favicon.svg" alt="" width="32" height="32" /><span
    >gather<span {...stylex.attrs(styles.brandDot)}>.</span></span
  ></a
>
