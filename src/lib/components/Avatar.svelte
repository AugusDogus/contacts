<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { styles, colors } from './Avatar.stylex.ts';
  import { Contact, type ContactInput } from '#lib/contact.ts';
  let { person, size = 40 }: { person: ContactInput; size?: number } = $props();
  const palette = [colors.violet, colors.sky, colors.peach, colors.mint, colors.rose];
  let color = $derived(palette[(person.firstName.charCodeAt(0) || 0) % palette.length]);
</script>

<span
  {...stylex.attrs(styles.avatar, color)}
  style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.36)}px"
>
  {#if person.photo}<img
      {...stylex.attrs(styles.image)}
      src={person.photo}
      alt=""
      width={size}
      height={size}
    />{:else}{Contact.initials(person)}{/if}
</span>
