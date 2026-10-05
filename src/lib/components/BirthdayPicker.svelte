<script lang="ts">
  import { onMount } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { DatePicker } from 'bits-ui';
  import {
    CalendarDate,
    getLocalTimeZone,
    isSameMonth,
    isToday,
    parseDate,
    today,
    type DateValue
  } from '@internationalized/date';
  import { CalendarDays, ChevronLeft, ChevronRight, X } from '@lucide/svelte';
  import { styles } from './BirthdayPicker.stylex.ts';
  let {
    id,
    value,
    invalid = false,
    describedby,
    onchange
  }: {
    id: string;
    /** YYYY-MM-DD, or empty. */
    value: string;
    invalid?: boolean;
    describedby?: string;
    onchange: (value: string) => void;
  } = $props();
  const now = today(getLocalTimeZone());
  const min = new CalendarDate(1900, 1, 1);
  // Most recent years first, since that is where most birthdays are.
  const years = Array.from({ length: now.year - min.year + 1 }, (_, index) => now.year - index);
  let locale = $state('en-US');
  onMount(() => {
    locale = navigator.language;
  });
  let date = $derived.by(() => {
    try {
      return value ? parseDate(value) : undefined;
    } catch {
      return undefined;
    }
  });
  // Without a date, open the calendar around a typical adult birthday instead of today.
  let placeholder = $state<DateValue>(now.subtract({ years: 25 }));
  let open = $state(false);
</script>

<DatePicker.Root
  bind:value={() => date, (next) => onchange(next ? next.toString() : '')}
  bind:placeholder
  bind:open
  minValue={min}
  maxValue={now}
  {locale}
  weekdayFormat="short"
  fixedWeeks
  calendarLabel="Birthday"
>
  <DatePicker.Input
    {...stylex.attrs(styles.field, invalid && styles.invalid)}
    aria-describedby={describedby}
    aria-invalid={invalid || undefined}
  >
    {#snippet children({ segments })}
      <div {...stylex.attrs(styles.segments)}>
        {#each segments as { part, value: text }, index (`${part}-${index}`)}
          {#if part === 'literal'}<span {...stylex.attrs(styles.literal)}>{text}</span
            >{:else}<DatePicker.Segment
              {part}
              id={index === 0 ? id : undefined}
              {...stylex.attrs(styles.segment, !/\d/.test(text) && styles.empty)}
              >{text}</DatePicker.Segment
            >{/if}
        {/each}
      </div>
      {#if value}<button
          type="button"
          {...stylex.attrs(styles.icon)}
          aria-label="Clear birthday"
          onclick={() => onchange('')}><X size={15} /></button
        >{/if}
      <DatePicker.Trigger
        {...stylex.attrs(styles.icon)}
        aria-label="Choose birthday from a calendar"><CalendarDays size={16} /></DatePicker.Trigger
      >
    {/snippet}
  </DatePicker.Input>
  <!-- Rendered in place so it also works inside modal dialogs, which sit above portals. -->
  <DatePicker.Portal disabled>
    <DatePicker.Content {...stylex.attrs(styles.content)} side="bottom" align="end" sideOffset={6}>
      <DatePicker.Calendar>
        {#snippet children({ months, weekdays })}
          <DatePicker.Header {...stylex.attrs(styles.header)}>
            <DatePicker.MonthSelect {...stylex.attrs(styles.select)} monthFormat="short" />
            <DatePicker.YearSelect {...stylex.attrs(styles.select)} {years} />
            <span {...stylex.attrs(styles.spacer)}></span>
            <DatePicker.PrevButton {...stylex.attrs(styles.nav)} aria-label="Previous month"
              ><ChevronLeft size={16} /></DatePicker.PrevButton
            >
            <DatePicker.NextButton {...stylex.attrs(styles.nav)} aria-label="Next month"
              ><ChevronRight size={16} /></DatePicker.NextButton
            >
          </DatePicker.Header>
          {#each months as month (month.value.toString())}
            <DatePicker.Grid {...stylex.attrs(styles.grid)}>
              <DatePicker.GridHead>
                <DatePicker.GridRow {...stylex.attrs(styles.row)}>
                  {#each weekdays as weekday (weekday)}
                    <DatePicker.HeadCell {...stylex.attrs(styles.weekday)}
                      >{weekday.slice(0, 2)}</DatePicker.HeadCell
                    >
                  {/each}
                </DatePicker.GridRow>
              </DatePicker.GridHead>
              <DatePicker.GridBody>
                {#each month.weeks as week, index (index)}
                  <DatePicker.GridRow {...stylex.attrs(styles.row)}>
                    {#each week as day (day.toString())}
                      <DatePicker.Cell
                        date={day}
                        month={month.value}
                        {...stylex.attrs(styles.cell)}
                      >
                        <DatePicker.Day>
                          {#snippet child({ props, selected, disabled })}
                            <div
                              {...props}
                              {...stylex.attrs(
                                styles.day,
                                !isSameMonth(day, month.value) && styles.outside,
                                isToday(day, getLocalTimeZone()) && styles.today,
                                disabled && styles.disabled,
                                selected && styles.selected
                              )}
                            >
                              {day.day}
                            </div>
                          {/snippet}
                        </DatePicker.Day>
                      </DatePicker.Cell>
                    {/each}
                  </DatePicker.GridRow>
                {/each}
              </DatePicker.GridBody>
            </DatePicker.Grid>
          {/each}
        {/snippet}
      </DatePicker.Calendar>
    </DatePicker.Content>
  </DatePicker.Portal>
</DatePicker.Root>
