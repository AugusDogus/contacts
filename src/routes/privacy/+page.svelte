<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import Brand from '#lib/components/Brand.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import { styles } from '#lib/public-info.stylex.ts';
</script>

<svelte:head><title>Privacy | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(styles.page)}>
  <header {...stylex.attrs(styles.header)}>
    <Brand /><a {...stylex.attrs(styles.link)} href="/about">About</a>
  </header>
  <main {...stylex.attrs(styles.content)}>
    <h1>Privacy</h1>
    <p>
      Updated October 3, 2026. For privacy questions or deletion requests, contact <a
        {...stylex.attrs(styles.link)}
        href="mailto:augie@contacts.exchange">augie@contacts.exchange</a
      >.
    </p>
    <section {...stylex.attrs(styles.section)}>
      <h2>Information we store</h2>
      <p>
        When you create an account, we store your name, email, account identifiers, and sign-in
        information. Email accounts use a password hash. Google sign-in provides basic profile
        information, such as your name, email, and profile image.
      </p>
      <p>
        When you fill in an invitation, we store the contact details you choose to share, which may
        include your name, email, phone number, address, birthday, pronouns, company, website,
        notes, and photo. We also store invitation labels, status, expiration dates, and submission
        dates.
      </p>
      <p>
        Session cookies keep you signed in. A temporary cookie can link a submitted contact card to
        an account you create. Our hosting and authentication services may process technical
        information such as IP addresses and browser details to operate and protect the service.
      </p>
    </section>
    <section {...stylex.attrs(styles.section)}>
      <h2>How information is used and shared</h2>
      <p>
        We use this information to sign you in, deliver invitations and contact cards, display your
        address book, prevent repeated submissions, and provide exports. Your page name and note are
        public. Collected contact cards are available to the person whose invitation you used, who
        can download them or export them to other apps. An invitation can be forwarded, so share
        links only with the intended recipient.
      </p>
      <p>
        Vercel hosts the application, and Turso stores application data. These providers process
        data to deliver the service. Connecting Google Contacts sends the cards you choose to export
        to Google. Information may also be disclosed when required by law or necessary to protect
        the service and its users.
      </p>
    </section>
    <section {...stylex.attrs(styles.section)}>
      <h2>Google account access</h2>
      <p>
        Basic Google sign-in uses your identity information. Connecting Google Contacts separately
        requests permission to manage contacts because Google requires that scope to create contacts
        and add their photos. The app uses this permission only to add cards when you request an
        export. It does not read, delete, or modify your existing Google contacts.
      </p>
      <p>
        We store encrypted Google access and refresh tokens to maintain your connection, along with
        identifiers and export status for contacts created through the app to avoid repeating
        exports. We do not sell Google user data, use it for advertising, or use it to train AI
        models.
      </p>
      <p>
        Contacts Exchange’s use and transfer of information received from Google APIs adheres to the <a
          {...stylex.attrs(styles.link)}
          href="https://developers.google.com/terms/api-services-user-data-policy"
          >Google API Services User Data Policy</a
        >, including its Limited Use requirements.
      </p>
    </section>
    <section {...stylex.attrs(styles.section)}>
      <h2>Retention and deletion</h2>
      <p>
        Account and contact information stays stored until it is deleted. Invitation expiry stops
        submissions but does not delete the invitation record or a previously submitted card.
        Address book owners can remove collected contacts in the app. You can request deletion of
        your account, saved card, or other personal data by emailing us; we may need to verify your
        identity.
      </p>
      <p>
        You can revoke Google access in your <a
          {...stylex.attrs(styles.link)}
          href="https://myaccount.google.com/connections">Google Account connections</a
        >. Revoking access prevents further authorized exports but does not delete information
        already stored here or contacts already added to Google. Deleting a card here does not
        remove copies downloaded or exported by its recipient. Contact the recipient to remove those
        copies.
      </p>
    </section>
    <section {...stylex.attrs(styles.section)}>
      <h2>Changes</h2>
      <p>Changes to this policy will appear on this page with an updated date.</p>
    </section>
  </main>
  <Footer />
</div>
