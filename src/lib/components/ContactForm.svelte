<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ContactForm.stylex.ts';
  import { Contact, contactInput, type ContactInput } from '#lib/contact.ts';
  import { Camera } from '@lucide/svelte';
  import Avatar from './Avatar.svelte';
  type Result = { ok: true } | { ok: false; message: string };
  let {
    initial = Contact.empty(),
    recipient,
    buttonLabel = 'Save',
    onsave
  }: {
    initial?: ContactInput;
    recipient?: string;
    buttonLabel?: string;
    onsave: (contact: ContactInput) => Promise<Result>;
  } = $props();
  let value = $state<ContactInput>(untrack(() => ({ ...initial })));
  let busy = $state(false);
  let photoBusy = $state(false);
  let error = $state('');
  let ready = $state(false);
  onMount(() => {
    ready = true;
  });
  async function photo(file: File | undefined) {
    if (!file) return;
    error = '';
    photoBusy = true;
    try {
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 10_000_000
      ) {
        error = 'Choose a JPEG, PNG, or WebP photo under 10 MB.';
        return;
      }
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 384;
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        error = 'Your browser couldn’t prepare this photo. Try another one, or skip it.';
        return;
      }
      const side = Math.min(bitmap.width, bitmap.height);
      context.drawImage(
        bitmap,
        (bitmap.width - side) / 2,
        (bitmap.height - side) / 2,
        side,
        side,
        0,
        0,
        384,
        384
      );
      bitmap.close();
      value.photo = canvas.toDataURL('image/jpeg', 0.85);
    } catch {
      error = 'That photo couldn’t be opened. Try another one, or skip it.';
    } finally {
      photoBusy = false;
    }
  }
  async function save(form: HTMLFormElement) {
    error = '';
    const parsed = contactInput.safeParse(value);
    if (!parsed.success) {
      error = parsed.error.issues[0]?.message || 'Check your details.';
      const field = form.elements.namedItem(String(parsed.error.issues[0]?.path[0]));
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    busy = true;
    try {
      const result = await onsave(parsed.data);
      if (!result.ok) error = result.message;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Your details weren’t saved. Everything you typed is still here. Try again.';
    } finally {
      busy = false;
    }
  }
</script>

<form
  method="POST"
  {...stylex.attrs(styles.form)}
  onsubmit={(event) => {
    event.preventDefault();
    void save(event.currentTarget);
  }}
>
  <div {...stylex.attrs(styles.photoRow)}>
    <label {...stylex.attrs(styles.photoPick)}
      >{#if value.photo}<Avatar person={value} size={56} />{:else}<span
          {...stylex.attrs(styles.photoPlaceholder)}><Camera size={20} strokeWidth={1.6} /></span
        >{/if}<span {...stylex.attrs(styles.photoText)}
        >{photoBusy ? 'Preparing…' : value.photo ? 'Change photo' : 'Add a photo'}</span
      ><input
        {...stylex.attrs(ui.srOnly)}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onchange={(event) => void photo(event.currentTarget.files?.[0])}
        disabled={busy || photoBusy}
      /></label
    >{#if value.photo}<button
        type="button"
        {...stylex.attrs(ui.textButton, styles.photoRemove)}
        onclick={() => (value.photo = '')}>Remove</button
      >{/if}
  </div>
  <div {...stylex.attrs(ui.formGrid)}>
    <label
      >First name<input
        {...stylex.attrs(ui.input)}
        name="firstName"
        autocomplete="given-name"
        bind:value={value.firstName}
        required
        maxlength="80"
      /></label
    ><label
      >Last name<input
        {...stylex.attrs(ui.input)}
        name="lastName"
        autocomplete="family-name"
        bind:value={value.lastName}
        required
        maxlength="80"
      /></label
    ><label
      >Email<input
        {...stylex.attrs(ui.input)}
        name="email"
        type="email"
        autocomplete="email"
        bind:value={value.email}
        maxlength="254"
      /></label
    ><label
      >Phone<input
        {...stylex.attrs(ui.input)}
        name="phone"
        type="tel"
        autocomplete="tel"
        bind:value={value.phone}
        maxlength="40"
      /></label
    >
  </div>
  <fieldset {...stylex.attrs(styles.section)}>
    <legend {...stylex.attrs(styles.sectionTitle)}>Address</legend>
    <div {...stylex.attrs(ui.formGrid)}>
      <label {...stylex.attrs(ui.span2)}
        >Street<input
          {...stylex.attrs(ui.input)}
          name="street"
          autocomplete="street-address"
          bind:value={value.street}
          maxlength="200"
        /></label
      ><label
        >City<input
          {...stylex.attrs(ui.input)}
          name="city"
          autocomplete="address-level2"
          bind:value={value.city}
          maxlength="100"
        /></label
      ><label
        >State or region<input
          {...stylex.attrs(ui.input)}
          name="region"
          autocomplete="address-level1"
          bind:value={value.region}
          maxlength="100"
        /></label
      ><label
        >Postal code<input
          {...stylex.attrs(ui.input)}
          name="postalCode"
          autocomplete="postal-code"
          bind:value={value.postalCode}
          maxlength="30"
        /></label
      ><label
        >Country<input
          {...stylex.attrs(ui.input)}
          name="country"
          autocomplete="country-name"
          bind:value={value.country}
          maxlength="100"
        /></label
      >
    </div>
  </fieldset>
  <fieldset {...stylex.attrs(styles.section)}>
    <legend {...stylex.attrs(styles.sectionTitle)}>More</legend>
    <div {...stylex.attrs(ui.formGrid)}>
      <label
        >Birthday<input
          {...stylex.attrs(ui.input)}
          name="birthday"
          type="date"
          min="1900-01-01"
          max={new Date().toISOString().slice(0, 10)}
          autocomplete="bday"
          bind:value={value.birthday}
        /></label
      ><label
        >Pronouns<input
          {...stylex.attrs(ui.input)}
          name="pronouns"
          bind:value={value.pronouns}
          maxlength="60"
        /></label
      ><label
        >Company<input
          {...stylex.attrs(ui.input)}
          name="company"
          autocomplete="organization"
          bind:value={value.company}
          maxlength="100"
        /></label
      ><label
        >Website<input
          {...stylex.attrs(ui.input)}
          name="website"
          type="url"
          autocomplete="url"
          bind:value={value.website}
          maxlength="500"
          placeholder="https://"
        /></label
      ><label {...stylex.attrs(ui.span2)}
        >Notes<textarea
          {...stylex.attrs(ui.input)}
          name="notes"
          bind:value={value.notes}
          maxlength="2000"
          rows="2"></textarea></label
      >
    </div>
  </fieldset>
  {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
  <div {...stylex.attrs(styles.submit)}>
    <button {...stylex.attrs(ui.button, ui.primary, ui.full)} disabled={!ready || busy || photoBusy}
      >{busy
        ? recipient
          ? 'Sending…'
          : 'Saving…'
        : recipient
          ? `Send to ${recipient}`
          : buttonLabel}</button
    >
    {#if recipient}<p {...stylex.attrs(styles.saveNote)}>
        {recipient} can save and export these details.
      </p>{/if}
  </div>
  <noscript><p>Turn on JavaScript to send your details.</p></noscript>
</form>
