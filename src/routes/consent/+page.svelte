<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles as login } from '../login/login.stylex.ts';
  import { styles } from './consent.stylex.ts';
  import Brand from '#lib/components/Brand.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let busy = $state(false);
  let error = $state('');
  async function decide(accept: boolean) {
    error = '';
    busy = true;
    try {
      // The auth client follows the returned redirect back to the app.
      const result = await authClient.oauth2.consent({ accept });
      if (result.error)
        error =
          result.error.message ||
          'Your answer wasn’t saved. Start connecting the app again from the app.';
    } catch {
      error = 'Couldn’t reach the sign-in service. Check your connection and try again.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Connect {data.client.name} | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(login.shell)}>
  <header {...stylex.attrs(login.header)}><Brand /></header>
  <main {...stylex.attrs(login.main)}>
    <h1 {...stylex.attrs(login.title)}>Connect {data.client.name}?</h1>
    <p {...stylex.attrs(styles.host)}>
      {#if data.client.uri}<a href={data.client.uri} rel="noopener noreferrer" target="_blank"
          >{data.client.name}</a
        >{:else}{data.client.name}{/if} will return to <strong>{data.client.redirectHost}</strong>
    </p>
    <ul {...stylex.attrs(styles.scopes)}>
      {#each data.scopes as { scope, description } (scope)}<li>{description}</li>{/each}
    </ul>
    <p {...stylex.attrs(styles.account)}>Signed in as {data.viewer.email}</p>
    {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
    <div {...stylex.attrs(styles.actions)}>
      <button
        {...stylex.attrs(ui.button, ui.primary, ui.full)}
        disabled={busy}
        onclick={() => decide(true)}>Allow</button
      >
      <button {...stylex.attrs(ui.button, ui.full)} disabled={busy} onclick={() => decide(false)}
        >Deny</button
      >
    </div>
  </main>
  <Footer />
</div>
