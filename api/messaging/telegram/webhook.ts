import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);

const ok = (res: any) => res.status(200).json({ ok: true });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return ok(res);
  }

  const integrationId = req.query.integrationId as string;
  if (!integrationId) {
    return res.status(400).json({ error: 'integrationId is required' });
  }

  const { data: integration, error } = await supabaseAdmin
    .from('messenger_integrations')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error || !integration) {
    return res.status(404).json({ error: 'integration not found' });
  }

  const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
  if (integration.webhook_secret && secretHeader !== integration.webhook_secret) {
    return res.status(403).json({ error: 'invalid secret token' });
  }

  const update = req.body;
  const message = update?.message || update?.edited_message;

  if (!message || (!message.text && !message.caption)) {
    return ok(res);
  }

  const chatId = String(message.chat?.id ?? '');
  if (!chatId) {
    return ok(res);
  }

  const { data: existingConversation } = await supabaseAdmin
    .from('messenger_conversations')
    .select('*')
    .eq('integration_id', integration.id)
    .eq('external_chat_id', chatId)
    .maybeSingle();

  let conversation = existingConversation;

  if (!conversation) {
    const { data: insertedConversation } = await supabaseAdmin
      .from('messenger_conversations')
      .insert({
        organization_id: integration.organization_id,
        integration_id: integration.id,
        channel: 'telegram',
        external_chat_id: chatId,
        channel_address: message.chat?.username ? `@${message.chat.username}` : null,
        title:
          message.chat?.username ||
          [message.chat?.first_name, message.chat?.last_name].filter(Boolean).join(' ') ||
          `Telegram ${chatId}`,
        metadata: {
          telegram: {
            chat: message.chat,
          },
        },
        last_message_at: new Date().toISOString(),
        last_message_preview: message.text || message.caption,
        unread_count: 1,
      })
      .select('*')
      .single();

    conversation = insertedConversation;
  }

  if (!conversation) {
    return res.status(500).json({ error: 'conversation insert failed' });
  }

  await supabaseAdmin.from('messenger_messages').insert({
    organization_id: integration.organization_id,
    integration_id: integration.id,
    conversation_id: conversation.id,
    direction: 'incoming',
    status: 'delivered',
    external_message_id: String(message.message_id ?? ''),
    sender_name:
      [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') ||
      message.from?.username ||
      'Telegram user',
    sender_meta: { telegram: message.from },
    body: message.text || message.caption || '',
    raw_payload: update,
  });

  await supabaseAdmin
    .from('messenger_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: message.text || message.caption || '',
      unread_count: (conversation.unread_count ?? 0) + 1,
    })
    .eq('id', conversation.id);

  return ok(res);
}


