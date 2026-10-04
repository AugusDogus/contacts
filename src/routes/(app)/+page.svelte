<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './people.stylex.ts';
  import { Download, Plus, Search, Star } from '@lucide/svelte';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { Contact } from '#lib/contact.ts';
  import Avatar from '#lib/components/Avatar.svelte';
  import ContactStack from '#lib/components/ContactStack.svelte';
  import InviteDialog from '#lib/components/InviteDialog.svelte';
  import ContactDetail from '#lib/components/ContactDetail.svelte';
  import PendingInvitations from '#lib/components/PendingInvitations.svelte';
  const WEEK = 7 * 86_400_000;
  let book = $derived(await getAddressBook());
  let search = $state('');
  let inviteOpen = $state(false);
  let selectedId = $state<string | null>(null);
  let selected = $derived(book.contacts.find((contact) => contact.id === selectedId));
  let upcoming = $derived(
    book.contacts
      .map((contact) => ({ contact, days: Contact.daysUntilBirthday(contact.data.birthday) }))
      .filter(({ days }) => days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 4)
  );
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
  // Favorites lead the list, but searching shows one flat set of results.
  let groups = $derived(
    search.trim()
      ? [{ title: '', contacts: matches }]
      : [
          { title: 'Favorites', contacts: matches.filter((contact) => contact.favorite) },
          { title: 'Everyone', contacts: matches.filter((contact) => !contact.favorite) }
        ].filter((group) => group.contacts.length)
  );
  let showTitles = $derived(groups.length > 1);
  const when = (days: number, birthday: string) =>
    days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : Contact.birthdayLabel(birthday);
</script>

<svelte:head><title>People | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <h1>
    People{#if book.contacts.length}<span {...stylex.attrs(ui.count)}>{book.contacts.length}</span
      >{/if}
  </h1>
  {#if book.contacts.length || book.invitations.length}<div {...stylex.attrs(styles.actions)}>
      {#if book.contacts.length}<a {...stylex.attrs(ui.button)} href="/google" aria-label="Export"
          ><Download size={16} /><span {...stylex.attrs(styles.wideOnly)}>Export</span></a
        >{/if}<button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
        ><Plus size={16} />Invite</button
      >
    </div>{/if}
</div>

{#if book.invitations.length}<PendingInvitations
    invitations={book.invitations}
    slug={book.profile.slug}
  />{/if}

{#if !book.contacts.length}
  {#if book.invitations.length}<p {...stylex.attrs(styles.quiet)}>
      People show up here when they reply.
    </p>{:else}<section {...stylex.attrs(ui.panel, ui.emptyState)} aria-labelledby="start-title">
      <ContactStack width={200} />
      <h2 id="start-title">Start your address book</h2>
      <p {...stylex.attrs(ui.emptyText)}>
        Send a friend a private link. They fill in their own details, and they show up here.
      </p>
      <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
        ><Plus size={16} />Create a link</button
      >
    </section>{/if}
{:else}
  {#if book.invitations.length}<h2 {...stylex.attrs(styles.sectionTitle)}>Contacts</h2>{/if}
  {#if book.contacts.length > 6}<label {...stylex.attrs(styles.searchBox)}
      ><Search size={16} /><span {...stylex.attrs(ui.srOnly)}>Search people</span><input
        {...stylex.attrs(styles.searchInput)}
        type="search"
        placeholder="Search"
        bind:value={search}
      /></label
    >{/if}

  {#if upcoming.length && !search.trim()}<section
      {...stylex.attrs(styles.birthdays)}
      aria-labelledby="birthdays"
    >
      <h3 id="birthdays" {...stylex.attrs(styles.birthdaysTitle)}>Birthdays</h3>
      <ul {...stylex.attrs(styles.birthdayList)}>
        {#each upcoming as { contact, days } (contact.id)}<li>
            <button {...stylex.attrs(styles.birthday)} onclick={() => (selectedId = contact.id)}
              ><Avatar person={contact.data} size={22} /><span
                >{contact.data.firstName}
                <span {...stylex.attrs(ui.muted)}>{when(days, contact.data.birthday)}</span></span
              ></button
            >
          </li>{/each}
      </ul>
    </section>{/if}

  <section {...stylex.attrs(ui.panel)} aria-label="Contacts">
    {#if matches.length}{#each groups as group (group.title)}
        {#if showTitles}<h3 {...stylex.attrs(styles.groupTitle)}>{group.title}</h3>{/if}
        <ul {...stylex.attrs(styles.list)}>
          {#each group.contacts as contact (contact.id)}<li {...stylex.attrs(styles.item)}>
              <button {...stylex.attrs(styles.row)} onclick={() => (selectedId = contact.id)}
                ><Avatar person={contact.data} size={36} /><span {...stylex.attrs(styles.who)}
                  ><span {...stylex.attrs(styles.name)}
                    >{Contact.name(contact.data)}{#if contact.favorite && !showTitles}<span
                        {...stylex.attrs(styles.favorite)}
                        ><Star size={12} fill="currentColor" /><span {...stylex.attrs(ui.srOnly)}
                          >Favorite</span
                        ></span
                      >{/if}{#if Date.now() - contact.createdAt < WEEK}<span
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
        </ul>
      {/each}{:else}<div {...stylex.attrs(ui.emptyState)}>
        <p {...stylex.attrs(ui.emptyText)}>No one matches “{search.trim()}”</p>
        <button {...stylex.attrs(ui.textButton)} onclick={() => (search = '')}>Clear search</button>
      </div>{/if}
  </section>
{/if}
{#if inviteOpen}<InviteDialog onclose={() => (inviteOpen = false)} />{/if}
{#if selected}<ContactDetail contact={selected} onclose={() => (selectedId = null)} />{/if}
