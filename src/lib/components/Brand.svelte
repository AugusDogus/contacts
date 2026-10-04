<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './Brand.stylex.ts';
  let { href = '/' }: { href?: string } = $props();
</script>

<a {href} {...stylex.attrs(styles.brand)} aria-label="Contacts Exchange home"
  ><img src="/favicon.svg" alt="" width="24" height="24" /><span>Contacts Exchange</span></a
>
