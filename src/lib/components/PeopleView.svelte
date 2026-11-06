<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './PeopleView.stylex.ts';
  import { Download, Plus, Search } from '@lucide/svelte';
  import { Contact } from '#lib/contact.ts';
  import type { AddressBookActions, PeopleBook } from '#lib/address-book-actions.ts';
  import Avatar from './Avatar.svelte';
  import ContactStack from './ContactStack.svelte';
  import InviteDialog from './InviteDialog.svelte';
  import ContactDetail from './ContactDetail.svelte';
  import PendingInvitations from './PendingInvitations.svelte';
  let {
    book,
    actions,
    level = 1
  }: {
    book: PeopleBook;
    actions: AddressBookActions;
    /** The title's heading level: 1 as its own page, 3 inside the landing page. */
    level?: 1 | 3;
  } = $props();
  let sub: 2 | 4 = $derived(level === 1 ? 2 : 4);
  const WEEK = 7 * 86_400_000;
  let search = $state('');
  let inviteOpen = $state(false);
  let selectedId = $state<string | null>(null);
  let selected = $derived(book.contacts.find((contact) => contact.id === selectedId));
  let matches = $derived(
    book.contacts
      .filter((contact) => {
        const { email, phone, city, custom } = contact.data;
        const answers = custom.map(({ value }) => value).join(' ');
        const text =
          `${Contact.name(contact.data)} ${email} ${phone} ${city} ${answers}`.toLowerCase();
        return text.includes(search.trim().toLowerCase());
      })
      .sort((a, b) => Contact.name(a.data).localeCompare(Contact.name(b.data)))
  );
</script>

<div {...stylex.attrs(ui.pageHeading)}>
  <svelte:element this={`h${level}`} {...stylex.attrs(styles.heading)}>
    People{#if book.contacts.length}<span {...stylex.attrs(ui.count)}>{book.contacts.length}</span
      >{/if}
  </svelte:element>
  {#if book.contacts.length || book.invitations.length}<div {...stylex.attrs(styles.actions)}>
      {#if book.contacts.length && actions.exportHref}<a
          {...stylex.attrs(ui.button)}
          href={actions.exportHref}
          aria-label="Export"
          ><Download size={16} /><span {...stylex.attrs(styles.wideOnly)}>Export</span></a
        >{/if}<button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
        ><Plus size={16} />Invite</button
      >
    </div>{/if}
</div>

{#if book.invitations.length}<PendingInvitations
    invitations={book.invitations}
    slug={book.profile.slug}
    {actions}
    level={sub}
  />{/if}

{#if !book.contacts.length}
  {#if book.invitations.length}<p {...stylex.attrs(styles.quiet)}>
      People show up here when they reply.
    </p>{:else}<section {...stylex.attrs(ui.panel, ui.emptyState)} aria-labelledby="start-title">
      <ContactStack width={200} />
      <svelte:element this={`h${sub}`} id="start-title">Start your address book</svelte:element>
      <p {...stylex.attrs(ui.emptyText)}>
        Send a friend a private link. They fill in their own details, and they show up here.
      </p>
      <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
        ><Plus size={16} />Create a link</button
      >
    </section>{/if}
{:else}
  {#if book.invitations.length}<svelte:element
      this={`h${sub}`}
      {...stylex.attrs(styles.sectionTitle)}>Contacts</svelte:element
    >{/if}
  {#if book.contacts.length > 6}<label {...stylex.attrs(styles.searchBox)}
      ><Search size={16} /><span {...stylex.attrs(ui.srOnly)}>Search people</span><input
        {...stylex.attrs(styles.searchInput)}
        type="search"
        placeholder="Search"
        bind:value={search}
      /></label
    >{/if}

  <section {...stylex.attrs(ui.panel)} aria-label="Contacts">
    {#if matches.length}<ul {...stylex.attrs(styles.list)}>
        {#each matches as contact (contact.id)}<li {...stylex.attrs(styles.item)}>
            <button {...stylex.attrs(styles.row)} onclick={() => (selectedId = contact.id)}
              ><Avatar person={contact.data} size={36} /><span {...stylex.attrs(styles.who)}
                ><span {...stylex.attrs(styles.name)}
                  >{Contact.name(contact.data)}{#if Date.now() - contact.createdAt < WEEK}<span
                      {...stylex.attrs(ui.badge, styles.new)}>New</span
                    >{/if}</span
                ><span {...stylex.attrs(styles.secondary)}
                  >{contact.data.email || contact.data.phone}</span
                ></span
              >{#if contact.data.city}<span {...stylex.attrs(styles.place)}
                  >{contact.data.city}</span
                >{/if}</button
            >
          </li>{/each}
      </ul>{:else}<div {...stylex.attrs(ui.emptyState)}>
        <p {...stylex.attrs(ui.emptyText)}>No one matches “{search.trim()}”</p>
        <button {...stylex.attrs(ui.textButton)} onclick={() => (search = '')}>Clear search</button>
      </div>{/if}
  </section>
{/if}
{#if inviteOpen}<InviteDialog
    form={book.profile.form}
    slug={book.profile.slug}
    {actions}
    onclose={() => (inviteOpen = false)}
  />{/if}
{#if selected}<ContactDetail
    contact={selected}
    {actions}
    onclose={() => (selectedId = null)}
  />{/if}
