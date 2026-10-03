<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './login.stylex.ts';
  import Brand from '#lib/components/Brand.svelte';
  import ContactStack from '#lib/components/ContactStack.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import { ShieldCheck, ArrowUpRight } from '@lucide/svelte';
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
        error = result.error.message || 'Sign-in failed. Check your details and try again.';
        return;
      }
      if (!google) window.location.href = callbackURL;
    } catch {
      error = 'We couldn’t reach the sign-in service. Your details are still here. Try again.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head
  ><title>{mode === 'signup' ? 'Start your address book' : 'Welcome back'} | Gather</title
  ></svelte:head
>
<div {...stylex.attrs(styles.shell)}>
  <section {...stylex.attrs(styles.story)}>
    <Brand />
    <div {...stylex.attrs(styles.storyBody)}>
      <h1 {...stylex.attrs(styles.title)}>Life moves.<br />Keep your<br />people close.</h1>
      <p {...stylex.attrs(styles.storyText)}>
        New places, new numbers, same good people. An address book that your friends help you fill.
      </p>
      <div {...stylex.attrs(styles.art)}><ContactStack /></div>
    </div>
    <p {...stylex.attrs(styles.storyFooter)}>
      <ShieldCheck size={16} />Private by invitation. Personal by nature.
    </p>
  </section>
  <main {...stylex.attrs(styles.formSide)}>
    <div {...stylex.attrs(styles.form)}>
      <h2 {...stylex.attrs(styles.formTitle)}>
        {mode === 'signup' ? 'Start your little circle.' : 'Good to see you again.'}
      </h2>
      <p {...stylex.attrs(styles.formIntro)}>
        {data.claim
          ? 'Your card is already shared. Save it here and make a space of your own.'
          : mode === 'signup'
            ? 'Your people, your own page, and no more lost addresses.'
            : 'Your people are right where you left them.'}
      </p>
      <button
        {...stylex.attrs(ui.button, ui.full)}
        disabled={!data.googleConfigured || busy}
        onclick={() => authenticate(true)}
        ><span {...stylex.attrs(styles.googleLetter)}>G</span>Continue with Google</button
      >{#if !data.googleConfigured}<p {...stylex.attrs(ui.help)}>
          Google sign-in isn’t available yet. You can use email below.
        </p>{/if}
      <div {...stylex.attrs(styles.divider)}>or with email</div>
      <form
        {...stylex.attrs(ui.formStack)}
        onsubmit={(event) => {
          event.preventDefault();
          void authenticate();
        }}
      >
        {#if mode === 'signup'}<label
            >Your name<input
              {...stylex.attrs(ui.input)}
              bind:value={name}
              autocomplete="name"
              required
              maxlength="80"
              placeholder="Augie"
            /></label
          >{/if}<label
          >Email address<input
            {...stylex.attrs(ui.input)}
            bind:value={email}
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          /></label
        ><label
          >Password<input
            {...stylex.attrs(ui.input)}
            bind:value={password}
            type="password"
            autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minlength="10"
            required
            placeholder={mode === 'signup' ? 'At least 10 characters' : 'Your password'}
          /></label
        >{#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}<button
          {...stylex.attrs(ui.button, ui.primary, ui.full)}
          disabled={busy}
          >{busy
            ? 'One moment…'
            : mode === 'signup'
              ? 'Create my address book'
              : 'Sign in'}<ArrowUpRight size={16} /></button
        >
      </form>
      <p {...stylex.attrs(styles.toggle)}>
        {mode === 'signup' ? 'Already have an account?' : 'New around here?'}
        <button
          {...stylex.attrs(styles.toggleButton)}
          onclick={() => {
            mode = mode === 'signup' ? 'signin' : 'signup';
            error = '';
          }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button
        >
      </p>
      <p {...stylex.attrs(styles.disclaimer)}>
        Your address book is private. Your friends can share a card without creating an account.
      </p>
    </div>
  </main>
</div>
