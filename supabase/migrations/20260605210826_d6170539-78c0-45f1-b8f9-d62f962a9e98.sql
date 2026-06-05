-- Remove em-dashes (—) from all forms titles/descriptions/schema
UPDATE forms
SET 
  title = replace(title, '—', '·'),
  description = replace(description, '—', ','),
  schema = replace(schema::text, '—', ',')::jsonb
WHERE (title || coalesce(description,'') || coalesce(schema::text,'')) LIKE '%—%';