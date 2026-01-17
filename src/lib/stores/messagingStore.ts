import { create } from 'zustand';
import {
  ConnectIntegrationRequest,
  CreateConversationRequest,
  MessagingIntegration,
  MessengerConversation,
  MessengerMessage,
  MessagingChannel,
  SendMessengerMessageRequest,
} from '../../types';
import { toast } from '../toast';
import { messagingService } from '../supabase/services/MessagingService';

interface MessagingState {
  integrations: MessagingIntegration[];
  conversations: MessengerConversation[];
  messages: Record<string, MessengerMessage[]>;
  activeConversationId: string | null;
  loadingIntegrations: boolean;
  loadingConversations: boolean;
  loadingMessages: boolean;
  connectingChannel: MessagingChannel | null;
  filters: {
    search: string;
    channel: MessagingChannel | 'all';
  };
  fetchIntegrations: (organizationId: string) => Promise<void>;
  connectIntegration: (payload: ConnectIntegrationRequest) => Promise<MessagingIntegration>;
  fetchConversations: (params: { organizationId: string; search?: string; channel?: MessagingChannel | 'all' }) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  createConversation: (payload: CreateConversationRequest) => Promise<MessengerConversation>;
  sendMessage: (payload: SendMessengerMessageRequest) => Promise<MessengerMessage>;
  setActiveConversation: (conversationId: string | null) => void;
  setFilters: (filters: Partial<MessagingState['filters']>) => void;
  upsertMessage: (message: MessengerMessage) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  integrations: [],
  conversations: [],
  messages: {},
  activeConversationId: null,
  loadingIntegrations: false,
  loadingConversations: false,
  loadingMessages: false,
  connectingChannel: null,
  filters: {
    search: '',
    channel: 'all',
  },

  fetchIntegrations: async (organizationId: string) => {
    if (!organizationId) return;
    try {
      set({ loadingIntegrations: true });
      const data = await messagingService.listIntegrations(organizationId);
      set({ integrations: data, loadingIntegrations: false });
    } catch (error: any) {
      console.error('Failed to load messaging integrations', error);
      toast.error(error?.message || 'Не удалось загрузить интеграции');
      set({ loadingIntegrations: false });
    }
  },

  connectIntegration: async (payload: ConnectIntegrationRequest) => {
    try {
      set({ connectingChannel: payload.channel });
      const integration = await messagingService.upsertIntegration(payload);
      set((state) => ({
        integrations: [
          integration,
          ...state.integrations.filter(
            (item) => !(item.organizationId === integration.organizationId && item.channel === integration.channel),
          ),
        ],
        connectingChannel: null,
      }));
      toast.success(`Канал ${integration.displayName} подключен`);
      return integration;
    } catch (error: any) {
      set({ connectingChannel: null });
      toast.error(error?.message || 'Не удалось подключить канал');
      throw error;
    }
  },

  fetchConversations: async ({ organizationId, search, channel }) => {
    if (!organizationId) return;
    try {
      set({ loadingConversations: true });
      const data = await messagingService.listConversations({
        organizationId,
        search,
        channel: channel && channel !== 'all' ? channel : undefined,
      });
      set({ conversations: data, loadingConversations: false });
      if (!get().activeConversationId && data.length > 0) {
        set({ activeConversationId: data[0].id });
      }
    } catch (error: any) {
      console.error('Failed to fetch conversations', error);
      toast.error(error?.message || 'Ошибка загрузки диалогов');
      set({ loadingConversations: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    if (!conversationId) return;
    try {
      set({ loadingMessages: true });
      const data = await messagingService.listMessages(conversationId);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: data,
        },
        loadingMessages: false,
      }));
    } catch (error: any) {
      console.error('Failed to fetch messages', error);
      toast.error(error?.message || 'Не удалось загрузить сообщения');
      set({ loadingMessages: false });
    }
  },

  createConversation: async (payload: CreateConversationRequest) => {
    try {
      const conversation = await messagingService.createConversation(payload);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        activeConversationId: conversation.id,
      }));
      return conversation;
    } catch (error: any) {
      toast.error(error?.message || 'Не удалось создать диалог');
      throw error;
    }
  },

  sendMessage: async (payload: SendMessengerMessageRequest) => {
    try {
      const message = await messagingService.sendMessage(payload);
      set((state) => ({
        messages: {
          ...state.messages,
          [payload.conversationId]: [...(state.messages[payload.conversationId] ?? []), message],
        },
      }));
      return message;
    } catch (error: any) {
      toast.error(error?.message || 'Не удалось отправить сообщение');
      throw error;
    }
  },

  setActiveConversation: (conversationId: string | null) => {
    set({ activeConversationId: conversationId });
  },

  setFilters: (filters: Partial<MessagingState['filters']>) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  upsertMessage: (message: MessengerMessage) => {
    set((state) => {
      const messages = state.messages[message.conversationId] ?? [];
      const existingIndex = messages.findIndex((item) => item.id === message.id);
      const updatedMessages =
        existingIndex === -1
          ? [...messages, message]
          : messages.map((item) => (item.id === message.id ? message : item));

      return {
        messages: {
          ...state.messages,
          [message.conversationId]: updatedMessages,
        },
      };
    });
  },
}));


