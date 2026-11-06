<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { Check } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles as shell } from '#lib/components/PublicShell.stylex.ts';
  import { styles } from './live-demo.stylex.ts';
  import { DemoBook } from '#lib/demo-book.ts';
  import InviteDialog from '#lib/components/InviteDialog.svelte';
  import ContactForm from '#lib/components/ContactForm.svelte';
  import PeopleView from '#lib/components/PeopleView.svelte';
  import ExportOptions from '#lib/components/ExportOptions.svelte';
  import type { LiveDemo } from './live-demo.svelte.ts';
  // One step of How it works, as the app shows it, running on the shared demo book.
  let { demo, step }: { demo: LiveDemo; step: 'invite' | 'friend' | 'people' | 'export' } =
    $props();
  const { name: owner, message } = DemoBook.owner;
  let invite = $state(0);
</script>

<div {...stylex.attrs(styles.live, step === 'friend' && styles.scroll)}>
  {#if step === 'invite'}{#key invite}<InviteDialog
        inline
        form={demo.book.profile.form}
        slug={demo.book.profile.slug}
        actions={demo.actions}
        onclose={() => invite++}
      />{/key}
  {:else if step === 'friend'}
    {#if demo.friend.kind === 'sent'}<div {...stylex.attrs(shell.closed, styles.done)}>
        <span {...stylex.attrs(ui.emptyIcon)}><Check size={24} /></span>
        <h3 {...stylex.attrs(shell.title)}>Sent to {owner}</h3>
        <p {...stylex.attrs(shell.closedText)}>All done. You can close this page.</p>
        {#if demo.link}<button
            type="button"
            {...stylex.attrs(ui.button)}
            onclick={() => demo.open()}
            >Open {demo.link.label ? `${demo.link.label}’s` : 'the next'} link</button
          >{/if}
      </div>{:else if demo.link}<div {...stylex.attrs(shell.intro)}>
        <span {...stylex.attrs(shell.avatar)} aria-hidden="true">{owner.slice(0, 1)}</span>
        <h3 {...stylex.attrs(shell.title)}>Share your details with {owner}</h3>
        <p {...stylex.attrs(shell.message)}>{message}</p>
      </div>
      <div {...stylex.attrs(shell.card)}>
        {#key demo.friend.key}<ContactForm
            initial={demo.friend.draft}
            recipient={owner}
            config={demo.book.profile.form}
            onsave={async (contact) => demo.send(contact)}
          />{/key}
      </div>{:else}<div {...stylex.attrs(shell.closed, styles.done)}>
        <p {...stylex.attrs(shell.closedText)}>No open links. Make one above.</p>
      </div>{/if}
  {:else if step === 'people'}<PeopleView book={demo.book} actions={demo.actions} level={3} />
  {:else}<ExportOptions
      status="demo"
      summary=""
      pending={demo.book.contacts.length}
      uncertain={[]}
      busy={false}
      error=""
      exportLabel=""
      vcard={{
        href: DemoBook.vcardHref(demo.book.contacts),
        count: demo.book.contacts.length
      }}
      onconnect={() => {}}
      onexport={() => {}}
      level={3}
    />{/if}
</div>
