<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { page } from '$app/state';
  import { styles } from './Footer.stylex.ts';
  // Links point at the main site so they also work on people's subdomains.
  let root = $derived(page.data.appUrl ?? '');
</script>

<footer {...stylex.attrs(styles.footer)}>
  <span>Contacts Exchange</span>
  <nav {...stylex.attrs(styles.links)} aria-label="Footer">
    <a {...stylex.attrs(styles.link)} href="{root}/about">About</a>
    <a {...stylex.attrs(styles.link)} href="{root}/privacy">Privacy</a>
    <a {...stylex.attrs(styles.link)} href="mailto:augie@contacts.exchange">Contact</a>
  </nav>
</footer>
