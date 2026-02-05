-- Migration 023: Twitter Settings for Goals
-- Adds columns to goals table for per-goal Twitter consequence customization

-- Add Twitter message preset column
ALTER TABLE goals ADD COLUMN IF NOT EXISTS twitter_message_preset TEXT
  DEFAULT 'dramatic_shame'
  CHECK (twitter_message_preset IN ('dramatic_shame', 'public_confession', 'accountability_notice', 'custom'));

-- Add custom Twitter message column (for when preset is 'custom')
ALTER TABLE goals ADD COLUMN IF NOT EXISTS twitter_custom_message TEXT;

-- Add toggle for including kompromat image in tweet
ALTER TABLE goals ADD COLUMN IF NOT EXISTS twitter_include_kompromat BOOLEAN DEFAULT true;

-- Add comment explaining the columns
COMMENT ON COLUMN goals.twitter_message_preset IS 'Preset style for Twitter consequence tweets: dramatic_shame, public_confession, accountability_notice, or custom';
COMMENT ON COLUMN goals.twitter_custom_message IS 'Custom tweet text when twitter_message_preset is set to custom (max 280 chars)';
COMMENT ON COLUMN goals.twitter_include_kompromat IS 'Whether to attach kompromat image to the shame tweet';

-- Add check constraint for custom message length (Twitter max 280 chars)
ALTER TABLE goals ADD CONSTRAINT twitter_custom_message_length
  CHECK (twitter_custom_message IS NULL OR char_length(twitter_custom_message) <= 280);
