<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ExportReview.stylex.ts';
  import Modal from './Modal.svelte';
  import type { Choice, Resolution } from '#lib/google-person.ts';
  type Item = { contactId: string; name: string; choices: Choice[] };
  let {
    items,
    created,
    merged,
    onconfirm,
    onclose
  }: {
    items: Item[];
    created: number;
    merged: number;
    onconfirm: (decisions: Record<string, Record<string, Resolution>>) => void;
    onclose: () => void;
  } = $props();
  const labels: Record<Resolution, string> = {
    both: 'Keep both',
    card: 'Use card',
    google: 'Keep Google'
  };
  // Start from the suggested defaults; every row can be changed before anything is written.
  let decisions = $state<Record<string, Record<string, Resolution>>>(
    untrack(() =>
      Object.fromEntries(
        items.map(({ contactId, choices }) => [
          contactId,
          Object.fromEntries(choices.map(({ key, selected }) => [key, selected]))
        ])
      )
    )
  );
  let summary = $derived(
    [
      created && `${created} new ${created === 1 ? 'contact' : 'contacts'}`,
      merged && `${merged} ${merged === 1 ? 'update' : 'updates'} to existing contacts`
    ]
      .filter(Boolean)
      .join(' · ')
  );
</script>

<Modal title="Review before exporting" wide {onclose}>
  <p {...stylex.attrs(styles.lead)}>
    {items.length === 1 ? 'This person is' : `These ${items.length} people are`} already in Google with
    some different details. Nothing changes until you export.
  </p>
  <ul {...stylex.attrs(styles.people)}>
    {#each items as item (item.contactId)}<li {...stylex.attrs(styles.person)}>
        <p {...stylex.attrs(styles.name)}>{item.name}</p>
        {#each item.choices as choice (choice.key)}{@const current =
            decisions[item.contactId]?.[choice.key] ?? choice.selected}
          <div {...stylex.attrs(styles.choice)}>
            <p {...stylex.attrs(styles.label)}>{choice.label}</p>
            <dl {...stylex.attrs(styles.values)}>
              <div {...stylex.attrs(styles.value, current === 'card' && styles.dropped)}>
                <dt {...stylex.attrs(styles.source)}>Google</dt>
                <dd {...stylex.attrs(styles.text)}>{choice.google}</dd>
              </div>
              <div {...stylex.attrs(styles.value, current === 'google' && styles.dropped)}>
                <dt {...stylex.attrs(styles.source)}>Card</dt>
                <dd {...stylex.attrs(styles.text)}>{choice.card}</dd>
              </div>
            </dl>
            <div
              {...stylex.attrs(ui.segmented, styles.options)}
              role="radiogroup"
              aria-label="{choice.label} for {item.name}"
            >
              {#each choice.options as option (option)}<button
                  type="button"
                  role="radio"
                  aria-checked={current === option}
                  {...stylex.attrs(ui.segment, current === option && ui.segmentOn)}
                  onclick={() => {
                    decisions[item.contactId] = {
                      ...decisions[item.contactId],
                      [choice.key]: option
                    };
                  }}>{labels[option]}</button
                >{/each}
            </div>
          </div>{/each}
      </li>{/each}
  </ul>
  <div {...stylex.attrs(styles.footer)}>
    <p {...stylex.attrs(styles.summary)}>{summary}</p>
    <div {...stylex.attrs(styles.actions)}>
      <button {...stylex.attrs(ui.button)} onclick={onclose}>Cancel</button><button
        {...stylex.attrs(ui.button, ui.primary)}
        onclick={() => onconfirm($state.snapshot(decisions))}>Export</button
      >
    </div>
  </div>
</Modal>
