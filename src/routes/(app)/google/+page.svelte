<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { ArrowLeft } from '@lucide/svelte';
  import { getGoogleConnection, importToGoogle, previewExport } from '#lib/google.remote.ts';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { authClient } from '#lib/auth-client.ts';
  import ExportReview from '#lib/components/ExportReview.svelte';
  import ExportOptions from '#lib/components/ExportOptions.svelte';
  import ExportProgress, { type ExportStep } from '#lib/components/ExportProgress.svelte';
  import { GooglePerson, type Resolution, type Row } from '#lib/google-person.ts';
  import type { ContactInput } from '#lib/contact.ts';
  let book = $derived(await getAddressBook());
  let connection = $derived(await getGoogleConnection());
  let busy = $state(false);
  let error = $state('');
  let imports = $derived(connection.status === 'connected' ? connection.imports : []);
  let pending = $derived(book.contacts.filter((c) => !imports.some((i) => i.contactId === c.id)));
  const statusOf = (id: string) => imports.find((i) => i.contactId === id)?.status;
  let uncertain = $derived(
    book.contacts.filter((c) => ['pending', 'uncertain'].includes(statusOf(c.id) ?? ''))
  );
  let added = $derived(book.contacts.filter((c) => statusOf(c.id) === 'done').length);
  let updated = $derived(book.contacts.filter((c) => statusOf(c.id) === 'merged').length);
  let summary = $derived(
    !book.contacts.length
      ? 'No contacts yet'
      : [
          added && `${added} added`,
          updated && `${updated} merged`,
          pending.length && `${pending.length} not exported`,
          uncertain.length && `${uncertain.length} unconfirmed`
        ]
          .filter(Boolean)
          .join(' · ')
  );
  async function connect() {
    busy = true;
    error = '';
    try {
      const result = await authClient.linkSocial({
        provider: 'google',
        scopes: ['https://www.googleapis.com/auth/contacts'],
        callbackURL: '/google',
        additionalParams: { access_type: 'offline', prompt: 'consent' }
      });
      if (result.error) error = result.error.message || 'Google didn’t connect. Try again.';
    } catch {
      error = 'Couldn’t reach Google. Nothing changed here. Try again.';
    } finally {
      busy = false;
    }
  }
  type Review = {
    items: { contactId: string; match: 'existing' | 'new'; person: ContactInput; rows: Row[] }[];
    created: number;
    merged: number;
  };
  let review = $state<Review | null>(null);
  type Decisions = Record<string, Record<string, Resolution>>;
  type Job = {
    steps: ExportStep[];
    decisions: Decisions;
    running: boolean;
    stopping: boolean;
    notice: string;
  };
  let job = $state<Job | null>(null);
  // Which modal is open. Closing hides it without clearing its data: a closing modal still
  // reads its props once more as it unmounts, and cleared data would crash the page.
  let showing = $state<'review' | 'progress' | null>(null);
  // Leaving mid-export stops the remaining batches, so ask first.
  $effect(() => {
    if (!job?.running) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  });
  // Work out what would change first, and only ask when Google has different details.
  async function startExport() {
    busy = true;
    error = '';
    try {
      const plan = await previewExport(pending.map((c) => c.id));
      if (!plan.ok) {
        error = plan.message;
        busy = false;
        return;
      }
      if (!plan.review.some(({ rows }) => rows.some(GooglePerson.needsChoice)))
        return await run(
          {},
          pending.map((c) => c.id)
        );
      showing = 'review';
      review = {
        created: plan.created,
        merged: plan.merged,
        items: plan.review.flatMap(({ contactId, match, rows }) => {
          const contact = book.contacts.find((c) => c.id === contactId);
          return contact ? [{ contactId, match, person: contact.data, rows }] : [];
        })
      };
    } catch {
      error = 'Couldn’t check your Google contacts. Nothing was exported. Try again.';
      busy = false;
    }
  }
  /** Exports in batches of three, showing each person's outcome as it arrives. */
  async function run(decisions: Decisions, ids: string[]) {
    showing = 'progress';
    busy = true;
    error = '';
    const current: Job = {
      decisions,
      running: true,
      stopping: false,
      notice: '',
      steps: ids.flatMap((contactId) => {
        const contact = book.contacts.find((c) => c.id === contactId);
        return contact ? [{ contactId, person: contact.data, state: 'waiting', message: '' }] : [];
      })
    };
    job = current;
    // The reactive copy, so each change shows up in the progress modal immediately.
    const live = job;
    const update = (contactId: string, change: Partial<ExportStep>) => {
      const step = live.steps.find((s) => s.contactId === contactId);
      if (step) Object.assign(step, change);
    };
    for (let i = 0; i < ids.length; i += 3) {
      if (live.stopping) break;
      const batch = ids.slice(i, i + 3);
      for (const id of batch) update(id, { state: 'working' });
      try {
        const result = await importToGoogle({ ids: batch, decisions });
        for (const outcome of result.outcomes)
          update(
            outcome.contactId,
            outcome.status === 'failed'
              ? { state: 'failed', message: outcome.message }
              : outcome.status === 'skipped'
                ? { state: 'skipped' }
                : {
                    state: outcome.status,
                    message: outcome.photoSkipped ? 'The photo couldn’t be copied.' : ''
                  }
          );
        if (!result.ok) {
          live.notice = result.message;
          break;
        }
      } catch {
        live.notice =
          'Lost the connection to the server. Some of these may have been exported. Check Google Contacts, then refresh this page to see who’s left.';
        break;
      }
    }
    for (const step of live.steps)
      if (step.state === 'waiting' || step.state === 'working') step.state = 'stopped';
    live.running = false;
    busy = false;
  }
</script>

<svelte:head
  ><title>Export | Contacts Exchange</title>
  <!-- Ready before the export modal opens, even on a slow or busy connection. -->
  <link rel="preload" as="image" href="/export-otter.svg" /></svelte:head
>
<a href="/people" {...stylex.attrs(ui.back)}><ArrowLeft size={15} />People</a>
<ExportOptions
  status={connection.status}
  {summary}
  pending={pending.length}
  {uncertain}
  {busy}
  {error}
  exportLabel={busy
    ? showing === 'progress'
      ? 'Exporting…'
      : 'Checking Google…'
    : `Export ${pending.length}`}
  vcard={{ href: '/export', count: book.contacts.length }}
  onconnect={connect}
  onexport={startExport}
/>
{#if showing === 'review' && review}<ExportReview
    items={review.items}
    created={review.created}
    merged={review.merged}
    onconfirm={(decisions) =>
      void run(
        decisions,
        pending.map((c) => c.id)
      )}
    onclose={() => {
      showing = null;
      busy = false;
    }}
  />{/if}
{#if showing === 'progress' && job}<ExportProgress
    steps={job.steps}
    running={job.running}
    stopping={job.stopping}
    notice={job.notice}
    onstop={() => {
      if (job) job.stopping = true;
    }}
    onretry={() => {
      if (!job) return;
      const failed = job.steps.filter((step) => step.state === 'failed').map((s) => s.contactId);
      void run(job.decisions, failed);
    }}
    onclose={() => (showing = null)}
  />{/if}
