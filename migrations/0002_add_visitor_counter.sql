
-- Create the visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id INT PRIMARY KEY DEFAULT 1,
  count INT NOT NULL DEFAULT 0,
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert the initial row if it doesn't exist
INSERT INTO visitors (id, count)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;


-- Create the RPC function to increment the counter and return the new value
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE visitors
  SET count = count + 1
  WHERE id = 1
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;
