import {
  ConnectIntegrationRequest,
  CreateConversationRequest,
  MessagingIntegration,
  MessengerConversation,
  MessengerMessage,
  SendMessengerMessageRequest,
} from '../../../types';
import { handleApiError } from '../../error/ErrorHandler';
import { supabase, TABLES } from '../config';

const mapIntegration = (record: any): MessagingIntegration => ({
  id: record.id,
  organizationId: record.organization_id,
  channel: record.channel,
  displayName: record.display_name,
  status: record.status,
  credentials: record.credentials ?? {},
  webhookUrl: record.webhook_url,
  webhookSecret: record.webhook_secret,
  lastError: record.last_error,
  meta: record.meta ?? {},
  createdBy: record.created_by,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

const mapConversation = (record: any): MessengerConversation => ({
  id: record.id,
  organizationId: record.organization_id,
  integrationId: record.integration_id,
  clientId: record.client_id,
  client: record.client || null,
  channel: record.channel,
  externalChatId: record.external_chat_id,
  channelAddress: record.channel_address,
  title: record.title,
  lastMessagePreview: record.last_message_preview,
  unreadCount: record.unread_count ?? 0,
  lastMessageAt: record.last_message_at,
  metadata: record.metadata ?? {},
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

const mapMessage = (record: any): MessengerMessage => ({
  id: record.id,
  organizationId: record.organization_id,
  conversationId: record.conversation_id,
  integrationId: record.integration_id,
  direction: record.direction,
  status: record.status,
  externalMessageId: record.external_message_id,
  senderName: record.sender_name,
  senderMeta: record.sender_meta ?? {},
  body: record.body,
  attachments: record.attachments ?? [],
  rawPayload: record.raw_payload ?? null,
  deliveredAt: record.delivered_at,
  readAt: record.read_at,
  sentAt: record.sent_at,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

class SupabaseMessagingService {
  async listIntegrations(organizationId: string): Promise<MessagingIntegration[]> {
    const { data, error } = await supabase
      .from(TABLES.MESSENGER_INTEGRATIONS)
      .select('*')
      .eq('organization_id', organizationId)
      .order('channel', { ascending: true });

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.listIntegrations');
    }

    return (data ?? []).map(mapIntegration);
  }

  async upsertIntegration(payload: ConnectIntegrationRequest): Promise<MessagingIntegration> {
    const { data, error } = await supabase
      .from(TABLES.MESSENGER_INTEGRATIONS)
      .upsert(
        {
          organization_id: payload.organizationId,
          channel: payload.channel,
          display_name: payload.displayName,
          credentials: payload.credentials,
          webhook_url: payload.webhookUrl,
          webhook_secret: payload.webhookSecret,
          status: 'connected',
        },
        { onConflict: 'organization_id,channel' },
      )
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.upsertIntegration');
    }

    return mapIntegration(data);
  }

  async disconnectIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.MESSENGER_INTEGRATIONS)
      .update({ status: 'disconnected' })
      .eq('id', id);

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.disconnectIntegration');
    }
  }

  async listConversations(params: {
    organizationId: string;
    search?: string;
    channel?: string;
    limit?: number;
  }): Promise<MessengerConversation[]> {
    const { organizationId, search, channel, limit = 50 } = params;

    let query = supabase
      .from(TABLES.MESSENGER_CONVERSATIONS)
      .select(
        `
        *,
        client:clients(*)
      `,
      )
      .eq('organization_id', organizationId)
      .order('last_message_at', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,channel_address.ilike.%${search}%,last_message_preview.ilike.%${search}%`,
      );
    }

    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data, error } = await query;

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.listConversations');
    }

    return (data ?? []).map(mapConversation);
  }

  async createConversation(payload: CreateConversationRequest): Promise<MessengerConversation> {
    const { data, error } = await supabase
      .from(TABLES.MESSENGER_CONVERSATIONS)
      .insert({
        organization_id: payload.organizationId,
        integration_id: payload.integrationId,
        client_id: payload.clientId ?? null,
        channel: payload.channel,
        external_chat_id: payload.externalChatId,
        channel_address: payload.channelAddress,
        title: payload.title,
        metadata: payload.metadata ?? {},
      })
      .select(
        `
        *,
        client:clients(*)
      `,
      )
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.createConversation');
    }

    return mapConversation(data);
  }

  async listMessages(conversationId: string, limit = 100): Promise<MessengerMessage[]> {
    const { data, error } = await supabase
      .from(TABLES.MESSENGER_MESSAGES)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.listMessages');
    }

    return (data ?? []).map(mapMessage);
  }

  async sendMessage(payload: SendMessengerMessageRequest): Promise<MessengerMessage> {
    const { data, error } = await supabase
      .from(TABLES.MESSENGER_MESSAGES)
      .insert({
        organization_id: payload.organizationId,
        conversation_id: payload.conversationId,
        integration_id: payload.integrationId,
        direction: 'outgoing',
        status: 'pending',
        body: payload.body,
        attachments: payload.attachments ?? [],
      })
      .select('*')
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseMessagingService.sendMessage');
    }

    await supabase
      .from(TABLES.MESSENGER_CONVERSATIONS)
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: payload.body.slice(0, 200),
        unread_count: 0,
      })
      .eq('id', payload.conversationId);

    // Fire-and-forget relay call to serverless proxy
    try {
      await fetch('/api/messaging/relay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: data.id,
        }),
      });
    } catch (relayError) {
      console.warn('Messaging relay error (non-blocking):', relayError);
    }

    return mapMessage(data);
  }
}

export const messagingService = new SupabaseMessagingService();

