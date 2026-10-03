<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './Avatar.stylex.ts';
  import { Contact, type ContactInput } from '#lib/contact.ts';
  let { person, size = 40 }: { person: ContactInput; size?: number } = $props();
  const colors = ['#e9e6fa', '#e3eef5', '#f6e8dc', '#e4eee5', '#f3e3ea'];
  let color = $derived(colors[(person.firstName.charCodeAt(0) || 0) % colors.length]);
</script>

<span {...stylex.attrs(styles.avatar(size, color || '#e9e6fa'))}>
  {#if person.photo}<img
      {...stylex.attrs(styles.image)}
      src={person.photo}
      alt=""
      width={size}
      height={size}
    />{:else}{Contact.initials(person)}{/if}
</span>
