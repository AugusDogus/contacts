<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from '#lib/components/PublicShell.stylex.ts';
  import PublicShell from '#lib/components/PublicShell.svelte';
  import { LockKeyhole } from '@lucide/svelte';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head
  ><title>{data.profile.name}'s contact page | Contacts Exchange</title><meta
    name="robots"
    content="noindex, nofollow"
  /></svelte:head
>
<PublicShell name={data.profile.name} message={data.profile.message}
  ><div {...stylex.attrs(styles.closed)}>
    <span {...stylex.attrs(ui.emptyIcon)}><LockKeyhole size={25} /></span>
    <h2>You’re in the right place.</h2>
    <p {...stylex.attrs(styles.closedText)}>
      You’ll need a personal invitation to add your contact card. Ask {data.profile.name} to send you
      a private link.
    </p>
    <a {...stylex.attrs(ui.button)} href="{data.appUrl}/login">Create your own address book</a>
  </div></PublicShell
>
