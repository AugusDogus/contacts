<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './people.stylex.ts';
  import { Plus, Search, Star, Hourglass, Cake } from '@lucide/svelte';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { Contact } from '#lib/contact.ts';
  import Avatar from '#lib/components/Avatar.svelte';
  import ContactStack from '#lib/components/ContactStack.svelte';
  import InviteDialog from '#lib/components/InviteDialog.svelte';
  import ContactDetail from '#lib/components/ContactDetail.svelte';
  type View = 'all' | 'favorites' | 'recent';
  const WEEK = 7 * 86_400_000;
  let book = $derived(await getAddressBook());
  let search = $state('');
  let view = $state<View>('all');
  let sort = $state<'name' | 'recent'>('name');
  let inviteOpen = $state(false);
  let selectedId = $state<string | null>(null);
  let selected = $derived(book.contacts.find((contact) => contact.id === selectedId));
  let openInvitations = $derived(
    book.invitations.filter((i) => i.status === 'pending' && i.expiresAt > Date.now()).length
  );
  let views = $derived(
    [
      { id: 'all', label: 'All', count: book.contacts.length },
      {
        id: 'favorites',
        label: 'Favorites',
        count: book.contacts.filter((c) => c.favorite).length
      },
      {
        id: 'recent',
        label: 'New this week',
        count: book.contacts.filter((c) => Date.now() - c.createdAt < WEEK).length
      }
    ].filter(
      (option): option is { id: View; label: string; count: number } =>
        option.id === 'all' || (option.count > 0 && option.count < book.contacts.length)
    )
  );
  let activeView = $derived(views.some((option) => option.id === view) ? view : 'all');
  let upcoming = $derived(
    book.contacts
      .map((contact) => ({ contact, days: Contact.daysUntilBirthday(contact.data.birthday) }))
      .filter(({ days }) => days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 4)
  );
  let filtered = $derived(
    book.contacts
      .filter((contact) => {
        const { email, phone, city } = contact.data;
        const text = `${Contact.name(contact.data)} ${email} ${phone} ${city}`.toLowerCase();
        return (
          text.includes(search.trim().toLowerCase()) &&
          (activeView !== 'favorites' || contact.favorite) &&
          (activeView !== 'recent' || Date.now() - contact.createdAt < WEEK)
        );
      })
      .sort((a, b) =>
        sort === 'name'
          ? Contact.name(a.data).localeCompare(Contact.name(b.data))
          : b.createdAt - a.createdAt
      )
  );
  const when = (days: number, birthday: string) =>
    days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : Contact.birthdayLabel(birthday);
</script>

<svelte:head><title>People | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <h1>People</h1>
  {#if book.contacts.length}<button
      {...stylex.attrs(ui.button, ui.primary)}
      onclick={() => (inviteOpen = true)}><Plus size={17} />Invite someone</button
    >{/if}
</div>

{#if !book.contacts.length}
  <section {...stylex.attrs(ui.panel, styles.start)} aria-labelledby="start-title">
    {#if openInvitations}
      <span {...stylex.attrs(ui.emptyIcon)}><Hourglass size={24} /></span>
      <h2 id="start-title">Waiting for replies</h2>
      <p {...stylex.attrs(ui.emptyText)}>
        You have {openInvitations === 1
          ? 'one open invitation'
          : `${openInvitations} open invitations`}. People appear here as soon as they add their
        details.
      </p>
      <div {...stylex.attrs(styles.startActions)}>
        <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
          ><Plus size={17} />Invite someone</button
        ><a {...stylex.attrs(ui.button)} href="/invitations">See invitations</a>
      </div>
    {:else}
      <ContactStack width={220} />
      <h2 id="start-title">Start your address book</h2>
      <p {...stylex.attrs(ui.emptyText)}>
        Send someone a private link. They fill in their own contact details, and they show up here.
      </p>
      <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
        ><Plus size={17} />Invite someone</button
      >
    {/if}
  </section>
{:else}
  {#if upcoming.length}<section {...stylex.attrs(styles.birthdays)} aria-labelledby="birthdays">
      <h2 id="birthdays" {...stylex.attrs(styles.birthdaysTitle)}>
        <Cake size={16} />Birthdays soon
      </h2>
      <ul {...stylex.attrs(styles.birthdayList)}>
        {#each upcoming as { contact, days } (contact.id)}<li>
            <button {...stylex.attrs(styles.birthday)} onclick={() => (selectedId = contact.id)}
              ><Avatar person={contact.data} size={28} /><span
                >{contact.data.firstName}
                <span {...stylex.attrs(ui.muted)}>{when(days, contact.data.birthday)}</span></span
              ></button
            >
          </li>{/each}
      </ul>
    </section>{/if}

  <div {...stylex.attrs(styles.toolbar)}>
    <label {...stylex.attrs(styles.searchBox)}
      ><Search size={17} /><span {...stylex.attrs(ui.srOnly)}>Search people</span><input
        {...stylex.attrs(styles.searchInput)}
        type="search"
        placeholder="Search"
        bind:value={search}
      /></label
    >
    {#if views.length > 1}<div {...stylex.attrs(ui.segmented)} role="group" aria-label="Show">
        {#each views as option (option.id)}<button
            {...stylex.attrs(ui.segment, activeView === option.id && ui.segmentOn)}
            aria-pressed={activeView === option.id}
            onclick={() => (view = option.id)}>{option.label}</button
          >{/each}
      </div>{/if}
    {#if book.contacts.length > 1}<label {...stylex.attrs(styles.sort)}
        ><span {...stylex.attrs(ui.srOnly)}>Sort by</span><select
          {...stylex.attrs(styles.sortSelect)}
          bind:value={sort}
          ><option value="name">Name</option><option value="recent">Newest</option></select
        ></label
      >{/if}
  </div>

  <section {...stylex.attrs(ui.panel)} aria-label="Contacts">
    {#if filtered.length}<ul {...stylex.attrs(styles.list)}>
        {#each filtered as contact (contact.id)}<li {...stylex.attrs(styles.item)}>
            <button {...stylex.attrs(styles.row)} onclick={() => (selectedId = contact.id)}
              ><Avatar person={contact.data} size={40} /><span {...stylex.attrs(styles.who)}
                ><span {...stylex.attrs(styles.name)}
                  >{Contact.name(contact.data)}{#if contact.favorite}<span
                      {...stylex.attrs(styles.favorite)}
                      ><Star size={13} fill="currentColor" /><span {...stylex.attrs(ui.srOnly)}
                        >Favorite</span
                      ></span
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
        <h2>No matches{search.trim() ? ` for “${search.trim()}”` : ''}</h2>
        <p {...stylex.attrs(ui.emptyText)}>Try a different name, email, or city.</p>
        <button
          {...stylex.attrs(ui.textButton)}
          onclick={() => {
            search = '';
            view = 'all';
          }}>Show everyone</button
        >
      </div>{/if}
  </section>
  {#if openInvitations}<p {...stylex.attrs(styles.footnote)}>
      {openInvitations === 1 ? 'One invitation is' : `${openInvitations} invitations are`} still open.
      <a href="/invitations">See invitations</a>
    </p>{/if}
{/if}
{#if inviteOpen}<InviteDialog onclose={() => (inviteOpen = false)} />{/if}
{#if selected}<ContactDetail contact={selected} onclose={() => (selectedId = null)} />{/if}
