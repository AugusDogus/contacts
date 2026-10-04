<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './FormFieldsEditor.stylex.ts';
  import { Check, Plus, Trash2 } from '@lucide/svelte';
  import { FormConfig, requirableFields } from '#lib/form-config.ts';
  import { saveForm } from '#lib/contacts.remote.ts';
  import { notify } from '#lib/notice.svelte.ts';
  let { config }: { config: FormConfig } = $props();
  let draft = $state<FormConfig>(untrack(() => structuredClone($state.snapshot(config))));
  let saving = $state(false);
  let error = $state('');
  let dirty = $derived(JSON.stringify(draft) !== JSON.stringify(config));
  function toggle(field: (typeof requirableFields)[number]) {
    draft.required = draft.required.includes(field)
      ? draft.required.filter((item) => item !== field)
      : [...draft.required, field];
  }
  async function save() {
    error = '';
    const parsed = FormConfig.schema.safeParse(draft);
    if (!parsed.success) {
      error = parsed.error.issues[0]?.message || 'Check your fields.';
      return;
    }
    saving = true;
    try {
      await saveForm(parsed.data);
      notify('Form saved');
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Your form wasn’t saved. Try again.';
    } finally {
      saving = false;
    }
  }
</script>

<form
  method="POST"
  {...stylex.attrs(ui.panel, styles.body)}
  onsubmit={(event) => {
    event.preventDefault();
    void save();
  }}
>
  <div>
    <p {...stylex.attrs(styles.label)} id="required-fields">Required</p>
    <p {...stylex.attrs(styles.help)}>A name and an email or phone are always required.</p>
    <div {...stylex.attrs(styles.chips)} role="group" aria-labelledby="required-fields">
      {#each requirableFields as field (field)}{@const on = draft.required.includes(field)}<button
          type="button"
          {...stylex.attrs(styles.chip, on && styles.chipOn)}
          aria-pressed={on}
          onclick={() => toggle(field)}
          >{#if on}<Check size={13} strokeWidth={2.5} />{/if}{FormConfig.labels[field]}</button
        >{/each}
    </div>
  </div>
  <div>
    <p {...stylex.attrs(styles.label)}>Custom fields</p>
    {#if draft.custom.length}<ul {...stylex.attrs(styles.customList)}>
        {#each draft.custom as field, index (field.id)}<li {...stylex.attrs(styles.customRow)}>
            <input
              {...stylex.attrs(ui.input, styles.customInput)}
              aria-label="Custom field {index + 1} name"
              placeholder="Field name, like Discord username"
              maxlength="40"
              bind:value={field.label}
              {@attach (node) => {
                if (!field.label) node.focus();
              }}
            /><label {...stylex.attrs(styles.check)}
              ><input type="checkbox" bind:checked={field.required} />Required</label
            ><button
              type="button"
              {...stylex.attrs(ui.iconButton)}
              aria-label="Remove {field.label || 'custom field'}"
              title="Remove"
              onclick={() => (draft.custom = draft.custom.filter((item) => item.id !== field.id))}
              ><Trash2 size={15} /></button
            >
          </li>{/each}
      </ul>{/if}
    {#if draft.custom.length < 10}<button
        type="button"
        {...stylex.attrs(ui.textButton, styles.add)}
        onclick={() => draft.custom.push({ id: crypto.randomUUID(), label: '', required: false })}
        ><Plus size={14} />Add a field</button
      >{/if}
  </div>
  {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
  <div>
    <button {...stylex.attrs(ui.button, ui.primary)} disabled={saving || !dirty}
      >{saving ? 'Saving…' : 'Save'}</button
    >
  </div>
</form>
