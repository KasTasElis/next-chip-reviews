CREATE OR REPLACE FUNCTION public.search_chips(
  query        text,
  min_rating   numeric          DEFAULT 0,
  page_limit   integer          DEFAULT 32,
  page_offset  integer          DEFAULT 0,
  threshold    double precision DEFAULT 0.1,
  sort_by      text             DEFAULT NULL,
  sort_order   text             DEFAULT 'desc'
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
    CASE WHEN sort_by = 'average_rating' AND sort_order = 'desc' THEN cws.average_rating END DESC NULLS LAST,
    CASE WHEN sort_by = 'average_rating' AND sort_order = 'asc'  THEN cws.average_rating END ASC  NULLS LAST,
    CASE WHEN sort_by = 'review_count'   AND sort_order = 'desc' THEN cws.review_count   END DESC NULLS LAST,
    CASE WHEN sort_by = 'review_count'   AND sort_order = 'asc'  THEN cws.review_count   END ASC  NULLS LAST,
    similarity(cws.slug, query) DESC,
    cws.id ASC
  LIMIT page_limit
  OFFSET page_offset;
$$;

GRANT EXECUTE ON FUNCTION public.search_chips(text, numeric, integer, integer, double precision, text, text)
  TO anon, authenticated, service_role;
