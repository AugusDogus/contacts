<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { Check } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles as shell } from '#lib/components/PublicShell.stylex.ts';
  import { styles } from './live-demo.stylex.ts';
  import { Contact, type ContactInput } from '#lib/contact.ts';
  import { DemoBook } from '#lib/demo-book.ts';
  import { invitationUrl } from '#lib/links.ts';
  import { notify } from '#lib/notice.svelte.ts';
  import PeopleView from '#lib/components/PeopleView.svelte';
  import ContactForm from '#lib/components/ContactForm.svelte';
  let { origin }: { origin: string } = $props();
  const { name: owner, message } = DemoBook.owner;
  const book = $state(DemoBook.seed());
  let preferred = $state<string | null>(null);
  // What the friend's side shows for the current link.
  let friend = $state<
    { kind: 'form'; draft: ContactInput; key: number } | { kind: 'sent'; name: string }
  >({
    kind: 'form',
    draft: Contact.empty(),
    key: 0
  });
  const actions = DemoBook.actions(book, {
    linkUrl: (token, slug) =>
      invitationUrl(
        token,
        untrack(() => origin),
        slug
      ),
    created: (id) => {
      preferred = id;
      open(Contact.empty());
    }
  });
  let link = $derived(DemoBook.openLink(book, preferred));
  let who = $derived(friend.kind === 'sent' ? friend.name : link?.label || 'your friend');
  function open(draft: ContactInput) {
    friend = { kind: 'form', draft, key: friend.kind === 'form' ? friend.key + 1 : 0 };
  }

  // Sample people for "Fill it in for me", matched to the link's name where one fits.
  const samples = [
    ['Maya', 'Brooks', 'Philadelphia', 'PA', 5],
    ['Theo', 'Grant', 'Chicago', 'IL', 4],
    ['Priya', 'Shah', 'Boston', 'MA', 8]
  ] as const;
  let filled = 0;
  async function fillIn() {
    const label = link?.label.trim() ?? '';
    const match = samples.find(([first]) => first.toLowerCase() === label.toLowerCase());
    const [first, lastName, city, region, photo] =
      match ?? samples[filled++ % samples.length] ?? samples[0];
    // A one-word link name reads as the friend's first name.
    const firstName = !match && /^[A-Za-z]+$/.test(label) ? label : first;
    open({
      ...Contact.empty(),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}@example.com`,
      phone: `(202) 555-01${40 + photo}`,
      city,
      region,
      country: 'United States',
      photo: await dataUrl(`/demo/${photo}.jpg`)
    });
  }
  // The form only accepts photos as data URLs, like the ones it makes from a chosen file.
  async function dataUrl(src: string) {
    try {
      const blob = await (await fetch(src)).blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  }
</script>

<div {...stylex.attrs(styles.stage)}>
  <section {...stylex.attrs(styles.window)} aria-label="Demo: your address book">
    <p {...stylex.attrs(styles.bar)}>What you see</p>
    <div {...stylex.attrs(styles.screen)}>
      <PeopleView {book} {actions} level={3} />
    </div>
  </section>

  <section {...stylex.attrs(styles.window)} aria-label="Demo: what your friend sees">
    <div {...stylex.attrs(styles.bar)}>
      <p>What {who} sees</p>
      {#if link && friend.kind === 'form'}<button
          type="button"
          {...stylex.attrs(ui.button, ui.small)}
          onclick={fillIn}>Fill it in for me</button
        >{/if}
    </div>
    <div {...stylex.attrs(styles.screen)}>
      {#if friend.kind === 'sent'}<div {...stylex.attrs(shell.closed, styles.done)} role="status">
          <span {...stylex.attrs(ui.emptyIcon)}><Check size={24} /></span>
          <h3 {...stylex.attrs(shell.pitchTitle)}>Sent to {owner}</h3>
          <p {...stylex.attrs(shell.closedText)}>
            The card is in People now. Open it to see everything they shared.
          </p>
          {#if link}<button
              type="button"
              {...stylex.attrs(ui.button)}
              onclick={() => open(Contact.empty())}
              >Open {link.label ? `${link.label}’s` : 'the next'} link</button
            >{:else}<p {...stylex.attrs(shell.signIn)}>Press Invite to make another link.</p>{/if}
        </div>{:else if link}{@const current = link}
        <div {...stylex.attrs(shell.intro)}>
          <span {...stylex.attrs(shell.avatar)} aria-hidden="true">{owner.slice(0, 1)}</span>
          <h3 {...stylex.attrs(shell.title)}>Share your details with {owner}</h3>
          <p {...stylex.attrs(shell.message)}>{message}</p>
        </div>
        <div {...stylex.attrs(shell.card)}>
          {#key friend.key}<ContactForm
              initial={friend.draft}
              recipient={owner}
              config={book.profile.form}
              onsave={async (contact) => {
                const result = DemoBook.submit(book, current.id, contact);
                if (result.ok) {
                  friend = { kind: 'sent', name: contact.firstName };
                  notify(`${Contact.name(contact)} is in People`);
                }
                return result;
              }}
            />{/key}
        </div>{:else}<div {...stylex.attrs(shell.closed, styles.done)}>
          <p {...stylex.attrs(shell.closedText)}>
            No open links. Press Invite to make one, and it opens here.
          </p>
        </div>{/if}
    </div>
  </section>
</div>
