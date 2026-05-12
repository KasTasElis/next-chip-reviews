CREATE TABLE review_likes (
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON review_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert own likes" ON review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON review_likes
  FOR DELETE USING (auth.uid() = user_id);
