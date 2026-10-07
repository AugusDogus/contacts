<script lang="ts">
  import { untrack } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import * as stylex from '@stylexjs/stylex';
  import { Check, ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ExportReview.stylex.ts';
  import Modal from './Modal.svelte';
  import Avatar from './Avatar.svelte';
  import { Contact, type ContactInput } from '#lib/contact.ts';
  import { GooglePerson, type Decided, type Resolution, type Row } from '#lib/google-person.ts';
  type Item = { contactId: string; person: ContactInput; rows: Row[] };
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
  // Start from the suggested defaults; every detail can be changed before anything is written.
  let decisions = $state<Record<string, Record<string, Resolution>>>(
    untrack(() =>
      Object.fromEntries(
        items.map(({ contactId, rows }) => [
          contactId,
          Object.fromEntries(
            rows.flatMap((row) =>
              row.kind === 'added' || row.kind === 'different' ? [[row.key, row.selected]] : []
            )
          )
        ])
      )
    )
  );
  let index = $state(0);
  let item = $derived(items[index] ?? items[0]);
  let first = $derived(item?.person.firstName || 'their');
  // Everyone with a difference must be looked at before exporting, so nothing is decided unseen.
  const seen = new SvelteSet<string>();
  $effect(() => {
    if (item) seen.add(item.contactId);
  });
  let unreviewed = $derived(
    items.filter((other) => other.rows.some(GooglePerson.needsChoice) && !seen.has(other.contactId))
  );
  let upcoming = $derived(
    unreviewed.find((other) => items.indexOf(other) > index) ?? unreviewed[0]
  );
  const selected = (contactId: string, row: Decided) =>
    decisions[contactId]?.[row.key] ?? row.selected;
  function set(contactId: string, key: string, value: Resolution) {
    decisions[contactId] = { ...decisions[contactId], [key]: value };
  }
  /** Clicking a side picks it, or for details that can keep both, toggles it. */
  function toggle(contactId: string, row: Decided, side: 'google' | 'card') {
    const current = selected(contactId, row);
    if (row.kind === 'added')
      return set(contactId, row.key, current === 'card' ? 'google' : 'card');
    if (!row.options.includes('both')) {
      if (side === 'google') return set(contactId, row.key, 'google');
      return set(contactId, row.key, current === 'nickname' ? 'nickname' : 'card');
    }
    let google = current === 'google' || current === 'both';
    let card = current !== 'google';
    if (side === 'google') google = !google;
    else card = !card;
    // Nothing is ever removed from Google, so one side always stays.
    if (!google && !card) return;
    set(contactId, row.key, google && card ? 'both' : card ? 'card' : 'google');
  }
  /** Other people with the same kind of difference, for applying one choice to everyone. */
  function alike(key: string) {
    return items.filter(
      (other) =>
        other !== item && other.rows.some((row) => row.kind === 'different' && row.key === key)
    );
  }
  function applyToAll(key: string, value: Resolution) {
    for (const other of items) {
      const row = other.rows.find((row) => row.kind === 'different' && row.key === key);
      if (row?.kind === 'different' && row.options.includes(value))
        set(other.contactId, key, value);
    }
  }
  const status = (contactId: string, rows: Row[]) => {
    const differences = rows.filter(GooglePerson.needsChoice).length;
    const added = rows.filter((row) => row.kind === 'added').length;
    if (differences && seen.has(contactId)) return 'Reviewed';
    if (differences) return `${differences} ${differences === 1 ? 'difference' : 'differences'}`;
    if (added) return `Adds ${added} ${added === 1 ? 'detail' : 'details'}`;
    return 'Already up to date';
  };
  let reviewing = $derived(
    items.filter((other) => other.rows.some(GooglePerson.needsChoice)).length
  );
  let summary = $derived(
    [
      created && `${created} new ${created === 1 ? 'contact' : 'contacts'}`,
      merged && `${merged} existing ${merged === 1 ? 'contact' : 'contacts'} updated`
    ]
      .filter(Boolean)
      .join(' · ')
  );
</script>

<Modal title="Review before exporting" size="large" {onclose}>
  <p {...stylex.attrs(styles.lead)}>
    {reviewing === 1 ? '1 person is' : `${reviewing} people are`} already in your Google Contacts with
    different details. Pick what to keep for each one. Nothing changes until you export.
  </p>
  <div {...stylex.attrs(styles.layout)}>
    <ul {...stylex.attrs(styles.people)} aria-label="Matched contacts">
      {#each items as other, i (other.contactId)}{@const open = i === index}{@const pending =
          other.rows.some(GooglePerson.needsChoice) && !seen.has(other.contactId)}
        <li>
          <button
            type="button"
            aria-current={open}
            {...stylex.attrs(styles.personButton, open && styles.personOpen)}
            onclick={() => (index = i)}
          >
            <Avatar person={other.person} size={28} />
            <span {...stylex.attrs(styles.personText)}>
              <span {...stylex.attrs(styles.personName)}>{Contact.name(other.person)}</span>
              <span {...stylex.attrs(styles.personStatus, pending && styles.pendingStatus)}
                >{status(other.contactId, other.rows)}</span
              >
            </span>
          </button>
        </li>{/each}
    </ul>
    {#if item}<section {...stylex.attrs(styles.detail)} aria-label={Contact.name(item.person)}>
        <header {...stylex.attrs(styles.detailHeader)}>
          <Avatar person={item.person} size={36} />
          <div {...stylex.attrs(styles.detailTitle)}>
            <h3 {...stylex.attrs(styles.detailName)}>{Contact.name(item.person)}</h3>
            <p {...stylex.attrs(styles.detailStatus)}>{status(item.contactId, item.rows)}</p>
          </div>
          <div {...stylex.attrs(styles.stepper)}>
            <span {...stylex.attrs(styles.count)}>{index + 1} of {items.length}</span>
            <button
              {...stylex.attrs(ui.iconButton)}
              aria-label="Previous person"
              disabled={index === 0}
              onclick={() => index--}><ChevronLeft size={18} /></button
            ><button
              {...stylex.attrs(ui.iconButton)}
              aria-label="Next person"
              disabled={index === items.length - 1}
              onclick={() => index++}><ChevronRight size={18} /></button
            >
          </div>
        </header>
        <div {...stylex.attrs(styles.table)} role="table" aria-label="Details">
          <div {...stylex.attrs(styles.row, styles.headings)} role="row">
            <span role="columnheader" {...stylex.attrs(styles.headingLabel)}
              ><span {...stylex.attrs(ui.srOnly)}>Detail</span></span
            >
            <span role="columnheader">In Google</span>
            <span role="columnheader">From {first}’s card</span>
          </div>
          {#each item.rows as row (row.key)}{@const photo = row.key === 'photos'}
            <div {...stylex.attrs(styles.row, row.kind === 'kept' && styles.quiet)} role="row">
              <span {...stylex.attrs(styles.label)} role="rowheader">{row.label}</span>
              {#if row.kind === 'same'}
                <div {...stylex.attrs(styles.cell, styles.span, styles.sameCell)} role="cell">
                  <span {...stylex.attrs(styles.values)}>{row.card}</span>
                  <span {...stylex.attrs(ui.badge)}><Check size={12} />In both</span>
                </div>
              {:else if row.kind === 'kept'}
                <div {...stylex.attrs(styles.cell)} role="cell">
                  {@render values(row, 'google', photo)}
                </div>
                <div {...stylex.attrs(styles.cell, styles.empty)} role="cell">Not on card</div>
              {:else if GooglePerson.decided(row)}{@const choice = selected(
                  item.contactId,
                  row
                )}{@const added = row.kind === 'added'}{@const multiple =
                  row.options.includes('both')}{@const googleOn =
                  choice === 'google' || choice === 'both'}{@const cardOn = choice !== 'google'}
                {#if added}
                  <div {...stylex.attrs(styles.cell, styles.empty)} role="cell">Not in Google</div>
                {:else}
                  <div role="cell" {...stylex.attrs(styles.pickCell)}>
                    <button
                      type="button"
                      role={multiple ? 'checkbox' : 'radio'}
                      aria-checked={googleOn}
                      aria-label="Keep Google’s {row.label.toLowerCase()}"
                      {...stylex.attrs(styles.cell, styles.pick, googleOn && styles.picked)}
                      onclick={() => toggle(item.contactId, row, 'google')}
                    >
                      <span
                        {...stylex.attrs(
                          styles.mark,
                          !multiple && styles.round,
                          googleOn && styles.markOn
                        )}
                        >{#if googleOn}<Check size={11} strokeWidth={3} />{/if}</span
                      >
                      <span {...stylex.attrs(styles.pickBody, !googleOn && styles.removed)}
                        >{@render values(row, 'google', photo)}</span
                      >
                    </button>
                  </div>
                {/if}
                <div role="cell" {...stylex.attrs(styles.pickCell)}>
                  <button
                    type="button"
                    role={added || multiple ? 'checkbox' : 'radio'}
                    aria-checked={cardOn}
                    aria-label="{added ? 'Add' : 'Use'} the card’s {row.label.toLowerCase()}"
                    {...stylex.attrs(styles.cell, styles.pick, cardOn && styles.picked)}
                    onclick={() => toggle(item.contactId, row, 'card')}
                  >
                    <span
                      {...stylex.attrs(
                        styles.mark,
                        !added && !multiple && styles.round,
                        cardOn && styles.markOn
                      )}
                      >{#if cardOn}<Check size={11} strokeWidth={3} />{/if}</span
                    >
                    <span {...stylex.attrs(styles.pickBody, !cardOn && styles.skipped)}
                      >{@render values(row, 'card', photo)}</span
                    >
                  </button>
                  {#if row.kind === 'different' && row.options.includes('nickname') && cardOn}
                    <label {...stylex.attrs(styles.nickname)}>
                      <input
                        type="checkbox"
                        checked={choice === 'nickname'}
                        onchange={(event) =>
                          set(
                            item.contactId,
                            row.key,
                            event.currentTarget.checked ? 'nickname' : 'card'
                          )}
                      />
                      Keep “{row.google.join(', ')}” as a nickname
                    </label>
                  {/if}
                </div>
                {#if row.kind === 'different'}{@const others = alike(row.key)}{#if others.length}
                    <div {...stylex.attrs(styles.applyRow)}>
                      <button
                        type="button"
                        {...stylex.attrs(styles.apply)}
                        onclick={() => applyToAll(row.key, choice)}
                        >Do the same for {others.length}
                        {others.length === 1 ? 'other' : 'others'}</button
                      >
                    </div>
                  {/if}{/if}
              {/if}
            </div>
          {/each}
        </div>
      </section>{/if}
  </div>
  <div {...stylex.attrs(styles.footer)}>
    <p {...stylex.attrs(styles.summary)}>
      {unreviewed.length
        ? `${unreviewed.length} more ${unreviewed.length === 1 ? 'person' : 'people'} to review`
        : summary}
    </p>
    <div {...stylex.attrs(styles.actions)}>
      <button {...stylex.attrs(ui.button)} onclick={onclose}>Cancel</button>
      {#if upcoming}{@const target = upcoming}<button
          {...stylex.attrs(ui.button, ui.primary)}
          onclick={() => (index = items.indexOf(target))}
          >Next: {Contact.name(target.person)}<ChevronRight size={16} /></button
        >{:else}<button
          {...stylex.attrs(ui.button, ui.primary)}
          onclick={() => onconfirm($state.snapshot(decisions))}>Export</button
        >{/if}
    </div>
  </div>
</Modal>

{#snippet values(row: Row, side: 'google' | 'card', photo: boolean)}
  {#if photo}
    {@const src = side === 'google' ? row.google[0] : item?.person.photo}
    {#if src}<img {...stylex.attrs(styles.photo)} {src} alt="" width="44" height="44" />{/if}
  {:else if side === 'google'}
    <span {...stylex.attrs(styles.values)}>
      {#each row.google as value, i (i)}<span {...stylex.attrs(styles.value)}>{value}</span>{/each}
    </span>
  {:else}
    <span {...stylex.attrs(styles.values)}
      ><span {...stylex.attrs(styles.value)}>{row.card}</span></span
    >
  {/if}
{/snippet}
