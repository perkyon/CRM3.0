import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);

const extractMessages = (body: any) => {
  const entries = body?.entry ?? [];
  const messages: any[] = [];

  entries.forEach((entry: any) => {
    entry?.changes?.forEach((change: any) => {
      if (Array.isArray(change?.value?.messages)) {
        messages.push(...change.value.messages);
      }
    });
  });

  return messages;
};

const ok = (res: any, payload: object = { ok: true }) => res.status(200).json(payload);

export default async function handler(req: any, res: any) {
  const integrationId = (req.query.integrationId || req.query.integration_id) as string | undefined;

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

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === integration.webhook_secret) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden');
  }

  if (req.method !== 'POST') {
    return ok(res);
  }

  const messages = extractMessages(req.body);
  if (!messages.length) {
    return ok(res);
  }

  for (const message of messages) {
    const contact = message.from;
    if (!contact) {
      continue;
    }

    const { data: existingConversation } = await supabaseAdmin
      .from('messenger_conversations')
      .select('*')
      .eq('integration_id', integration.id)
      .eq('external_chat_id', contact)
      .maybeSingle();

    let conversation = existingConversation;
    if (!conversation) {
      const { data: inserted } = await supabaseAdmin
        .from('messenger_conversations')
        .insert({
          organization_id: integration.organization_id,
          integration_id: integration.id,
          channel: 'whatsapp',
          external_chat_id: contact,
          channel_address: `+${contact}`,
          title: `WhatsApp ${contact}`,
          metadata: {
            whatsapp: {
              profile: message.profile,
            },
          },
          last_message_preview: '',
        })
        .select('*')
        .single();

      conversation = inserted;
    }

    if (!conversation) continue;

    const textBody =
      message.text?.body ||
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.title ||
      '[unsupported message type]';

    await supabaseAdmin.from('messenger_messages').insert({
      organization_id: integration.organization_id,
      integration_id: integration.id,
      conversation_id: conversation.id,
      direction: 'incoming',
      status: 'delivered',
      external_message_id: message.id,
      sender_name: contact,
      sender_meta: { whatsapp: message },
      body: textBody,
      raw_payload: message,
    });

    await supabaseAdmin
      .from('messenger_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: textBody,
        unread_count: (conversation.unread_count ?? 0) + 1,
      })
      .eq('id', conversation.id);
  }

  return ok(res);
}


