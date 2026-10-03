<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './login.stylex.ts';
  import Brand from '#lib/components/Brand.svelte';
  import ContactStack from '#lib/components/ContactStack.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let mode = $state<'signup' | 'signin'>('signup');
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
    <div {...stylex.attrs(styles.art)}><ContactStack width={200} /></div>
    <h1 {...stylex.attrs(styles.title)}>
      {mode === 'signup' ? 'Create your address book' : 'Welcome back'}
    </h1>
    <p {...stylex.attrs(styles.intro)}>
      {data.claim
        ? 'Create an account to keep the card you just sent.'
        : mode === 'signup'
          ? 'Send friends a private link. They fill in their own contact details.'
          : 'Sign in to see your people.'}
    </p>
    <button
      {...stylex.attrs(ui.button, ui.full)}
      disabled={!data.googleConfigured || busy}
      onclick={() => authenticate(true)}
      ><span {...stylex.attrs(styles.googleLetter)} aria-hidden="true">G</span>Continue with Google</button
    >{#if !data.googleConfigured}<p {...stylex.attrs(ui.help)}>
        Google sign-in isn’t available right now. Use email instead.
      </p>{/if}
    <div {...stylex.attrs(styles.divider)}>or</div>
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
