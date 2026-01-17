import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENVS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

const ensureEnv = () => {
  REQUIRED_ENVS.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
};

const supabaseAdmin = (() => {
  ensureEnv();
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();

const updateMessageStatus = async (messageId: string, status: string, extra: Record<string, any> = {}) => {
  await supabaseAdmin
    .from('messenger_messages')
    .update({
      status,
      ...extra,
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId);
};

const sendTelegram = async (params: { botToken: string; chatId: string; text: string }) => {
  const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.text,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Telegram error ${response.status}: ${payload}`);
  }

  const payload = await response.json();
  return {
    externalMessageId: payload?.result?.message_id,
  };
};

const sendWhatsApp = async (params: { accessToken: string; phoneNumberId: string; to: string; text: string }) => {
  const response = await fetch(`https://graph.facebook.com/v20.0/${params.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: params.to.replace(/[^0-9+]/g, ''),
      type: 'text',
      text: {
        body: params.text,
      },
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`WhatsApp error ${response.status}: ${payload}`);
  }

  const payload = await response.json();
  return {
    externalMessageId: payload?.messages?.[0]?.id,
  };
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messageId } = req.body || {};
  if (!messageId) {
    return res.status(400).json({ error: 'messageId is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('messenger_messages')
    .select(
      `
      *,
      conversation:messenger_conversations(*),
      integration:messenger_integrations(*)
    `,
    )
    .eq('id', messageId)
    .single();

  if (error || !data) {
    await updateMessageStatus(messageId, 'failed', { sender_meta: { reason: error?.message || 'Message not found' } });
    return res.status(404).json({ error: 'Message not found' });
  }

  if (!data?.conversation || !data?.integration) {
    await updateMessageStatus(messageId, 'failed', { sender_meta: { reason: 'Conversation or integration not linked' } });
    return res.status(400).json({ error: 'Invalid conversation or integration link' });
  }

  try {
    let externalMessageId: string | undefined;

    if (data.conversation.channel === 'telegram') {
      const botToken = data.integration.credentials?.botToken;
      if (!botToken) {
        throw new Error('Bot token not configured');
      }
      const result = await sendTelegram({
        botToken,
        chatId: data.conversation.external_chat_id,
        text: data.body,
      });
      externalMessageId = result.externalMessageId;
    } else if (data.conversation.channel === 'whatsapp') {
      const accessToken = data.integration.credentials?.accessToken;
      const phoneNumberId = data.integration.credentials?.phoneNumberId;
      if (!accessToken || !phoneNumberId) {
        throw new Error('WhatsApp credentials are incomplete');
      }
      const result = await sendWhatsApp({
        accessToken,
        phoneNumberId,
        to: data.conversation.external_chat_id,
        text: data.body,
      });
      externalMessageId = result.externalMessageId;
    } else {
      throw new Error(`Unsupported channel ${data.conversation.channel}`);
    }

    await updateMessageStatus(messageId, 'sent', {
      delivered_at: new Date().toISOString(),
      external_message_id: externalMessageId,
    });

    return res.status(200).json({ success: true, externalMessageId });
  } catch (relayError: any) {
    await updateMessageStatus(messageId, 'failed', {
      sender_meta: { relayError: relayError?.message },
    });
    return res.status(500).json({ error: relayError?.message || 'Relay failure' });
  }
}


