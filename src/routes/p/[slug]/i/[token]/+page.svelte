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
</script>

<svelte:head
  ><title>A contact card for {data.profile.name} | Contacts Exchange</title><meta
    name="robots"
    content="noindex, nofollow"
  /></svelte:head
>
<PublicShell name={data.profile.name} message={data.profile.message}>
  {#if done}<div {...stylex.attrs(styles.closed)}>
      <span {...stylex.attrs(ui.emptyIcon)}><Check size={28} /></span>
      <h2>A little closer already.</h2>
      <p {...stylex.attrs(styles.closedText)}>
        Your contact card is safely in {data.profile.name}'s address book. That’s all you need to
        do.
      </p>
      <p {...stylex.attrs(ui.muted, ui.tiny)}>
        Want a circle of your own? Create an account and save your card to use again.
      </p>
      <a {...stylex.attrs(ui.button, ui.primary)} href="{data.appUrl}/login?claim=1"
        >Save my card and start my address book</a
      >
    </div>
  {:else if !data.valid}<div {...stylex.attrs(styles.closed)}>
      <span {...stylex.attrs(ui.emptyIcon)}><LockKeyhole size={25} /></span>
      <h2>This invitation is closed.</h2>
      <p {...stylex.attrs(styles.closedText)}>
        It may have been used, expired, or revoked. If you already shared your details, they’re
        saved. Otherwise, ask {data.profile.name} for a new link.
      </p>
    </div>
  {:else}<ContactForm
      initial={data.savedCard ?? undefined}
      recipient={data.profile.name}
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
    />{/if}
</PublicShell>
