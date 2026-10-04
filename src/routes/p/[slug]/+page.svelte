<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from '#lib/components/PublicShell.stylex.ts';
  import PublicShell from '#lib/components/PublicShell.svelte';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head
  ><title>{data.profile.name} | Contacts Exchange</title><meta
    name="robots"
    content="noindex, nofollow"
  /></svelte:head
>
<PublicShell name={data.profile.name} title={data.profile.name} message={data.profile.message}
  ><div {...stylex.attrs(styles.closed)}>
    <p {...stylex.attrs(styles.closedText)}>
      Ask {data.profile.name} for a personal invitation link.
    </p>
    <a {...stylex.attrs(ui.button)} href="{data.appUrl}/login">Start your own</a>
  </div></PublicShell
>
