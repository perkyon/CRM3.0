-- ============================================
-- 📬 Messaging integrations (Telegram + WhatsApp)
-- ============================================

-- Required enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'messenger_channel') THEN
    CREATE TYPE messenger_channel AS ENUM ('telegram', 'whatsapp');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'messenger_integration_status') THEN
    CREATE TYPE messenger_integration_status AS ENUM ('disconnected', 'connecting', 'connected', 'error');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_direction') THEN
    CREATE TYPE message_direction AS ENUM ('incoming', 'outgoing');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
    CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
  END IF;
END $$;

-- Helper extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Integrations table
CREATE TABLE IF NOT EXISTS messenger_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel messenger_channel NOT NULL,
  status messenger_integration_status NOT NULL DEFAULT 'disconnected',
  display_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  webhook_url TEXT,
  webhook_secret TEXT,
  last_error TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_messenger_integrations_org_channel
  ON messenger_integrations(organization_id, channel);

-- Conversations table
CREATE TABLE IF NOT EXISTS messenger_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES messenger_integrations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  channel messenger_channel NOT NULL,
  external_chat_id TEXT NOT NULL,
  channel_address TEXT,
  title TEXT,
  last_message_preview TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (integration_id, external_chat_id)
);

CREATE INDEX IF NOT EXISTS idx_messenger_conversations_org
  ON messenger_conversations(organization_id);

CREATE INDEX IF NOT EXISTS idx_messenger_conversations_client
  ON messenger_conversations(client_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messenger_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES messenger_conversations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES messenger_integrations(id) ON DELETE CASCADE,
  direction message_direction NOT NULL,
  status message_status NOT NULL DEFAULT 'pending',
  external_message_id TEXT,
  sender_name TEXT,
  sender_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messenger_messages_conversation
  ON messenger_messages(conversation_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_messenger_messages_org
  ON messenger_messages(organization_id);

-- Updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'messenger_integrations_updated_at'
  ) THEN
    CREATE TRIGGER messenger_integrations_updated_at
      BEFORE UPDATE ON messenger_integrations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'messenger_conversations_updated_at'
  ) THEN
    CREATE TRIGGER messenger_conversations_updated_at
      BEFORE UPDATE ON messenger_conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'messenger_messages_updated_at'
  ) THEN
    CREATE TRIGGER messenger_messages_updated_at
      BEFORE UPDATE ON messenger_messages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS policies
ALTER TABLE messenger_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messenger_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messenger_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- messenger_integrations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members manage messenger integrations'
  ) THEN
    CREATE POLICY "org members manage messenger integrations"
      ON messenger_integrations
      USING (user_has_access_to_org(auth.uid(), organization_id))
      WITH CHECK (user_has_access_to_org(auth.uid(), organization_id));
  END IF;

  -- messenger_conversations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members manage messenger conversations'
  ) THEN
    CREATE POLICY "org members manage messenger conversations"
      ON messenger_conversations
      USING (user_has_access_to_org(auth.uid(), organization_id))
      WITH CHECK (user_has_access_to_org(auth.uid(), organization_id));
  END IF;

  -- messenger_messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members manage messenger messages'
  ) THEN
    CREATE POLICY "org members manage messenger messages"
      ON messenger_messages
      USING (user_has_access_to_org(auth.uid(), organization_id))
      WITH CHECK (user_has_access_to_org(auth.uid(), organization_id));
  END IF;
END $$;

-- Helper view for unread counters (optional)
CREATE OR REPLACE VIEW messenger_conversation_with_unread AS
SELECT
  c.*,
  (
    SELECT COUNT(1)
    FROM messenger_messages m
    WHERE m.conversation_id = c.id
      AND m.direction = 'incoming'
      AND m.status IN ('sent', 'delivered')
  ) AS computed_unread
FROM messenger_conversations c;

COMMENT ON TABLE messenger_integrations IS 'Connected messaging channels (Telegram / WhatsApp)';
COMMENT ON TABLE messenger_conversations IS 'Client-facing threads per messenger channel';
COMMENT ON TABLE messenger_messages IS 'Normalized chat messages across channels';


