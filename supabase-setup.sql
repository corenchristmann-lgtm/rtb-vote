-- RTB Vote — Tables Supabase
-- A executer dans l'instance tekyulfbtdxeowaiwqbs

-- 1. Table des invites (110 personnes)
CREATE TABLE IF NOT EXISTS rtb_guests (
  id serial PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  has_voted boolean DEFAULT false,
  voted_at timestamptz,
  UNIQUE(lower(first_name), lower(last_name))
);

-- 2. Table des 8 finalistes
CREATE TABLE IF NOT EXISTS rtb_finalists (
  id serial PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  project_name text NOT NULL,
  description text NOT NULL,
  photo_url text NOT NULL,
  display_order int DEFAULT 0
);

-- 3. Table des votes
CREATE TABLE IF NOT EXISTS rtb_votes (
  id serial PRIMARY KEY,
  guest_id int REFERENCES rtb_guests(id) UNIQUE,
  finalist_id int REFERENCES rtb_finalists(id),
  created_at timestamptz DEFAULT now()
);

-- 4. Row Level Security
ALTER TABLE rtb_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtb_finalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtb_votes ENABLE ROW LEVEL SECURITY;

-- Anon peut lire les invites (pour la verification login)
CREATE POLICY "anon_read_guests" ON rtb_guests
  FOR SELECT TO anon USING (true);

-- Anon peut mettre a jour has_voted
CREATE POLICY "anon_update_guest_voted" ON rtb_guests
  FOR UPDATE TO anon USING (true)
  WITH CHECK (true);

-- Anon peut lire les finalistes
CREATE POLICY "anon_read_finalists" ON rtb_finalists
  FOR SELECT TO anon USING (true);

-- Anon peut inserer un vote
CREATE POLICY "anon_insert_vote" ON rtb_votes
  FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- EXEMPLES : comment inserer les donnees
-- ============================================

-- Inserer un finaliste :
-- INSERT INTO rtb_finalists (first_name, last_name, project_name, description, photo_url, display_order)
-- VALUES ('Matteo', 'Raffaelli', 'Bissap Origins', 'Boissons naturelles a base d''hibiscus africain.', 'https://example.com/photo.jpg', 1);

-- Inserer un invite :
-- INSERT INTO rtb_guests (first_name, last_name)
-- VALUES ('Jean', 'Dupont');

-- Import CSV d'invites (via Supabase Dashboard > Table Editor > Import CSV)
