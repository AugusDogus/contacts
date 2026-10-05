<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import emailChecker from '@zootools/email-spell-checker';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ContactForm.stylex.ts';
  import { Contact, contactInput, type ContactInput } from '#lib/contact.ts';
  import { FormConfig } from '#lib/form-config.ts';
  import { Phone } from '#lib/phone.ts';
  import { Address } from '#lib/address.ts';
  import { Camera } from '@lucide/svelte';
  import Avatar from './Avatar.svelte';
  import Field from './Field.svelte';
  import BirthdayPicker from './BirthdayPicker.svelte';
  type Result = { ok: true } | { ok: false; message: string };
  type TextField = Exclude<keyof ContactInput, 'custom'>;
  let {
    initial = Contact.empty(),
    recipient,
    config,
    buttonLabel = 'Save',
    onsave
  }: {
    initial?: ContactInput;
    recipient?: string;
    /** The owner's requirements. Omitted when people edit their own saved card. */
    config?: FormConfig;
    buttonLabel?: string;
    onsave: (contact: ContactInput) => Promise<Result>;
  } = $props();
  let value = $state<ContactInput>(
    untrack(() => ({
      ...initial,
      custom: config ? FormConfig.prefill(config, initial) : initial.custom
    }))
  );
  const req = (field: TextField) => Boolean(config && FormConfig.requires(config, field));
  const idFor = (field: string) => `contact-${field}`;
  let busy = $state(false);
  let photoBusy = $state(false);
  let error = $state('');
  // A problem with one field, shown under it.
  let issue = $state<{ field: string; message: string } | null>(null);
  const problem = (field: string) => (issue?.field === field ? issue.message : '');
  // StyleX evaluates stylex.attrs arguments at build time, so pass it plain values, not calls.
  let photoMissing = $derived(issue?.field === 'photo');
  let ready = $state(false);
  let region = $state(Phone.region('en-US'));
  onMount(() => {
    ready = true;
    region = Phone.region(navigator.language);
  });
  let suggestion = $state('');
  let countryCode = $derived(Address.code(value.country));
  let labels = $derived(Address.labels(countryCode));
  // Keep a country typed before the picker existed selectable.
  let legacyCountry = $derived(value.country && !countryCode ? value.country : '');
  function flag(field: string, message: string) {
    issue = { field, message };
    document.getElementById(idFor(field))?.focus();
  }
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
  async function save() {
    error = '';
    issue = null;
    if (value.phone && !Phone.isPossible(value.phone, region))
      return flag('phone', 'This number looks incomplete. Include the area code.');
    const parsed = contactInput.safeParse(value);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return flag(String(first?.path[0] ?? 'firstName'), first?.message || 'Check this field.');
    }
    if (config) {
      const missing = FormConfig.missing(config, {
        ...parsed.data,
        custom: FormConfig.answers(config, parsed.data.custom)
      });
      if (missing) return flag(missing.field, missing.message);
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

{#snippet text(
  field: TextField,
  label: string,
  attrs: Record<string, string | boolean>,
  options: { required?: boolean; wide?: boolean; stretchOnMobile?: boolean } = {}
)}
  <Field
    id={idFor(field)}
    {label}
    required={options.required ?? req(field)}
    wide={options.wide}
    stretchOnMobile={options.stretchOnMobile}
    error={problem(field)}
  >
    {#snippet children({ id, invalid, describedby })}
      <input
        {...stylex.attrs(ui.input, styles.control, invalid && ui.invalid)}
        {id}
        name={field}
        aria-invalid={invalid || undefined}
        aria-describedby={describedby}
        {...attrs}
        bind:value={value[field]}
      />
    {/snippet}
  </Field>
{/snippet}

<form
  method="POST"
  novalidate
  {...stylex.attrs(styles.form)}
  oninput={(event) => {
    const target = event.target;
    if (
      (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement) &&
      target.name === issue?.field
    )
      issue = null;
  }}
  onsubmit={(event) => {
    event.preventDefault();
    void save();
  }}
>
  <div {...stylex.attrs(styles.photoRow)}>
    <label {...stylex.attrs(styles.photoPick)}
      >{#if value.photo}<Avatar person={value} size={56} />{:else}<span
          {...stylex.attrs(styles.photoPlaceholder, photoMissing && styles.photoMissing)}
          ><Camera size={20} strokeWidth={1.6} /></span
        >{/if}<span {...stylex.attrs(styles.photoText)}
        ><span>{photoBusy ? 'Preparing…' : value.photo ? 'Change photo' : 'Add a photo'}</span
        >{#if req('photo')}<span {...stylex.attrs(styles.required)}>required</span
          >{/if}{#if problem('photo')}<span {...stylex.attrs(styles.photoError)}
            >{problem('photo')}</span
          >{/if}</span
      ><input
        {...stylex.attrs(ui.srOnly)}
        id={idFor('photo')}
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onchange={(event) => {
          issue = null;
          void photo(event.currentTarget.files?.[0]);
        }}
        disabled={busy || photoBusy}
      /></label
    >{#if value.photo}<button
        type="button"
        {...stylex.attrs(ui.textButton, styles.photoRemove)}
        onclick={() => (value.photo = '')}>Remove</button
      >{/if}
  </div>
  <div {...stylex.attrs(ui.formGrid)}>
    {@render text(
      'firstName',
      'First name',
      { autocomplete: 'given-name', maxlength: '80' },
      { required: true }
    )}
    {@render text(
      'lastName',
      'Last name',
      { autocomplete: 'family-name', maxlength: '80' },
      { required: true }
    )}
    <Field id={idFor('email')} label="Email" required={req('email')} error={problem('email')}>
      {#snippet children({ id, invalid, describedby })}
        <input
          {...stylex.attrs(ui.input, styles.control, invalid && ui.invalid)}
          {id}
          name="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          autocapitalize="none"
          spellcheck="false"
          maxlength="254"
          aria-invalid={invalid || undefined}
          aria-describedby={describedby}
          bind:value={value.email}
          oninput={() => (suggestion = '')}
          onblur={() => (suggestion = emailChecker.run({ email: value.email.trim() })?.full ?? '')}
        />
      {/snippet}
      {#snippet after()}{#if suggestion}<p {...stylex.attrs(styles.hint)}>
            Did you mean <button
              type="button"
              {...stylex.attrs(ui.textButton)}
              onclick={() => {
                value.email = suggestion;
                suggestion = '';
              }}>{suggestion}</button
            >?
          </p>{/if}{/snippet}
    </Field>
    <Field id={idFor('phone')} label="Phone" required={req('phone')} error={problem('phone')}>
      {#snippet children({ id, invalid, describedby })}
        <input
          {...stylex.attrs(ui.input, styles.control, invalid && ui.invalid)}
          {id}
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          maxlength="40"
          aria-invalid={invalid || undefined}
          aria-describedby={describedby}
          bind:value={value.phone}
          oninput={(event) => {
            const input = event.currentTarget;
            // Reformat only while typing at the end, so editing the middle never moves the caret.
            if (input.selectionStart === input.value.length)
              value.phone = Phone.format(input.value, region);
          }}
        />
      {/snippet}
    </Field>
  </div>
  <fieldset {...stylex.attrs(styles.section)}>
    <legend {...stylex.attrs(styles.sectionTitle)}
      >Address{#if req('street')}<span {...stylex.attrs(styles.required)}>required</span
        >{/if}</legend
    >
    <div {...stylex.attrs(ui.formGrid)}>
      <Field
        id={idFor('country')}
        label="Country"
        required={req('country')}
        error={problem('country')}
        wide
      >
        {#snippet children({ id, invalid, describedby })}
          <select
            {...stylex.attrs(
              ui.input,
              styles.control,
              styles.select,
              invalid && ui.invalid,
              !value.country && styles.placeholder
            )}
            {id}
            name="country"
            autocomplete="country-name"
            aria-invalid={invalid || undefined}
            aria-describedby={describedby}
            bind:value={value.country}
          >
            <option value="">Select a country</option>
            {#if legacyCountry}<option value={legacyCountry}>{legacyCountry}</option>{/if}
            {#each Address.countries as country (country.code)}<option value={country.name}
                >{country.name}</option
              >{/each}
          </select>
        {/snippet}
      </Field>
      {@render text(
        'street',
        'Street address',
        { autocomplete: 'address-line1', maxlength: '200' },
        { wide: true }
      )}
      {@render text(
        'street2',
        'Apartment, suite, or unit',
        { autocomplete: 'address-line2', maxlength: '200' },
        { wide: true }
      )}
      <div {...stylex.attrs(styles.localityRow)}>
        {@render text(
          'city',
          'City',
          { autocomplete: 'address-level2', maxlength: '100' },
          { stretchOnMobile: true }
        )}
        {@render text('region', labels.region, {
          autocomplete: 'address-level1',
          maxlength: '100'
        })}
        {@render text('postalCode', labels.postal, {
          autocomplete: 'postal-code',
          maxlength: '30',
          autocapitalize: 'characters'
        })}
      </div>
    </div>
  </fieldset>
  <fieldset {...stylex.attrs(styles.section)}>
    <legend {...stylex.attrs(styles.sectionTitle)}>More</legend>
    <div {...stylex.attrs(ui.formGrid)}>
      {#each value.custom as answer (answer.id)}<Field
          id={idFor(`custom-${answer.id}`)}
          label={answer.label}
          required={Boolean(config?.custom.find((field) => field.id === answer.id)?.required)}
          error={problem(`custom-${answer.id}`)}
          wide
        >
          {#snippet children({ id, invalid, describedby })}
            <input
              {...stylex.attrs(ui.input, styles.control, invalid && ui.invalid)}
              {id}
              name="custom-{answer.id}"
              maxlength="200"
              aria-invalid={invalid || undefined}
              aria-describedby={describedby}
              bind:value={answer.value}
            />
          {/snippet}
        </Field>{/each}
      <Field
        id={idFor('birthday')}
        label="Birthday"
        required={req('birthday')}
        error={problem('birthday')}
      >
        {#snippet children({ id, invalid, describedby })}
          <BirthdayPicker
            {id}
            value={value.birthday}
            {invalid}
            {describedby}
            onchange={(next) => {
              value.birthday = next;
              if (issue?.field === 'birthday') issue = null;
            }}
          />
        {/snippet}
      </Field>
      {@render text('pronouns', 'Pronouns', { maxlength: '60', placeholder: 'e.g. she/her' })}
      {@render text('company', 'Company', { autocomplete: 'organization', maxlength: '100' })}
      {@render text('website', 'Website', {
        type: 'url',
        inputmode: 'url',
        autocomplete: 'url',
        autocapitalize: 'none',
        spellcheck: false,
        maxlength: '500',
        placeholder: 'https://'
      })}
      <Field
        id={idFor('notes')}
        label="Notes"
        required={req('notes')}
        error={problem('notes')}
        wide
      >
        {#snippet children({ id, invalid, describedby })}
          <textarea
            {...stylex.attrs(ui.input, styles.control, invalid && ui.invalid)}
            {id}
            name="notes"
            maxlength="2000"
            rows="2"
            aria-invalid={invalid || undefined}
            aria-describedby={describedby}
            bind:value={value.notes}></textarea>
        {/snippet}
      </Field>
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
