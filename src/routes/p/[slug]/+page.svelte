<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from '#lib/components/PublicShell.stylex.ts';
  import PublicShell from '#lib/components/PublicShell.svelte';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let name = $derived(data.profile.name);
</script>

<svelte:head
  ><title>{name}’s address book | Contacts Exchange</title><meta
    name="robots"
    content="noindex, nofollow"
  /></svelte:head
>
<!-- The owner's note is written for invitees, so it is not shown to people without a link. -->
<PublicShell
  {name}
  title="{name}’s address book"
  message="{name} adds people with personal links. To share your details, open the one {name} sent you."
  ><div {...stylex.attrs(styles.closed)}>
    <h2 {...stylex.attrs(styles.pitchTitle)}>Want an address book like this?</h2>
    <p {...stylex.attrs(styles.closedText)}>
      Send friends a link. They fill in their own details, and you can export them anytime.
    </p>
    <a {...stylex.attrs(ui.button, ui.primary)} href="{data.appUrl}/login">Make your own</a>
    <p {...stylex.attrs(styles.signIn)}>
      Have one already? <a href="{data.appUrl}/login?signin">Sign in</a>
    </p>
  </div></PublicShell
>
