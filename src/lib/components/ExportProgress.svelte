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
  import { Check, LoaderCircle, Minus, X } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ExportProgress.stylex.ts';
  import Modal from './Modal.svelte';
  import Avatar from './Avatar.svelte';
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
  const labels: Record<ExportStep['state'], string> = {
    waiting: 'Waiting',
    working: 'Exporting…',
    added: 'Added to Google',
    updated: 'Updated in Google',
    skipped: 'Already exported',
    failed: 'Failed',
    stopped: 'Not exported'
  };
  const count = (state: ExportStep['state']) => steps.filter((step) => step.state === state).length;
  let finished = $derived(
    steps.filter((step) => !['waiting', 'working'].includes(step.state)).length
  );
  let failed = $derived(count('failed'));
  let percent = $derived(steps.length ? Math.round((finished / steps.length) * 100) : 0);
  let summary = $derived(
    [
      count('added') && `${count('added')} added`,
      count('updated') && `${count('updated')} updated`,
      count('skipped') && `${count('skipped')} already exported`,
      failed && `${failed} failed`,
      count('stopped') && `${count('stopped')} not exported`
    ]
      .filter(Boolean)
      .join(' · ')
  );
  let title = $derived(
    running
      ? 'Exporting to Google'
      : failed || count('stopped')
        ? 'Export finished with problems'
        : 'Export complete'
  );
</script>

<Modal {title} dismissible={!running} {onclose}>
  <div {...stylex.attrs(styles.progress)}>
    <div
      {...stylex.attrs(styles.track)}
      role="progressbar"
      aria-label="Export progress"
      aria-valuemin={0}
      aria-valuemax={steps.length}
      aria-valuenow={finished}
    >
      <div
        {...stylex.attrs(styles.bar, !running && failed > 0 && styles.barWarn)}
        style="width:{percent}%"
      ></div>
    </div>
    <p {...stylex.attrs(styles.counts)} aria-live="polite">
      {running ? `${finished} of ${steps.length} done` : summary}
    </p>
  </div>
  {#if notice}<p {...stylex.attrs(ui.formError, styles.notice)} role="alert">{notice}</p>{/if}
  <ul {...stylex.attrs(styles.list)}>
    {#each steps as step (step.contactId)}{@const done =
        step.state === 'added' || step.state === 'updated'}{@const bad = step.state === 'failed'}
      <li {...stylex.attrs(styles.item)}>
        <Avatar person={step.person} size={28} />
        <div {...stylex.attrs(styles.body)}>
          <div {...stylex.attrs(styles.line)}>
            <span {...stylex.attrs(styles.name)}>{Contact.name(step.person)}</span>
            <span
              {...stylex.attrs(
                styles.state,
                done && styles.stateDone,
                bad && styles.stateFailed,
                step.state === 'working' && styles.stateWorking
              )}
            >
              {#if step.state === 'working'}<span {...stylex.attrs(styles.spin)}
                  ><LoaderCircle size={14} /></span
                >{:else if done}<Check size={14} />{:else if bad}<X
                  size={14}
                />{:else if step.state !== 'waiting'}<Minus size={14} />{/if}{labels[step.state]}
            </span>
          </div>
          {#if step.message}<p {...stylex.attrs(styles.message, bad && styles.messageFailed)}>
              {step.message}
            </p>{/if}
        </div>
      </li>
    {/each}
  </ul>
  <div {...stylex.attrs(styles.footer)}>
    {#if running}<button {...stylex.attrs(ui.button)} disabled={stopping} onclick={onstop}
        >{stopping ? 'Stopping after this batch…' : 'Stop'}</button
      >{:else}{#if failed}<button {...stylex.attrs(ui.button)} onclick={onretry}
          >Retry {failed} failed</button
        >{/if}<button {...stylex.attrs(ui.button, ui.primary)} onclick={onclose}>Done</button>{/if}
  </div>
</Modal>
