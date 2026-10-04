<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './login.stylex.ts';
  import Brand from '#lib/components/Brand.svelte';
  import ContactStack from '#lib/components/ContactStack.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let mode = $state<'signup' | 'signin'>(untrack(() => (data.signIn ? 'signin' : 'signup')));
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error = $state('');
  async function authenticate(google = false) {
    error = '';
    busy = true;
    const callbackURL = data.claim ? '/settings?claim=1' : '/';
    try {
      const result = google
        ? await authClient.signIn.social({ provider: 'google', callbackURL })
        : mode === 'signup'
          ? await authClient.signUp.email({ name, email, password, callbackURL })
          : await authClient.signIn.email({ email, password, callbackURL });
      if (result.error) {
        error =
          result.error.message || 'That didn’t work. Check your email and password and try again.';
        return;
      }
      if (!google) window.location.href = callbackURL;
    } catch {
      error = 'Couldn’t reach the sign-in service. Check your connection and try again.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head
  ><title>{mode === 'signup' ? 'Create an account' : 'Sign in'} | Contacts Exchange</title
  ></svelte:head
>
<div {...stylex.attrs(styles.shell)}>
  <header {...stylex.attrs(styles.header)}><Brand /></header>
  <main {...stylex.attrs(styles.main)}>
    <div {...stylex.attrs(styles.art)}><ContactStack width={160} /></div>
    <h1 {...stylex.attrs(styles.title)}>
      {mode === 'signup' ? 'Create your address book' : 'Welcome back'}
    </h1>
    {#if data.claim}<p {...stylex.attrs(styles.intro)}>
        Sign up to keep the card you just sent.
      </p>{/if}
    <div {...stylex.attrs(styles.methods)}>
      {#if data.googleConfigured}<button
          {...stylex.attrs(ui.button, ui.full)}
          disabled={busy}
          onclick={() => authenticate(true)}
          ><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
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
          >Continue with Google</button
        >
        <div {...stylex.attrs(styles.divider)}>or</div>{/if}
      <form
        method="POST"
        {...stylex.attrs(ui.formStack)}
        onsubmit={(event) => {
          event.preventDefault();
          void authenticate();
        }}
      >
        {#if mode === 'signup'}<label
            >Name<input
              {...stylex.attrs(ui.input)}
              bind:value={name}
              autocomplete="name"
              required
              maxlength="80"
            /></label
          >{/if}<label
          >Email<input
            {...stylex.attrs(ui.input)}
            bind:value={email}
            type="email"
            autocomplete="email"
            required
          /></label
        ><label
          >Password<input
            {...stylex.attrs(ui.input)}
            bind:value={password}
            type="password"
            autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minlength="10"
            required
            aria-describedby={mode === 'signup' ? 'password-help' : undefined}
          />{#if mode === 'signup'}<span id="password-help" {...stylex.attrs(ui.help)}
              >At least 10 characters.</span
            >{/if}</label
        >{#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}<button
          {...stylex.attrs(ui.button, ui.primary, ui.full)}
          disabled={busy}
          >{busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button
        >
      </form>
    </div>
    <p {...stylex.attrs(styles.toggle)}>
      {mode === 'signup' ? 'Have an account?' : 'New here?'}
      <button
        {...stylex.attrs(ui.textButton)}
        onclick={() => {
          mode = mode === 'signup' ? 'signin' : 'signup';
          error = '';
        }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button
      >
    </p>
    <p {...stylex.attrs(styles.privacy)}><a href="/privacy">Privacy</a></p>
  </main>
</div>
