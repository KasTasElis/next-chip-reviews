CREATE INDEX IF NOT EXISTS chips_slug_trgm_idx
  ON public.chips
  USING GIN (slug gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.search_chips(
  query        text,
  min_rating   numeric          DEFAULT 0,
  page_limit   integer          DEFAULT 32,
  page_offset  integer          DEFAULT 0,
  threshold    double precision DEFAULT 0.1
)
RETURNS SETOF public.chips_with_stats
LANGUAGE sql STABLE
AS $$
  SELECT cws.*
  FROM public.chips_with_stats AS cws
  WHERE
    similarity(cws.slug, query) > threshold
    AND (min_rating = 0 OR cws.average_rating >= min_rating)
  ORDER BY
    similarity(cws.slug, query) DESC,
    cws.id ASC
  LIMIT page_limit
  OFFSET page_offset;
$$;

GRANT EXECUTE ON FUNCTION public.search_chips(text, numeric, integer, integer, double precision)
  TO anon, authenticated, service_role;
