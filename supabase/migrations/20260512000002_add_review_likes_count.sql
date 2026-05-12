ALTER TABLE reviews ADD COLUMN likes_count integer NOT NULL DEFAULT 0;

UPDATE reviews SET likes_count = (SELECT count(*) FROM review_likes WHERE review_id = reviews.id);

CREATE OR REPLACE FUNCTION update_review_likes_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET likes_count = likes_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET likes_count = likes_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_likes_count_trigger
  AFTER INSERT OR DELETE ON review_likes
  FOR EACH ROW EXECUTE FUNCTION update_review_likes_count();
