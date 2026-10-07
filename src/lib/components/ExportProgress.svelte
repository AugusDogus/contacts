<script lang="ts" module>
  import type { ContactInput } from '#lib/contact.ts';
  export type ExportStep = {
    contactId: string;
    person: ContactInput;
    state: 'waiting' | 'working' | 'added' | 'updated' | 'skipped' | 'failed' | 'stopped';
    message: string;
  };
</script>

<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { Check, TriangleAlert } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ExportProgress.stylex.ts';
  import Modal from './Modal.svelte';
  import { Contact } from '#lib/contact.ts';
  let {
    steps,
    running,
    stopping,
    notice,
    onstop,
    onretry,
    onclose
  }: {
    steps: ExportStep[];
    running: boolean;
    stopping: boolean;
    /** A problem that stopped the whole export, such as Google denying access. */
    notice: string;
    onstop: () => void;
    onretry: () => void;
    onclose: () => void;
  } = $props();
  const count = (state: ExportStep['state']) => steps.filter((step) => step.state === state).length;
  let finished = $derived(
    steps.filter((step) => step.state !== 'waiting' && step.state !== 'working').length
  );
  let failures = $derived(steps.filter((step) => step.state === 'failed'));
  let problems = $derived(failures.length > 0 || count('stopped') > 0 || Boolean(notice));
  let percent = $derived(steps.length ? Math.round((finished / steps.length) * 100) : 0);
  let summary = $derived(
    [
      count('added') && `${count('added')} added`,
      count('updated') && `${count('updated')} updated`,
      count('skipped') && `${count('skipped')} already in Google`,
      failures.length && `${failures.length} failed`,
      count('stopped') && `${count('stopped')} not exported`
    ]
      .filter(Boolean)
      .join(' · ')
  );
</script>

<Modal
  title={running
    ? 'Exporting to Google'
    : problems
      ? 'Export finished with problems'
      : 'Export complete'}
  dismissible={!running}
  {onclose}
>
  <div {...stylex.attrs(styles.hero)}>
    <div {...stylex.attrs(styles.art)}>
      <img {...stylex.attrs(styles.logo)} src="/favicon.svg" alt="" width="72" height="72" />
      {#if !running}<span {...stylex.attrs(styles.badge, problems && styles.badgeWarn)}
          >{#if problems}<TriangleAlert size={14} strokeWidth={2.5} />{:else}<Check
              size={14}
              strokeWidth={3}
            />{/if}</span
        >{/if}
    </div>
    <div
      {...stylex.attrs(styles.track)}
      role="progressbar"
      aria-label="Export progress"
      aria-valuemin={0}
      aria-valuemax={steps.length}
      aria-valuenow={finished}
    >
      <div
        {...stylex.attrs(styles.bar, !running && problems && styles.barWarn)}
        style="width:{percent}%"
      ></div>
    </div>
    <p {...stylex.attrs(styles.status)} aria-live="polite">
      {running
        ? stopping
          ? `Stopping after this batch… ${finished} of ${steps.length}`
          : `Syncing ${Math.min(finished + 1, steps.length)} of ${steps.length}…`
        : summary}
    </p>
  </div>
  {#if !running && notice}<p {...stylex.attrs(ui.formError, styles.notice)} role="alert">
      {notice}
    </p>{/if}
  {#if !running && failures.length}<ul {...stylex.attrs(styles.failures)}>
      {#each failures as step (step.contactId)}<li {...stylex.attrs(styles.failure)}>
          <span {...stylex.attrs(styles.name)}>{Contact.name(step.person)}</span>
          <span {...stylex.attrs(styles.reason)}>{step.message}</span>
        </li>{/each}
    </ul>{/if}
  <div {...stylex.attrs(styles.footer)}>
    {#if running}<button {...stylex.attrs(ui.button)} disabled={stopping} onclick={onstop}
        >Stop</button
      >{:else}{#if failures.length}<button {...stylex.attrs(ui.button)} onclick={onretry}
          >Retry {failures.length} failed</button
        >{/if}<button {...stylex.attrs(ui.button, ui.primary)} onclick={onclose}>Done</button>{/if}
  </div>
</Modal>
