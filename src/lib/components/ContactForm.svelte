<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ContactForm.stylex.ts';
  import { Contact, contactInput, type ContactInput } from '#lib/contact.ts';
  import { Camera, MapPin, Heart, ArrowUpRight } from '@lucide/svelte';
  import Avatar from './Avatar.svelte';
  type Result = { ok: true } | { ok: false; message: string };
  let {
    initial = Contact.empty(),
    recipient,
    buttonLabel = 'Share my contact card',
    onsave
  }: {
    initial?: ContactInput;
    recipient?: string;
    buttonLabel?: string;
    onsave: (contact: ContactInput) => Promise<Result>;
  } = $props();
  let value = $state<ContactInput>(untrack(() => ({ ...initial })));
  let consent = $state(false);
  let busy = $state(false);
  let photoBusy = $state(false);
  let error = $state('');
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
        error =
          'Your browser could not prepare the photo. Try another browser or continue without it.';
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
      error = 'This photo could not be opened. Try another image or continue without it.';
    } finally {
      photoBusy = false;
    }
  }
  async function save(form: HTMLFormElement) {
    error = '';
    const parsed = contactInput.safeParse(value);
    if (!parsed.success) {
      error = parsed.error.issues[0]?.message || 'Check your contact details.';
      const field = form.elements.namedItem(String(parsed.error.issues[0]?.path[0]));
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    if (recipient && !consent) {
      error = 'Confirm that you want to share your details with your friend.';
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
          : 'Your card could not be saved. Your details are still here. Try again.';
    } finally {
      busy = false;
    }
  }
</script>

<form
  {...stylex.attrs(styles.form)}
  onsubmit={(event) => {
    event.preventDefault();
    void save(event.currentTarget);
  }}
>
  <div {...stylex.attrs(styles.photoRow)}>
    {#if value.photo}<Avatar person={value} size={64} />{:else}<span
        {...stylex.attrs(styles.photoPlaceholder)}><Camera size={22} strokeWidth={1.5} /></span
      >{/if}
    <div>
      <label {...stylex.attrs(styles.photoLabel)} for="contact-photo"
        >{photoBusy ? 'Preparing your photo…' : 'Add a face to the name'}
        <span {...stylex.attrs(styles.optional)}>(optional)</span></label
      >
      <p {...stylex.attrs(styles.photoHelp)}>JPEG, PNG, or WebP. We’ll take care of the size.</p>
      <input
        {...stylex.attrs(styles.file)}
        id="contact-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onchange={(event) => void photo(event.currentTarget.files?.[0])}
        disabled={busy || photoBusy}
      />{#if value.photo}<button
          type="button"
          {...stylex.attrs(ui.button, ui.small)}
          onclick={() => (value.photo = '')}>Remove photo</button
        >{/if}
    </div>
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
        placeholder="Jamie"
      /></label
    ><label
      >Last name<input
        {...stylex.attrs(ui.input)}
        name="lastName"
        autocomplete="family-name"
        bind:value={value.lastName}
        required
        maxlength="80"
        placeholder="Chen"
      /></label
    ><label
      >Email address<input
        {...stylex.attrs(ui.input)}
        name="email"
        type="email"
        autocomplete="email"
        bind:value={value.email}
        maxlength="254"
        placeholder="jamie@example.com"
      /></label
    ><label
      >Phone number<input
        {...stylex.attrs(ui.input)}
        name="phone"
        type="tel"
        autocomplete="tel"
        bind:value={value.phone}
        maxlength="40"
        placeholder="+1 (555) 000-0000"
      /></label
    >
  </div>
  <p {...stylex.attrs(ui.help)}>Share an email or phone number. Everything below is optional.</p>
  <section {...stylex.attrs(styles.section)}>
    <div {...stylex.attrs(styles.sectionHeader)}>
      <MapPin size={17} color="#8e9cb3" />
      <h3 {...stylex.attrs(styles.sectionTitle)}>
        Somewhere to send a little something <span {...stylex.attrs(styles.optional)}
          >(optional)</span
        >
      </h3>
    </div>
    <div {...stylex.attrs(ui.formGrid)}>
      <label {...stylex.attrs(ui.span2)}
        >Street address<input
          {...stylex.attrs(ui.input)}
          name="street"
          autocomplete="street-address"
          bind:value={value.street}
          maxlength="200"
          placeholder="Street, apartment, or unit"
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
        >State / province / region<input
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
  </section>
  <section {...stylex.attrs(styles.section)}>
    <div {...stylex.attrs(styles.sectionHeader)}>
      <Heart size={17} color="#a993ab" />
      <h3 {...stylex.attrs(styles.sectionTitle)}>
        The little details <span {...stylex.attrs(styles.optional)}>(optional)</span>
      </h3>
    </div>
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
          placeholder="e.g. she / her"
        /></label
      ><label {...stylex.attrs(ui.span2)}
        >Anything else to know?<textarea
          {...stylex.attrs(ui.input)}
          name="notes"
          bind:value={value.notes}
          maxlength="2000"
          rows="3"
          placeholder="The best way to reach you, a favorite thing, or a little life update…"
        ></textarea></label
      >
    </div>
  </section>
  <details>
    <summary {...stylex.attrs(styles.summary)}>Add a company or website</summary>
    <div {...stylex.attrs(ui.formGrid)}>
      <label
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
      >
    </div>
  </details>
  {#if recipient}<label {...stylex.attrs(styles.consent)}
      ><input
        {...stylex.attrs(ui.checkbox, styles.consentCheck)}
        type="checkbox"
        bind:checked={consent}
        required
      /><span
        >I’m happy to share these details with {recipient} for their private address book, including any
        address book they export them to.</span
      ></label
    >{/if}
  {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
  <button {...stylex.attrs(ui.button, ui.primary, ui.full)} disabled={busy || photoBusy}
    >{busy ? 'Saving your card…' : buttonLabel}<ArrowUpRight size={16} /></button
  >
  {#if recipient}<p {...stylex.attrs(styles.saveNote)}>
      No account needed. Just you, keeping in touch.
    </p>{/if}
  <noscript><p>Enable JavaScript to securely share your contact card.</p></noscript>
</form>
