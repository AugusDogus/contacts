<script lang="ts">
  import { page } from '$app/state';
  import {
    createInvitations,
    deleteContact,
    deleteInvitation,
    getAddressBook,
    renameInvitation,
    renewInvitation
  } from '#lib/contacts.remote.ts';
  import { invitationUrl } from '#lib/links.ts';
  import type { AddressBookActions } from '#lib/address-book-actions.ts';
  import PeopleView from '#lib/components/PeopleView.svelte';
  let book = $derived(await getAddressBook());
  const actions: AddressBookActions = {
    createInvitations,
    deleteInvitation,
    renewInvitation,
    renameInvitation,
    deleteContact,
    invitationUrl: (token, slug) => invitationUrl(token, page.url.origin, slug),
    vcardHref: (contact) => `/export?id=${contact.id}`,
    exportHref: '/google',
    formHref: '/settings#form'
  };
</script>

<svelte:head><title>People | Contacts Exchange</title></svelte:head>
<PeopleView {book} {actions} />
