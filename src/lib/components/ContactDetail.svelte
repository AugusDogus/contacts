<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ContactDetail.stylex.ts';

  import {
    Mail,
    Phone,
    MapPin,
    Cake,
    Globe,
    Building2,
    Download,
    Trash2,
    Star,
    MessageSquare
  } from '@lucide/svelte';
  import { Contact } from '#lib/contact.ts';
  import { deleteContact, setFavorite } from '#lib/contacts.remote.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  import Modal from './Modal.svelte';
  import Avatar from './Avatar.svelte';
  let { contact, onclose }: { contact: Contact; onclose: () => void } = $props();
  let confirming = $state(false);
  let deleting = $state(false);
  async function remove() {
    deleting = true;
    try {
      await deleteContact(contact.id);
      notify('Contact removed from your address book');
      onclose();
    } catch (cause) {
      failure(cause);
    } finally {
      deleting = false;
    }
  }
</script>

<Modal title="Contact card" {onclose}>
  <div {...stylex.attrs(styles.personHeader)}>
    <Avatar person={contact.data} size={78} />
    <h2>{Contact.name(contact.data)}</h2>
    {#if contact.data.pronouns}<p {...stylex.attrs(ui.muted, ui.tiny)}>
        {contact.data.pronouns}
      </p>{/if}<button
      {...stylex.attrs(styles.favoriteButton)}
      aria-pressed={contact.favorite}
      onclick={async () => {
        try {
          await setFavorite({ id: contact.id, favorite: !contact.favorite });
        } catch (cause) {
          failure(cause);
        }
      }}
      ><Star size={14} fill={contact.favorite ? 'currentColor' : 'none'} />{contact.favorite
        ? 'Favorite'
        : 'Add to favorites'}</button
    >
  </div>
  <div {...stylex.attrs(styles.details)}>
    {#if contact.data.email}<div {...stylex.attrs(styles.detailRow)}>
        <Mail size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>Email address</small><a
            href="mailto:{contact.data.email}">{contact.data.email}</a
          ></span
        >
      </div>{/if}
    {#if contact.data.phone}<div {...stylex.attrs(styles.detailRow)}>
        <Phone size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>Phone number</small><a
            href="tel:{contact.data.phone}">{contact.data.phone}</a
          ></span
        >
      </div>{/if}
    {#if contact.data.street || contact.data.city}<div {...stylex.attrs(styles.detailRow)}>
        <MapPin size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>Address</small>{contact.data.street}<br />{[
            contact.data.city,
            contact.data.region,
            contact.data.postalCode
          ]
            .filter(Boolean)
            .join(', ')}{#if contact.data.country}<br />{contact.data.country}{/if}</span
        >
      </div>{/if}
    {#if contact.data.birthday}<div {...stylex.attrs(styles.detailRow)}>
        <Cake size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>Birthday</small>{Contact.birthdayLabel(
            contact.data.birthday
          )}<span {...stylex.attrs(ui.muted)}>, {contact.data.birthday.slice(0, 4)}</span></span
        >
      </div>{/if}
    {#if contact.data.company}<div {...stylex.attrs(styles.detailRow)}>
        <Building2 size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>Company</small>{contact.data.company}</span
        >
      </div>{/if}
    {#if contact.data.website}<div {...stylex.attrs(styles.detailRow)}>
        <Globe size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>Website</small><a
            href={contact.data.website}
            target="_blank"
            rel="noopener noreferrer">{contact.data.website}</a
          ></span
        >
      </div>{/if}
    {#if contact.data.notes}<div {...stylex.attrs(styles.detailRow)}>
        <MessageSquare size={17} /><span {...stylex.attrs(styles.detailText)}
          ><small {...stylex.attrs(styles.detailLabel)}>A little more about me</small><span
            {...stylex.attrs(styles.notes)}>{contact.data.notes}</span
          ></span
        >
      </div>{/if}
  </div>
  {#if confirming}<div {...stylex.attrs(styles.removeConfirm)}>
      <p>
        Remove {contact.data.firstName} from your address book? This cannot be undone. Their invitation
        will stay used.
      </p>
      <div {...stylex.attrs(styles.confirmActions)}>
        <button {...stylex.attrs(ui.button)} onclick={() => (confirming = false)}
          >Keep contact</button
        ><button {...stylex.attrs(ui.button, ui.danger)} disabled={deleting} onclick={remove}
          >{deleting ? 'Removing…' : 'Remove contact'}</button
        >
      </div>
    </div>{:else}<div {...stylex.attrs(styles.detailActions)}>
      <a {...stylex.attrs(ui.button)} href="/export?id={contact.id}" download
        ><Download size={15} />Download vCard</a
      ><button
        {...stylex.attrs(ui.iconButton)}
        aria-label="Remove contact"
        onclick={() => (confirming = true)}><Trash2 size={17} /></button
      >
    </div>{/if}
</Modal>
