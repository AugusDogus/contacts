<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './people.stylex.ts';

  import {
    Users,
    Plus,
    Download,
    Search,
    ArrowDownWideNarrow,
    Star,
    Cake,
    ArrowUpRight,
    ChevronRight,
    Link,
    ShieldCheck
  } from '@lucide/svelte';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { Contact } from '#lib/contact.ts';
  import Avatar from '#lib/components/Avatar.svelte';
  import ContactStack from '#lib/components/ContactStack.svelte';
  import InviteDialog from '#lib/components/InviteDialog.svelte';
  import ContactDetail from '#lib/components/ContactDetail.svelte';
  let book = $derived(await getAddressBook());
  let search = $state('');
  let filter = $state('all');
  let sort = $state('name');
  let inviteOpen = $state(false);
  let selectedId = $state<string | null>(null);
  let selected = $derived(book.contacts.find((contact) => contact.id === selectedId));
  let upcoming = $derived(
    book.contacts
      .filter((c) => c.data.birthday)
      .sort(
        (a, b) =>
          Contact.daysUntilBirthday(a.data.birthday) - Contact.daysUntilBirthday(b.data.birthday)
      )
      .slice(0, 3)
  );
  let filtered = $derived(
    book.contacts
      .filter((contact) => {
        const matches = `${Contact.name(contact.data)} ${contact.data.email} ${contact.data.city}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return (
          matches &&
          (filter !== 'favorites' || contact.favorite) &&
          (filter !== 'recent' || Date.now() - contact.createdAt < 7 * 86_400_000)
        );
      })
      .sort((a, b) =>
        sort === 'name'
          ? Contact.name(a.data).localeCompare(Contact.name(b.data))
          : b.createdAt - a.createdAt
      )
  );
  let pending = $derived(
    book.invitations.filter((i) => i.status === 'pending' && i.expiresAt > Date.now()).length
  );
</script>

<svelte:head><title>Your people | Gather</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <div>
    <h1>Your people, in one place.</h1>
    <p {...stylex.attrs(ui.subtitle)}>Less asking for addresses. More keeping in touch.</p>
  </div>
  <div {...stylex.attrs(ui.headingActions)}>
    <a {...stylex.attrs(ui.button)} href="/export" download><Download size={16} />Export contacts</a
    ><button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
      ><Plus size={17} />Invite friends</button
    >
  </div>
</div>
<section {...stylex.attrs(styles.welcomeBanner)} aria-label="Invite your friends">
  <div {...stylex.attrs(styles.bannerContent)}>
    <div {...stylex.attrs(styles.bannerLabel)}>
      <span {...stylex.attrs(styles.bannerDot)}></span>A better way to stay connected
    </div>
    <h2 {...stylex.attrs(styles.bannerTitle)}>A little link.<br />A closer circle.</h2>
    <p {...stylex.attrs(styles.bannerText)}>
      Send a private invitation. Your friends add their details.<br
        {...stylex.attrs(styles.desktopBr)}
      /> Your address book takes care of the rest.
    </p>
    <button {...stylex.attrs(styles.bannerButton)} onclick={() => (inviteOpen = true)}
      >Create an invitation <ArrowUpRight size={15} /></button
    >
  </div>
  <div {...stylex.attrs(styles.artwork)}><ContactStack /></div>
</section>
<div {...stylex.attrs(styles.contentGrid)}>
  <section {...stylex.attrs(styles.peopleSection)} aria-label="Contacts">
    <div {...stylex.attrs(styles.sectionTop)}>
      <h2 {...stylex.attrs(styles.sectionTitle)}>
        Address book <span {...stylex.attrs(styles.count)}>{book.contacts.length}</span>
      </h2>
      <span {...stylex.attrs(styles.privateCaption)}
        ><ShieldCheck size={13} />Only you can see this</span
      >
    </div>
    <div {...stylex.attrs(ui.panel)}>
      <div {...stylex.attrs(styles.tabs)} role="group" aria-label="Filter contacts">
        <button
          {...stylex.attrs(styles.tab, filter === 'all' && styles.chosen)}
          aria-pressed={filter === 'all'}
          onclick={() => (filter = 'all')}
          >All people <span {...stylex.attrs(styles.tabCount)}>{book.contacts.length}</span></button
        ><button
          {...stylex.attrs(styles.tab, filter === 'favorites' && styles.chosen)}
          aria-pressed={filter === 'favorites'}
          onclick={() => (filter = 'favorites')}><Star size={13} />Favorites</button
        ><button
          {...stylex.attrs(styles.tab, filter === 'recent' && styles.chosen)}
          aria-pressed={filter === 'recent'}
          onclick={() => (filter = 'recent')}>Recently added</button
        >
      </div>
      <div {...stylex.attrs(styles.tableToolbar)}>
        <div {...stylex.attrs(styles.searchBox)}>
          <Search size={16} /><input
            {...stylex.attrs(ui.input, styles.searchInput)}
            aria-label="Search people"
            placeholder="Find a name, email, or city…"
            bind:value={search}
          /><span {...stylex.attrs(styles.searchHint)}>⌕</span>
        </div>
        <label {...stylex.attrs(styles.sortControl)}
          ><ArrowDownWideNarrow size={15} /><span {...stylex.attrs(ui.srOnly)}>Sort contacts</span
          ><select {...stylex.attrs(ui.input, styles.sortSelect)} bind:value={sort}
            ><option value="name">Name</option><option value="recent">Newest</option></select
          ></label
        >
      </div>
      {#if filtered.length}<div>
          <table {...stylex.attrs(styles.table)}>
            <thead
              ><tr
                ><th {...stylex.attrs(styles.th, styles.firstCell)}>Name</th><th
                  {...stylex.attrs(styles.th, styles.emailCell)}>Email address</th
                ><th {...stylex.attrs(styles.th, styles.locationCell)}>Location</th><th
                  {...stylex.attrs(styles.th, styles.lastCell)}
                  ><span {...stylex.attrs(ui.srOnly)}>Open card</span></th
                ></tr
              ></thead
            ><tbody
              >{#each filtered as contact}<tr {...stylex.attrs(styles.row)}
                  ><td {...stylex.attrs(styles.td, styles.firstCell)}
                    ><button
                      {...stylex.attrs(styles.personButton)}
                      onclick={() => (selectedId = contact.id)}
                      ><Avatar person={contact.data} size={39} /><span
                        ><strong {...stylex.attrs(styles.personName)}
                          >{Contact.name(contact.data)}{#if contact.favorite}<Star
                              size={10}
                              fill="currentColor"
                            />{/if}</strong
                        ><small {...stylex.attrs(styles.personPhone)}
                          >{contact.data.phone || 'Contact card'}</small
                        ></span
                      ></button
                    ></td
                  ><td {...stylex.attrs(styles.td, styles.emailCell)}
                    ><a
                      {...stylex.attrs(styles.tableEmail)}
                      href={contact.data.email ? `mailto:${contact.data.email}` : undefined}
                      >{contact.data.email || 'Not shared'}</a
                    ></td
                  ><td {...stylex.attrs(styles.td, styles.locationCell)}
                    ><span {...stylex.attrs(styles.location)}
                      >{contact.data.city || 'Not shared'}{#if contact.data.region}<span
                          {...stylex.attrs(styles.locationRegion)}>, {contact.data.region}</span
                        >{/if}</span
                    ></td
                  ><td {...stylex.attrs(styles.td, styles.lastCell)}
                    ><button
                      {...stylex.attrs(ui.iconButton)}
                      onclick={() => (selectedId = contact.id)}
                      aria-label="Open {Contact.name(contact.data)}’s card"
                      ><ChevronRight size={16} /></button
                    ></td
                  ></tr
                >{/each}</tbody
            >
          </table>
        </div>{:else}<div {...stylex.attrs(ui.emptyState)}>
          <span {...stylex.attrs(ui.emptyIcon)}><Users size={24} /></span>
          <h3>{search || filter !== 'all' ? 'No people found' : 'Your people belong here'}</h3>
          <p {...stylex.attrs(ui.emptyText)}>
            {search || filter !== 'all'
              ? 'Try another search or switch to all people.'
              : 'Send your first invitation. Your friend’s contact card will appear here when they fill it in.'}
          </p>
          {#if !search && filter === 'all'}<button
              {...stylex.attrs(ui.button, ui.primary)}
              onclick={() => (inviteOpen = true)}><Plus size={15} />Invite a friend</button
            >{/if}
        </div>{/if}
      <div {...stylex.attrs(styles.tableFooter)}>
        <span
          >{filtered.length}
          {filtered.length === 1 ? 'person' : 'people'}{filter !== 'all' || search
            ? ` of ${book.contacts.length}`
            : ' in your circle'}</span
        ><span {...stylex.attrs(styles.footerNote)}
          >Collected with a little help from your friends <span {...stylex.attrs(styles.tinyHeart)}
            >♡</span
          ></span
        >
      </div>
    </div>
    <div {...stylex.attrs(styles.googleNudge)}>
      <span {...stylex.attrs(styles.googleIcon)}>G</span>
      <div {...stylex.attrs(styles.nudgeText)}>
        <strong {...stylex.attrs(styles.nudgeTitle)}>Keep your phone in the loop.</strong>
        <p {...stylex.attrs(styles.nudgeDescription)}>
          Add your people to Google Contacts, or download a vCard for any address book.
        </p>
      </div>
      <a {...stylex.attrs(styles.nudgeLink)} href="/google" aria-label="Set up Google Contacts"
        ><ArrowUpRight size={19} /></a
      >
    </div>
  </section>
  <div {...stylex.attrs(styles.rightRail)}>
    <section {...stylex.attrs(styles.birthdayPanel, ui.panel)}>
      <div {...stylex.attrs(styles.railHeading)}>
        <span {...stylex.attrs(styles.cakeIcon)}><Cake size={19} strokeWidth={1.5} /></span>
        <h3 {...stylex.attrs(styles.railTitle)}>Coming up</h3>
      </div>
      <p {...stylex.attrs(styles.railDescription)}>A good reason to say hello.</p>
      {#if upcoming.length}<div {...stylex.attrs(styles.birthdayList)}>
          {#each upcoming as contact}<button
              {...stylex.attrs(styles.birthdayPerson)}
              onclick={() => (selectedId = contact.id)}
              ><Avatar person={contact.data} size={34} /><span
                {...stylex.attrs(styles.birthdayInfo)}
                ><strong {...stylex.attrs(styles.birthdayName)}
                  >{contact.data.firstName}'s birthday</strong
                ><small {...stylex.attrs(styles.birthdayDate)}
                  >{Contact.birthdayLabel(contact.data.birthday)}</small
                ></span
              ><span {...stylex.attrs(styles.daysUntil)}
                >{Contact.daysUntilBirthday(contact.data.birthday) === 0
                  ? 'Today'
                  : `${Contact.daysUntilBirthday(contact.data.birthday)}d`}</span
              ></button
            >{/each}
        </div>{:else}<p {...stylex.attrs(styles.railEmpty)}>
          Birthdays will appear here when your friends share them.
        </p>{/if}
      <div {...stylex.attrs(styles.birthdayNote)}>
        <span {...stylex.attrs(styles.birthdaySpark)}>✳</span> The little dates are the big ones.
      </div>
    </section>
    <section {...stylex.attrs(styles.invitationNote)}>
      <span {...stylex.attrs(styles.linkSymbol)}><Link size={18} /></span>
      <h3 {...stylex.attrs(styles.invitationTitle)}>
        {pending ? `${pending} invitations out in the world` : 'Your next hello starts here'}
      </h3>
      <p {...stylex.attrs(styles.invitationText)}>
        {pending
          ? 'A few more familiar faces could be joining your address book soon.'
          : 'Make a private link and send it to someone you’d like to stay close to.'}
      </p>
      <a {...stylex.attrs(styles.invitationLink)} href="/invitations"
        >View invitations <ArrowUpRight size={14} /></a
      >
      <div {...stylex.attrs(styles.noteCircles)}>
        <span {...stylex.attrs(styles.noteCircle)}>A</span><span
          {...stylex.attrs(styles.noteCircle)}>J</span
        ><span {...stylex.attrs(styles.noteCircle)}>+</span><span
          {...stylex.attrs(styles.noteCircle, styles.dottedCircle)}
        ></span>
      </div>
    </section>
  </div>
</div>
{#if inviteOpen}<InviteDialog slug={book.profile.slug} onclose={() => (inviteOpen = false)} />{/if}
{#if selected}<ContactDetail contact={selected} onclose={() => (selectedId = null)} />{/if}
