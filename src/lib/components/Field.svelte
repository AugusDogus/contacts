<script lang="ts">
  import type { Snippet } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './Field.stylex.ts';
  type Control = { id: string; invalid: boolean; describedby: string | undefined };
  let {
    id,
    label,
    required = false,
    error = '',
    wide = false,
    stretchOnMobile = false,
    children,
    after
  }: {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    /** Spans both columns of the form grid. */
    wide?: boolean;
    /** Spans the full row only on narrow screens. */
    stretchOnMobile?: boolean;
    children: Snippet<[Control]>;
    /** Shown under the control when there is no error, such as a suggestion. */
    after?: Snippet;
  } = $props();
</script>

<div
  {...stylex.attrs(styles.field, wide && styles.wide, stretchOnMobile && styles.stretchOnMobile)}
>
  <label {...stylex.attrs(styles.label)} for={id}
    >{label}{#if required}<span {...stylex.attrs(styles.required)}>required</span>{/if}</label
  >
  {@render children({
    id,
    invalid: Boolean(error),
    describedby: error ? `${id}-error` : undefined
  })}
  {#if error}<p id="{id}-error" {...stylex.attrs(styles.error)}>
      {error}
    </p>{:else if after}{@render after()}{/if}
</div>
