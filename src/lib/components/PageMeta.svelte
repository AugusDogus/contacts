<script lang="ts">
  import { page } from '$app/state';
  // Title, description, canonical URL and social cards for a public page.
  let { title, description, path }: { title: string; description: string; path: `/${string}` } =
    $props();
  let origin = $derived(page.data.appUrl ?? page.url.origin);
  let url = $derived(`${origin}${path}`);
  let image = $derived(`${origin}/og.png`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Contacts Exchange" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta
    property="og:image:alt"
    content="Contacts Exchange: an address book your friends fill in, beside the otter mascot holding a card."
  />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
