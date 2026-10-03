<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ContactDetail.stylex.ts';
  import { Download, Star } from '@lucide/svelte';
  import { Contact } from '#lib/contact.ts';
  import { deleteContact, setFavorite } from '#lib/contacts.remote.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  import Modal from './Modal.svelte';
  import Avatar from './Avatar.svelte';
  let { contact, onclose }: { contact: Contact; onclose: () => void } = $props();
  let confirming = $state(false);
  let deleting = $state(false);
  let data = $derived(contact.data);
  let place = $derived(
    [
      data.street,
      [data.city, data.region, data.postalCode].filter(Boolean).join(', '),
      data.country
    ]
      .filter(Boolean)
      .join('\n')
  );
  async function remove() {
    deleting = true;
    try {
      await deleteContact(contact.id);
      notify(`${Contact.name(data)} removed`);
      onclose();
    } catch (cause) {
      failure(cause);
    } finally {
      deleting = false;
    }
  }
</script>

<Modal title={Contact.name(data)} {onclose}>
  <div {...stylex.attrs(styles.top)}>
    <Avatar person={data} size={64} />
    <div {...stylex.attrs(styles.topText)}>
      {#if data.pronouns}<p {...stylex.attrs(ui.muted)}>{data.pronouns}</p>{/if}
      <button
        {...stylex.attrs(styles.favorite, contact.favorite && styles.favoriteOn)}
        aria-pressed={contact.favorite}
        onclick={async () => {
          try {
            await setFavorite({ id: contact.id, favorite: !contact.favorite });
          } catch (cause) {
            failure(cause);
          }
        }}><Star size={15} fill={contact.favorite ? 'currentColor' : 'none'} />Favorite</button
      >
    </div>
  </div>
  <dl {...stylex.attrs(styles.details)}>
    {#if data.email}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Email</dt>
        <dd {...stylex.attrs(styles.value)}><a href="mailto:{data.email}">{data.email}</a></dd>
      </div>{/if}
    {#if data.phone}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Phone</dt>
        <dd {...stylex.attrs(styles.value)}><a href="tel:{data.phone}">{data.phone}</a></dd>
      </div>{/if}
    {#if place}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Address</dt>
        <dd {...stylex.attrs(styles.value, styles.lines)}>{place}</dd>
      </div>{/if}
    {#if data.birthday}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Birthday</dt>
        <dd {...stylex.attrs(styles.value)}>
          {Contact.birthdayLabel(data.birthday)}, {data.birthday.slice(0, 4)}
        </dd>
      </div>{/if}
    {#if data.company}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Company</dt>
        <dd {...stylex.attrs(styles.value)}>{data.company}</dd>
      </div>{/if}
    {#if data.website}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Website</dt>
        <dd {...stylex.attrs(styles.value)}>
          <a href={data.website} target="_blank" rel="noopener noreferrer">{data.website}</a>
        </dd>
      </div>{/if}
    {#if data.notes}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Notes</dt>
        <dd {...stylex.attrs(styles.value, styles.lines)}>{data.notes}</dd>
      </div>{/if}
  </dl>
  {#if confirming}<div {...stylex.attrs(styles.confirm)} role="alert">
      <p>Remove {data.firstName} from your address book? This can’t be undone.</p>
      <div {...stylex.attrs(styles.actions)}>
        <button {...stylex.attrs(ui.button, ui.danger)} disabled={deleting} onclick={remove}
          >{deleting ? 'Removing…' : 'Remove'}</button
        ><button {...stylex.attrs(ui.button)} onclick={() => (confirming = false)}>Cancel</button>
      </div>
    </div>{:else}<div {...stylex.attrs(styles.actions, styles.footer)}>
      <a {...stylex.attrs(ui.button)} href="/export?id={contact.id}" download
        ><Download size={16} />Download vCard</a
      ><button {...stylex.attrs(ui.textButton, styles.remove)} onclick={() => (confirming = true)}
        >Remove</button
      >
    </div>{/if}
</Modal>
