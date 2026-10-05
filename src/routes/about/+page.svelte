<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import Brand from '#lib/components/Brand.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import { styles } from '#lib/public-info.stylex.ts';
  import { ui } from '#lib/ui.stylex.ts';
</script>

<svelte:head><title>About Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(styles.page)}>
  <header {...stylex.attrs(styles.header)}>
    <Brand /><a {...stylex.attrs(styles.link)} href="/login">Sign in</a>
  </header>
  <main {...stylex.attrs(styles.content)}>
    <h1>An address book your friends fill in.</h1>
    <p>
      Contacts Exchange helps you collect contact details from people you know. Create a private
      invitation link, send it to a friend, and let them add their own information. They don’t need
      an account.
    </p>
    <section {...stylex.attrs(styles.section)}>
      <h2>One link for each person</h2>
      <p>
        Each invitation works once and expires after 30 days. Friends can share their name, email,
        phone number, mailing address, birthday, photo, and other details. Your collected contacts
        are visible in your private dashboard.
      </p>
    </section>
    <section {...stylex.attrs(styles.section)}>
      <h2>Take your contacts with you</h2>
      <p>
        Download a vCard file for your address book, or connect Google Contacts and choose when to
        add your collected contacts. Cards that match an existing Google contact fill in its missing
        details instead of creating a duplicate, and you choose what happens to details that differ.
        Google sign-in and Contacts access are separate choices.
      </p>
    </section>
    <div>
      <a {...stylex.attrs(ui.button, ui.primary)} href="/login">Create your address book</a>
    </div>
  </main>
  <Footer />
</div>
