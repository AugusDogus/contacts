<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ContactDetail.stylex.ts';
  import { Download } from '@lucide/svelte';
  import { Contact } from '#lib/contact.ts';
  import { deleteContact } from '#lib/contacts.remote.ts';
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
      data.street2,
      [data.city, data.region, data.postalCode].filter(Boolean).join(', '),
      data.country
    ]
      .filter(Boolean)
      .join('\n')
  );
  let added = $derived(
    [
      `Added ${new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      contact.source &&
        `with link ${contact.source.label ? `“${contact.source.label}” ` : ''}#${contact.source.reference}`
    ]
      .filter(Boolean)
      .join(' ')
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
    <Avatar person={data} size={56} />
    <p {...stylex.attrs(styles.topText)}>
      {[data.pronouns, data.company].filter(Boolean).join(' · ')}
    </p>
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
    {#if data.website}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Website</dt>
        <dd {...stylex.attrs(styles.value)}>
          <a href={data.website} target="_blank" rel="noopener noreferrer">{data.website}</a>
        </dd>
      </div>{/if}
    {#each data.custom as answer (answer.id)}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>{answer.label}</dt>
        <dd {...stylex.attrs(styles.value)}>{answer.value}</dd>
      </div>{/each}
    {#if data.notes}<div {...stylex.attrs(styles.row)}>
        <dt {...stylex.attrs(styles.term)}>Notes</dt>
        <dd {...stylex.attrs(styles.value, styles.lines)}>{data.notes}</dd>
      </div>{/if}
  </dl>
  <p {...stylex.attrs(styles.source)}>{added}</p>
  {#if confirming}<div {...stylex.attrs(styles.confirm)} role="alert">
      <p>Remove {data.firstName}? This can’t be undone.</p>
      <div {...stylex.attrs(styles.actions)}>
        <button {...stylex.attrs(ui.button, ui.small)} onclick={() => (confirming = false)}
          >Cancel</button
        ><button
          {...stylex.attrs(ui.button, ui.small, ui.danger)}
          disabled={deleting}
          onclick={remove}>{deleting ? 'Removing…' : 'Remove'}</button
        >
      </div>
    </div>{:else}<div {...stylex.attrs(styles.actions, styles.footer)}>
      <button {...stylex.attrs(ui.textButton, styles.remove)} onclick={() => (confirming = true)}
        >Remove</button
      ><a {...stylex.attrs(ui.button, ui.small)} href="/export?id={contact.id}" download
        ><Download size={14} />vCard</a
      >
    </div>{/if}
</Modal>
