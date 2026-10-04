<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from '#lib/components/PublicShell.stylex.ts';
  import { Check, LockKeyhole } from '@lucide/svelte';
  import PublicShell from '#lib/components/PublicShell.svelte';
  import ContactForm from '#lib/components/ContactForm.svelte';
  import { submitContact } from '#lib/invitation.remote.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let done = $state(false);
  let name = $derived(data.profile.name);
</script>

<svelte:head
  ><title>Share your details with {name} | Contacts Exchange</title><meta
    name="robots"
    content="noindex, nofollow"
  /></svelte:head
>
{#if done}<PublicShell {name} title="Sent to {name}"
    ><div {...stylex.attrs(styles.closed)} role="status">
      <span {...stylex.attrs(ui.emptyIcon)}><Check size={24} /></span>
      <p {...stylex.attrs(styles.closedText)}>All done. You can close this page.</p>
      <a {...stylex.attrs(ui.button)} href="{data.appUrl}/login?claim=1"
        >Save your card for next time</a
      >
    </div></PublicShell
  >
{:else if data.state === 'used'}<PublicShell {name} title="Already sent"
    ><div {...stylex.attrs(styles.closed)}>
      <span {...stylex.attrs(ui.emptyIcon)}><Check size={24} /></span>
      <p {...stylex.attrs(styles.closedText)}>
        Details were already sent to {name} with this link. If that wasn’t you, ask {name} for a new one.
      </p>
    </div></PublicShell
  >
{:else if data.state !== 'open'}<PublicShell
    {name}
    title={data.state === 'expired' ? 'This link expired' : 'This link doesn’t work'}
    ><div {...stylex.attrs(styles.closed)}>
      <span {...stylex.attrs(ui.emptyIcon)}><LockKeyhole size={22} /></span>
      <p {...stylex.attrs(styles.closedText)}>Ask {name} for a new one.</p>
    </div></PublicShell
  >
{:else}<PublicShell {name} title="Share your details with {name}" message={data.profile.message}
    ><ContactForm
      initial={data.savedCard ?? undefined}
      recipient={name}
      onsave={async (contact) => {
        const result = await submitContact({
          slug: data.profile.slug,
          token: data.token,
          contact,
          consent: true
        });
        if (result.ok) done = true;
        return result;
      }}
    /></PublicShell
  >{/if}
