CREATE INDEX IF NOT EXISTS brands_slug_trgm_idx
  ON public.brands
  USING GIN (slug gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.search_brands(
  query        text,
  page_limit   integer          DEFAULT 30,
  page_offset  integer          DEFAULT 0,
  threshold    double precision DEFAULT 0.1
)
RETURNS SETOF public.brands
LANGUAGE sql STABLE
AS $$
  SELECT b.*
  FROM public.brands AS b
  WHERE
    similarity(b.slug, query) > threshold
    OR b.slug ILIKE query || '%'
  ORDER BY
    GREATEST(
      similarity(b.slug, query),
      CASE WHEN b.slug ILIKE query || '%' THEN 0.99 ELSE 0 END
    ) DESC,
    b.id ASC
  LIMIT page_limit
  OFFSET page_offset;
$$;

GRANT EXECUTE ON FUNCTION public.search_brands(text, integer, integer, double precision)
  TO anon, authenticated, service_role;
