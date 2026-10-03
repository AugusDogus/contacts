<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './page.stylex.ts';
  import { page } from '$app/state';
  import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';
  import { Check, ArrowUpRight, ShieldCheck, Copy } from '@lucide/svelte';
  import { getAddressBook, saveProfile } from '#lib/contacts.remote.ts';
  import { contactPageUrl } from '#lib/links.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  let book = $derived(await getAddressBook());
  let name = $state(untrack(() => book.profile.name));
  let slug = $state(untrack(() => book.profile.slug));
  let message = $state(untrack(() => book.profile.message));
  let busy = $state(false);
  let error = $state('');
  $effect(() => {
    name = book.profile.name;
    slug = book.profile.slug;
    message = book.profile.message;
  });
  let url = $derived(contactPageUrl(book.profile.slug, page.url.origin));
  async function save() {
    if (
      slug !== book.profile.slug &&
      book.invitations.some((i) => i.status === 'pending') &&
      !confirm(
        'Changing your page address will break existing invitation links. Save the new address?'
      )
    )
      return;
    busy = true;
    error = '';
    try {
      const result = await saveProfile({ name, slug, message });
      if (result.ok) notify('Your contact page is saved');
      else error = result.message;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Your page could not be saved. Try again.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>My contact page | Gather</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <div>
    <h1>A small space with your name on it.</h1>
    <p {...stylex.attrs(ui.subtitle)}>Make your invitation feel like it came from you.</p>
  </div>
</div>
<div {...stylex.attrs(styles.columns)}>
  <section {...stylex.attrs(ui.panel, styles.form)}>
    <h2 {...stylex.attrs(styles.sectionTitle)}>Your contact page</h2>
    <form
      {...stylex.attrs(ui.formStack)}
      onsubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label
        >Your name<input
          {...stylex.attrs(ui.input)}
          bind:value={name}
          required
          maxlength="80"
          autocomplete="given-name"
        /></label
      ><label
        >Your page address
        <div {...stylex.attrs(styles.address)}>
          <input
            {...stylex.attrs(ui.input, styles.slugInput)}
            bind:value={slug}
            required
            minlength="3"
            maxlength="40"
            pattern="[a-z0-9]([a-z0-9]|-)*[a-z0-9]"
            aria-label="Your subdomain"
            spellcheck="false"
            autocapitalize="none"
          /><span {...stylex.attrs(styles.suffix)}>.{PUBLIC_CONTACTS_DOMAIN}</span>
        </div>
        <p {...stylex.attrs(ui.help)}>
          Choose a unique name, using lowercase letters, numbers, and hyphens.
        </p></label
      ><label
        >A note for your friends<textarea
          {...stylex.attrs(ui.input)}
          bind:value={message}
          required
          maxlength="500"
          rows="4"></textarea></label
      >
      <p {...stylex.attrs(ui.help)}>
        Your page address alone cannot accept submissions. Friends still need a single-use
        invitation.
      </p>
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      <div {...stylex.attrs(styles.bottom)}>
        <span {...stylex.attrs(ui.muted, ui.tiny)}>Only your name and note are public.</span><button
          {...stylex.attrs(ui.button, ui.primary)}
          disabled={busy}><Check size={16} />{busy ? 'Saving…' : 'Save changes'}</button
        >
      </div>
    </form>
    <div {...stylex.attrs(styles.shareBox)}>
      <a {...stylex.attrs(styles.url)} href={url} target="_blank" rel="noopener noreferrer"
        >{url} <ArrowUpRight size={13} /></a
      ><button
        {...stylex.attrs(ui.button, ui.small)}
        onclick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            notify('Page address copied');
          } catch (cause) {
            failure(cause);
          }
        }}><Copy size={14} />Copy page address</button
      >
    </div>
  </section>
  <section {...stylex.attrs(styles.preview)} aria-label="Live preview">
    <p {...stylex.attrs(styles.previewLabel)}>Your friends will see</p>
    <span {...stylex.attrs(styles.profileAvatar)}>{name.slice(0, 1) || 'A'}</span>
    <h2 {...stylex.attrs(styles.previewTitle)}>Let’s keep in touch.</h2>
    <p {...stylex.attrs(styles.previewText)}>{message}</p>
    <div {...stylex.attrs(styles.previewFields)}>
      <div {...stylex.attrs(styles.previewField)}>First name</div>
      <div {...stylex.attrs(styles.previewField)}>Email address</div>
      <div {...stylex.attrs(styles.previewField)}>Your address</div>
    </div>
    <span {...stylex.attrs(ui.button, ui.primary, ui.full)}>Share my contact card</span>
    <p {...stylex.attrs(styles.previewPrivacy)}>
      <ShieldCheck size={13} />Shared only with {name || 'you'}
    </p>
  </section>
</div>
