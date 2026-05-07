# Plan: Global Chips & Brands Search with Autocomplete

## Context

The app currently has trigram-based fuzzy search but only for two narrow use cases: detecting duplicate brands when adding a new brand, and detecting duplicate chips within a specific brand. There is no global search that lets users discover chips or brands from anywhere in the app.

The goal is a search bar in the nav that gives instant autocomplete suggestions (debounced, fuzzy) and can send the user to a full search results page.

---

## What already exists (reuse these)

- **`find_similar_brands(query, threshold=0.3)`** — Supabase RPC, already deployed, returns up to 6 brand matches by slug similarity + prefix boost. Works as-is.
- **`p-debounce`** — already a dependency, used in `SimilarItemsWarning.tsx`.
- **`Autocomplete.tsx`** — existing client-side combobox with keyboard nav and ARIA. We won't reuse its code directly (it's pre-loaded options, not async), but we'll follow its patterns.
- **`app/routes.ts`** — typed routes registry; we'll add the `/search` route here.
- **DaisyUI + Tailwind** — all styling must match the existing pattern.

---

## What needs to be built

### 1. New SQL migration — paginated search functions

Two new functions with `limit_count` + `offset_count` parameters so both the autocomplete (small limit) and the results page (larger limit + pagination) share the same RPC.

The existing `find_similar_brands` and `find_similar_chips` functions expect a **pre-slugified** string — slugification happens in JavaScript before calling the RPC, not inside the SQL. The new functions follow the same convention: the `query` parameter is already a slug.

**`search_chips`** — global chip search, joins brand name/slug:

```sql
CREATE OR REPLACE FUNCTION search_chips(
  query text,           -- caller must pass an already-slugified string
  threshold float DEFAULT 0.3,
  limit_count int DEFAULT 6,
  offset_count int DEFAULT 0
)
RETURNS TABLE(id uuid, name text, slug text, photo_url text, brand_id uuid, brand_name text, brand_slug text, score float)
LANGUAGE sql STABLE AS $$
  SELECT
    c.id, c.name, c.slug, c.photo_url, c.brand_id,
    b.name AS brand_name, b.slug AS brand_slug,
    GREATEST(
      similarity(c.slug, query),
      CASE WHEN c.slug ILIKE query || '%' THEN 0.99 ELSE 0 END
    ) AS score
  FROM chips c
  JOIN brands b ON b.id = c.brand_id
  WHERE similarity(c.slug, query) > threshold
     OR c.slug ILIKE query || '%'
  ORDER BY score DESC
  LIMIT limit_count OFFSET offset_count;
$$;
```

**`search_brands`** — paginated variant; the old `find_similar_brands` stays untouched (still used by add-brand duplicate detection):

```sql
CREATE OR REPLACE FUNCTION search_brands(
  query text,           -- caller must pass an already-slugified string
  threshold float DEFAULT 0.3,
  limit_count int DEFAULT 6,
  offset_count int DEFAULT 0
)
RETURNS TABLE(id uuid, name text, slug text, logo_url text, score float)
LANGUAGE sql STABLE AS $$
  SELECT
    id, name, slug, logo_url,
    GREATEST(
      similarity(slug, query),
      CASE WHEN slug ILIKE query || '%' THEN 0.99 ELSE 0 END
    ) AS score
  FROM brands
  WHERE similarity(slug, query) > threshold
     OR slug ILIKE query || '%'
  ORDER BY score DESC
  LIMIT limit_count OFFSET offset_count;
$$;
```

File: `supabase/migrations/<timestamp>_search_global.sql`

### 2. New server actions

Location: `app/search/actions.ts`

Two actions — one for autocomplete (fixed small limit), one for the results page (paginated):

```ts
// slugify is the npm package — converts user input to a slug before hitting the RPC
// (matches the pattern in app/brands/new/actions.ts and app/chips/new/actions.ts)

// Autocomplete: returns up to 3 of each type
export async function searchSuggestions(query: string) {
  const slug = slugify(query, { lower: true, strict: true });
  const supabase = await createClient();
  const [chips, brands] = await Promise.all([
    supabase.rpc("search_chips", { query: slug, limit_count: 3 }),
    supabase.rpc("search_brands", { query: slug, limit_count: 3 }),
  ]);
  return {
    chips: chips.data ?? [],
    brands: brands.data ?? [],
  };
}

// Results page: paginated — page is a UI concept; the action converts it to SQL offset
export async function searchResults(query: string, page = 0, pageSize = 20) {
  const slug = slugify(query, { lower: true, strict: true });
  const offset = page * pageSize;  // page → SQL OFFSET translation happens here
  const supabase = await createClient();
  const [chips, brands] = await Promise.all([
    supabase.rpc("search_chips", { query: slug, limit_count: pageSize, offset_count: offset }),
    supabase.rpc("search_brands", { query: slug, limit_count: pageSize, offset_count: offset }),
  ]);
  return { chips: chips.data ?? [], brands: brands.data ?? [] };
}
```

### 3. New `SearchBar` component

Location: `app/components/SearchBar.tsx`

- `"use client"` component
- Controlled input, debounced 350ms via `p-debounce`
- Calls `searchSuggestions` server action on each debounced keystroke
- Renders a DaisyUI `dropdown` below the input showing:
  - Section headers: "Chips" / "Brands" (only if results exist)
  - Up to 3 chip results — name + brand name, links to `/chips/[slug]`
  - Up to 3 brand results — name, links to `/brands/[slug]`
  - A "See all N results" item at the bottom (when there are results), links to `/search?q=...`
- Keyboard: Enter submits to `/search?q=...`, Escape clears/closes, arrow keys navigate list
- Empty state: no dropdown when query < 2 chars or no results

### 4. New search results page

Location: `app/search/page.tsx`

- Server component, reads `searchParams.q` and `searchParams.page` (default 0)
- Calls `searchResults(q, page, 20)` server action
- Renders two sections: chips grid (using `ChipCard`) and brands grid (using `BrandCard`)
- Pagination controls at the bottom (previous/next) — only shown when a section has results
- If no results at all, shows a friendly empty state

### 5. Wire into Nav

Location: `app/components/Nav.tsx`

- Add `<SearchBar />` between the logo and the profile menu
- Nav is currently an async server component — `SearchBar` is a client component so it can be imported directly

### 6. Add route constant

Location: `app/routes.ts`

```ts
search: "/search" as Route,
```

---

## Critical files to modify

| File | Change |
|------|--------|
| `supabase/migrations/<ts>_search_global.sql` | New migration — `search_chips` + `search_brands` with pagination params |
| `app/search/actions.ts` | New — `searchSuggestions` (autocomplete) + `searchResults` (paginated) |
| `app/components/SearchBar.tsx` | New — debounced autocomplete UI |
| `app/search/page.tsx` | New — full results page |
| `app/components/Nav.tsx` | Add `<SearchBar />` |
| `app/routes.ts` | Add `search` route |

---

## Verification

1. Run `supabase db push` (or apply migration locally) and confirm `search_chips` RPC exists.
2. Start dev server (`npm run dev`), type in the nav search bar — confirm dropdown appears with chip + brand suggestions.
3. Press Enter or click "See all" — confirm redirect to `/search?q=...` with full results.
4. Test edge cases: < 2 chars (no dropdown), no matches (no dropdown), brand-only match, chip-only match.
5. Check keyboard nav: arrows move highlight, Enter navigates, Escape closes.
