<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './ExportOptions.stylex.ts';
  import { Download, FileText } from '@lucide/svelte';
  import type { Contact } from '#lib/contact.ts';
  let {
    status,
    summary,
    pending,
    uncertain,
    busy,
    error,
    exportLabel,
    vcard,
    onconnect,
    onexport,
    level = 1
  }: {
    status: 'connected' | 'disconnected' | 'unavailable' | 'demo';
    /** What's been exported to Google so far, when connected. */
    summary: string;
    /** Contacts not yet in Google. */
    pending: number;
    /** Contacts whose export may or may not have reached Google. */
    uncertain: Contact[];
    busy: boolean;
    error: string;
    exportLabel: string;
    vcard: { href: string; count: number };
    onconnect: () => void;
    onexport: () => void;
    /** The title's heading level: 1 as its own page, 3 inside the landing page. */
    level?: 1 | 3;
  } = $props();
  let sub: 2 | 4 = $derived(level === 1 ? 2 : 4);
</script>

<div {...stylex.attrs(ui.pageHeading)}>
  <svelte:element this={`h${level}`} {...stylex.attrs(styles.heading)}>Export</svelte:element>
</div>
<section {...stylex.attrs(ui.panel)} aria-label="Export options">
  <div {...stylex.attrs(styles.row)}>
    <span {...stylex.attrs(styles.icon)} aria-hidden="true"
      ><svg width="18" height="18" viewBox="0 0 24 24"
        ><path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
        /><path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        /><path
          fill="#FBBC05"
          d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
        /><path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        /></svg
      ></span
    >
    <div {...stylex.attrs(styles.text)}>
      <svelte:element this={`h${sub}`} id="google-title" {...stylex.attrs(styles.title)}>
        Google Contacts{#if status === 'connected'}<span {...stylex.attrs(ui.badge, ui.green)}
            >Connected</span
          >{/if}
      </svelte:element>
      <p {...stylex.attrs(styles.detail)}>
        {#if status === 'connected'}{summary}{:else if status === 'unavailable'}Unavailable right
          now. Use the file instead.{:else}Syncs to your phone through Google.{/if}
      </p>
    </div>
    <div {...stylex.attrs(styles.actions)}>
      {#if status === 'connected'}<button
          {...stylex.attrs(ui.button, ui.small)}
          disabled={busy}
          onclick={onconnect}>Reconnect</button
        >{#if pending}<button
            {...stylex.attrs(ui.button, ui.small, ui.primary)}
            disabled={busy}
            onclick={onexport}>{exportLabel}</button
          >{/if}
      {:else if status === 'demo'}<a {...stylex.attrs(ui.button, ui.small)} href="/login"
          >Sign up to connect</a
        >
      {:else if status === 'disconnected'}<button
          {...stylex.attrs(ui.button, ui.small)}
          disabled={busy}
          onclick={onconnect}>Connect</button
        >{/if}
    </div>
  </div>
  {#if error || uncertain.length}<div {...stylex.attrs(styles.notes)}>
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      {#if uncertain.length}<div {...stylex.attrs(styles.uncertain)} role="status">
          <p>
            Check Google for these before adding them by hand. They won’t be retried, to avoid
            duplicates.
          </p>
          <ul {...stylex.attrs(styles.uncertainList)}>
            {#each uncertain as contact (contact.id)}<li>
                {contact.data.firstName}
                {contact.data.lastName}
              </li>{/each}
          </ul>
        </div>{/if}
    </div>{/if}
  <div {...stylex.attrs(styles.row)}>
    <span {...stylex.attrs(styles.icon)} aria-hidden="true"><FileText size={18} /></span>
    <div {...stylex.attrs(styles.text)}>
      <svelte:element this={`h${sub}`} {...stylex.attrs(styles.title)}>vCard file</svelte:element>
      <p {...stylex.attrs(styles.detail)}>For Apple Contacts, Outlook, and most apps</p>
    </div>
    <div {...stylex.attrs(styles.actions)}>
      {#if vcard.count}<a
          {...stylex.attrs(ui.button, ui.small)}
          href={vcard.href}
          download="Contacts.vcf"><Download size={14} />Download {vcard.count}</a
        >{/if}
    </div>
  </div>
</section>
<p {...stylex.attrs(styles.fine)}>
  Google export matches existing contacts by email, phone, or name, fills in what’s missing, and
  asks before changing anything they already have.
</p>
