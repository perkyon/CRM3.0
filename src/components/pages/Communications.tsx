import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  MessageCircle,
  MessageSquare,
  Phone,
  Plug,
  Send,
  ShieldCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  Bot,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useCurrentOrganization } from '../../lib/hooks/useCurrentOrganization';
import { useMessagingStore } from '../../lib/stores/messagingStore';
import { useClientStore } from '../../lib/stores/clientStore';
import { cn } from '../../lib/utils';
import { MessagingChannel } from '../../types';

const channelMeta: Record<
  MessagingChannel,
  { title: string; description: string; accent: string; icon: React.ReactNode; docs: string }
> = {
  telegram: {
    title: 'Telegram Bot',
    description: 'Используйте Telegram Bot API для мгновенных диалогов с клиентами.',
    accent: 'text-sky-500',
    icon: <MessageCircle className="size-5 text-sky-500" />,
    docs: 'https://core.telegram.org/bots/api',
  },
  whatsapp: {
    title: 'WhatsApp Cloud API',
    description: 'Официальная интеграция через Meta для бизнес-аккаунтов WhatsApp.',
    accent: 'text-emerald-500',
    icon: <Phone className="size-5 text-emerald-500" />,
    docs: 'https://developers.facebook.com/docs/whatsapp/',
  },
};

const useBaseWebhookUrl = () =>
  useMemo(() => {
    if (import.meta.env.VITE_PUBLIC_APP_URL) {
      return import.meta.env.VITE_PUBLIC_APP_URL.replace(/\/$/, '');
    }

    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return 'https://crm.your-domain.com';
  }, []);

export function Communications() {
  const baseWebhookUrl = useBaseWebhookUrl();
  const { currentOrganization, isLoading: orgLoading } = useCurrentOrganization();
  const {
    integrations,
    conversations,
    messages,
    loadingIntegrations,
    loadingConversations,
    loadingMessages,
    activeConversationId,
    connectingChannel,
    filters,
    fetchIntegrations,
    fetchConversations,
    fetchMessages,
    connectIntegration,
    createConversation,
    sendMessage,
    setActiveConversation,
    setFilters,
  } = useMessagingStore();
  const { clients, fetchClients } = useClientStore();

  const [channelDialog, setChannelDialog] = useState<MessagingChannel | null>(null);
  const [instructionsDialog, setInstructionsDialog] = useState<MessagingChannel | null>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const [telegramForm, setTelegramForm] = useState({
    displayName: 'Telegram',
    botToken: '',
    webhookSecret: '',
  });
  const [whatsappForm, setWhatsappForm] = useState({
    displayName: 'WhatsApp',
    accessToken: '',
    phoneNumberId: '',
    verifyToken: '',
    businessAccountId: '',
  });

  const [conversationForm, setConversationForm] = useState({
    integrationId: '',
    clientId: '',
    externalChatId: '',
    title: '',
    channelAddress: '',
  });

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const activeMessages = (activeConversationId && messages[activeConversationId]) || [];

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchIntegrations(currentOrganization.id);
      fetchConversations({ organizationId: currentOrganization.id });
      if (!clients.length) {
        fetchClients({ limit: 200 });
      }
    }
  }, [currentOrganization?.id, clients.length, fetchClients, fetchConversations, fetchIntegrations]);

  useEffect(() => {
    if (activeConversationId && !messages[activeConversationId]) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages, messages]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ search: searchValue });
      if (currentOrganization?.id) {
        fetchConversations({
          organizationId: currentOrganization.id,
          search: searchValue,
          channel: filters.channel,
        });
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchValue, filters.channel, currentOrganization?.id, fetchConversations, setFilters]);

  const integrationsByChannel = useMemo(
    () => integrations.reduce<Record<MessagingChannel, typeof integrations[number] | null>>((acc, item) => {
      acc[item.channel] = item;
      return acc;
    }, { telegram: null, whatsapp: null }),
    [integrations],
  );

  const handleConnectChannel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization?.id || !channelDialog) return;

    if (channelDialog === 'telegram') {
      const secret = telegramForm.webhookSecret || (typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString());
      await connectIntegration({
        organizationId: currentOrganization.id,
        channel: 'telegram',
        displayName: telegramForm.displayName || 'Telegram',
        credentials: {
          botToken: telegramForm.botToken.trim(),
        },
        webhookSecret: secret,
      });
      setTelegramForm((prev) => ({ ...prev, webhookSecret: secret }));
    }

    if (channelDialog === 'whatsapp') {
      await connectIntegration({
        organizationId: currentOrganization.id,
        channel: 'whatsapp',
        displayName: whatsappForm.displayName || 'WhatsApp',
        credentials: {
          accessToken: whatsappForm.accessToken.trim(),
          phoneNumberId: whatsappForm.phoneNumberId.trim(),
          businessAccountId: whatsappForm.businessAccountId.trim(),
        },
        webhookSecret: whatsappForm.verifyToken.trim(),
      });
    }

    setChannelDialog(null);
  };

  const handleSendMessage = async () => {
    if (!messageDraft.trim() || !activeConversation || !currentOrganization) return;

    await sendMessage({
      conversationId: activeConversation.id,
      integrationId: activeConversation.integrationId,
      organizationId: currentOrganization.id,
      body: messageDraft.trim(),
    });
    setMessageDraft('');
  };

  const handleCreateConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization?.id || !conversationForm.integrationId || !conversationForm.externalChatId) return;

    const integration = integrations.find((i) => i.id === conversationForm.integrationId);
    if (!integration) return;

    await createConversation({
      organizationId: currentOrganization.id,
      integrationId: integration.id,
      clientId: conversationForm.clientId || undefined,
      channel: integration.channel,
      externalChatId: conversationForm.externalChatId.trim(),
      channelAddress: conversationForm.channelAddress.trim() || conversationForm.externalChatId.trim(),
      title: conversationForm.title || undefined,
      metadata: {
        createdViaUI: true,
      },
    });
    setConversationForm({
      integrationId: '',
      clientId: '',
      externalChatId: '',
      title: '',
      channelAddress: '',
    });
    setNewConversationOpen(false);
  };

  const renderChannelDialog = () => {
    if (!channelDialog) return null;
    const isTelegram = channelDialog === 'telegram';

    return (
      <form className="space-y-4" onSubmit={handleConnectChannel}>
        <div className="space-y-1">
          <Label>Отображаемое имя</Label>
          <Input
            value={isTelegram ? telegramForm.displayName : whatsappForm.displayName}
            onChange={(e) =>
              isTelegram
                ? setTelegramForm((prev) => ({ ...prev, displayName: e.target.value }))
                : setWhatsappForm((prev) => ({ ...prev, displayName: e.target.value }))
            }
            placeholder={isTelegram ? 'Telegram' : 'WhatsApp'}
          />
        </div>

        {isTelegram ? (
          <>
            <div className="space-y-1">
              <Label>Bot Token</Label>
              <Input
                type="password"
                value={telegramForm.botToken}
                onChange={(e) => setTelegramForm((prev) => ({ ...prev, botToken: e.target.value }))}
                placeholder="1234567890:ABC..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Secret token для вебхука</Label>
              <Input
                value={telegramForm.webhookSecret}
                onChange={(e) => setTelegramForm((prev) => ({ ...prev, webhookSecret: e.target.value }))}
                placeholder="Секрет подписи Telegram"
              />
              <p className="text-xs text-muted-foreground">
                Telegram будет присылать заголовок <code>X-Telegram-Bot-Api-Secret-Token</code>. Значение должно совпадать.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <Label>Permanent access token</Label>
              <Input
                type="password"
                value={whatsappForm.accessToken}
                onChange={(e) => setWhatsappForm((prev) => ({ ...prev, accessToken: e.target.value }))}
                placeholder="EAAG..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number ID</Label>
              <Input
                value={whatsappForm.phoneNumberId}
                onChange={(e) => setWhatsappForm((prev) => ({ ...prev, phoneNumberId: e.target.value }))}
                placeholder="123456789012345"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Business Account ID (опционально)</Label>
              <Input
                value={whatsappForm.businessAccountId}
                onChange={(e) => setWhatsappForm((prev) => ({ ...prev, businessAccountId: e.target.value }))}
                placeholder="987654321"
              />
            </div>
            <div className="space-y-1">
              <Label>Verify token</Label>
              <Input
                value={whatsappForm.verifyToken}
                onChange={(e) => setWhatsappForm((prev) => ({ ...prev, verifyToken: e.target.value }))}
                placeholder="Любая строка — используйте её в вебхуке"
                required
              />
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            type="submit"
            disabled={
              connectingChannel === channelDialog ||
              (channelDialog === 'telegram' && !telegramForm.botToken) ||
              (channelDialog === 'whatsapp' && (!whatsappForm.accessToken || !whatsappForm.phoneNumberId || !whatsappForm.verifyToken))
            }
          >
            {connectingChannel === channelDialog && <Loader2 className="mr-2 size-4 animate-spin" />}
            Подключить
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const renderWebhookHint = (channel: MessagingChannel) => {
    const integration = integrationsByChannel[channel];
    if (!integration) {
      return `${baseWebhookUrl}/api/messaging/${channel}/webhook?integrationId={integrationId}`;
    }

    const secretSuffix = integration.webhookSecret ? `&secret=${integration.webhookSecret}` : '';
    return `${baseWebhookUrl}/api/messaging/${channel}/webhook?integrationId=${integration.id}${secretSuffix}`;
  };

  const renderInstructions = () => {
    if (!instructionsDialog) return null;
    const isTelegram = instructionsDialog === 'telegram';
    const integration = integrationsByChannel[instructionsDialog];
    const webhookUrl = renderWebhookHint(instructionsDialog);

    if (isTelegram) {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Шаг 1: Создай бота через @BotFather</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li>Открой Telegram и найди <code className="rounded bg-background px-1.5 py-0.5 text-xs">@BotFather</code></li>
                <li>Отправь команду <code className="rounded bg-background px-1.5 py-0.5 text-xs">/newbot</code></li>
                <li>Придумай имя для бота (например: "Мебельная мастерская")</li>
                <li>Придумай username для бота (должен заканчиваться на <code className="rounded bg-background px-1.5 py-0.5 text-xs">bot</code>, например: <code className="rounded bg-background px-1.5 py-0.5 text-xs">mebel_master_bot</code>)</li>
                <li>BotFather пришлет тебе <strong>Bot Token</strong> — сохрани его!</li>
              </ol>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Шаг 2: Подключи бота в CRM</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li>Нажми кнопку <strong>"Подключить"</strong> в разделе Telegram Bot</li>
                <li>Вставь <strong>Bot Token</strong>, который получил от BotFather</li>
                <li>Опционально: укажи Secret token для безопасности (или оставь пустым — сгенерируется автоматически)</li>
                <li>Нажми <strong>"Подключить"</strong></li>
              </ol>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Шаг 3: Настрой Webhook</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                После подключения бота в CRM, нужно настроить webhook, чтобы бот получал сообщения от клиентов.
              </p>
              {integration ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Скопируй этот URL:</Label>
                    <div className="mt-1 rounded-md border bg-background p-2">
                      <code className="break-all text-xs">{webhookUrl}</code>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Выполни эту команду в терминале или браузере:</Label>
                    <div className="mt-1 rounded-md border bg-background p-2">
                      <code className="break-all text-xs">
                        {`https://api.telegram.org/bot${integration.credentials?.botToken || '[ТВОЙ_ТОКЕН]'}/setWebhook?url=${encodeURIComponent(webhookUrl)}`}
                      </code>
                    </div>
                  </div>
                  {integration.webhookSecret && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      <AlertCircle className="mb-1 inline size-3" /> Если указан Secret token, добавь заголовок:
                      <code className="ml-1 rounded bg-amber-100 px-1 dark:bg-amber-900">
                        X-Telegram-Bot-Api-Secret-Token: {integration.webhookSecret}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <AlertCircle className="mb-1 inline size-4" /> Сначала подключи бота в CRM (Шаг 2), затем вернись сюда для настройки webhook.
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Шаг 4: Проверь подключение</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li>Найди своего бота в Telegram (по username, который указал в BotFather)</li>
                <li>Нажми <strong>"Start"</strong> или отправь команду <code className="rounded bg-background px-1.5 py-0.5 text-xs">/start</code></li>
                <li>Напиши боту любое сообщение</li>
                <li>Проверь в CRM — сообщение должно появиться в разделе "Диалоги"</li>
              </ol>
            </div>

            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
              <h3 className="mb-2 font-semibold text-green-800 dark:text-green-200">✅ Готово!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Теперь ты можешь общаться с клиентами через бота прямо из CRM. Все сообщения будут отправляться от имени бота.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // WhatsApp инструкция (пока заглушка)
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Инструкция по подключению WhatsApp будет добавлена позже.
          </p>
        </div>
      </div>
    );
  };

  if (orgLoading && !currentOrganization) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Коммуникации</h1>
              <p className="text-sm text-muted-foreground">
                Общайтесь с клиентами через Telegram и WhatsApp ботов. Отвечайте от имени бота прямо из CRM.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setChannelDialog('telegram')}>
            <Plug className="mr-2 size-4" />
            Добавить канал
          </Button>
          <Button onClick={() => setNewConversationOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            Новый диалог
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_360px_1fr]">
        {/* Channels */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Каналы</h2>
              <p className="text-xs text-muted-foreground">Управляйте подключенными мессенджерами</p>
            </div>
            {loadingIntegrations && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="space-y-4">
            {(Object.keys(channelMeta) as MessagingChannel[]).map((channel) => {
              const integration = integrationsByChannel[channel];
              const meta = channelMeta[channel];
              const state = integration?.status || 'disconnected';
              return (
                <div key={channel} className="rounded-xl border border-dashed p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {meta.icon}
                        {meta.title}
                      </div>
                      <p className="text-sm text-muted-foreground">{meta.description}</p>
                    </div>
                    <Badge variant={state === 'connected' ? 'default' : 'outline'}>
                      {state === 'connected' ? 'Подключено' : 'Неактивно'}
                    </Badge>
                  </div>
                  {integration ? (
                    <div className="mt-4 space-y-2 rounded-lg bg-muted/40 p-3 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="size-3.5" />
                        <span>Webhook URL</span>
                      </div>
                      <code className="line-clamp-2 break-all text-[11px]">{renderWebhookHint(channel)}</code>
                      {!integration.webhookSecret && (
                        <p className="text-[11px] text-muted-foreground">
                          Добавьте secret, чтобы защититься от спама, и переустановите webhook.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Канал не подключен. Нажмите, чтобы настроить интеграцию и начать переписку.
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setChannelDialog(channel)}>
                      <Plug className="mr-2 size-4" />
                      {integration ? 'Перенастроить' : 'Подключить'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setInstructionsDialog(channel)}
                      className="text-xs"
                    >
                      Инструкция
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversations */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Диалоги</h2>
                <p className="text-xs text-muted-foreground">Все переписки с клиентами</p>
              </div>
              {loadingConversations && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>
            <Input
              placeholder="Поиск по имени, каналу или тексту"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full"
            />
            <div className="flex gap-2 text-xs">
              <Button
                size="sm"
                variant={filters.channel === 'all' ? 'secondary' : 'ghost'}
                onClick={() => setFilters({ channel: 'all' })}
              >
                Все
              </Button>
              <Button
                size="sm"
                variant={filters.channel === 'telegram' ? 'secondary' : 'ghost'}
                onClick={() => setFilters({ channel: 'telegram' })}
              >
                Telegram
              </Button>
              <Button
                size="sm"
                variant={filters.channel === 'whatsapp' ? 'secondary' : 'ghost'}
                onClick={() => setFilters({ channel: 'whatsapp' })}
              >
                WhatsApp
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[520px] pr-2">
            {conversations.length === 0 && !loadingConversations ? (
              <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Пока нет переписок. Создайте диалог или дождитесь входящего сообщения.
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setActiveConversation(conversation.id)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left transition hover:bg-muted/50',
                        isActive ? 'border-primary bg-primary/5' : 'border-border/60',
                      )}
                    >
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{conversation.title || conversation.channelAddress || 'Без названия'}</span>
                        <Badge variant="outline" className="capitalize">
                          {conversation.channel}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {conversation.lastMessagePreview || 'Сообщений пока нет'}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{conversation.client?.name || 'Контакт не привязан'}</span>
                        {conversation.lastMessageAt && format(new Date(conversation.lastMessageAt), 'dd.MM HH:mm')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Thread */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          {activeConversation ? (
            <div className="flex h-full flex-col">
              <div className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {activeConversation.title || activeConversation.channelAddress || 'Диалог'}
                      </h2>
                      {integrations.find((i) => i.id === activeConversation.integrationId)?.type !== 'user_account' && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Bot className="size-3" />
                          От имени бота
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation.client?.name || 'Клиент не выбран'} · {activeConversation.channel}
                    </p>
                  </div>
                  <Badge variant="secondary">{activeConversation.client?.status || 'lead'}</Badge>
                </div>
              </div>
              <ScrollArea className="flex-1 py-4 pr-4">
                {loadingMessages && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-4">
                  {activeMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex flex-col gap-1 text-sm',
                        message.direction === 'outgoing' ? 'items-end' : 'items-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-2 shadow-sm',
                          message.direction === 'outgoing'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground',
                        )}
                      >
                        {message.body}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(message.sentAt), 'dd.MM HH:mm')} · {message.status}
                      </span>
                    </div>
                  ))}
                  {!loadingMessages && activeMessages.length === 0 && (
                    <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                      Напишите первое сообщение
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Textarea
                    rows={3}
                    placeholder={
                      integrations.find((i) => i.id === activeConversation.integrationId)?.type !== 'user_account'
                        ? 'Введите сообщение (отправится от имени бота)…'
                        : 'Введите сообщение…'
                    }
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  {integrations.find((i) => i.id === activeConversation.integrationId)?.type !== 'user_account' && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-[10px] text-primary">
                      <Bot className="size-3" />
                      От бота
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {integrations.find((i) => i.id === activeConversation.integrationId)?.type !== 'user_account'
                      ? 'Сообщение будет отправлено от имени бота · ⌘ + Enter для отправки'
                      : 'Для быстрого отправления используйте ⌘ + Enter'}
                  </span>
                  <Button onClick={handleSendMessage} disabled={!messageDraft.trim()}>
                    <Send className="mr-2 size-4" />
                    Отправить
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <MessageCircle className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Выберите диалог</p>
                <p className="text-sm">или создайте новый, чтобы начать общение с клиентом</p>
              </div>
              <Button variant="outline" onClick={() => setNewConversationOpen(true)}>
                <UserPlus className="mr-2 size-4" />
                Новый диалог
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={Boolean(channelDialog)} onOpenChange={(open) => !open && setChannelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {channelDialog ? channelMeta[channelDialog].title : 'Канал'} · подключение
            </DialogTitle>
            <DialogDescription>
              Укажите технические данные API и мы сохраним их в Supabase. Данные шифруются политиками RLS.
            </DialogDescription>
          </DialogHeader>
          {renderChannelDialog()}
        </DialogContent>
      </Dialog>

      <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая переписка</DialogTitle>
            <DialogDescription>
              Выберите канал и прикрепите клиента. Чтобы отправлять сообщения в Telegram, пользователь должен написать боту и передать chat_id.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateConversation}>
            <div className="space-y-1">
              <Label>Канал</Label>
              <Select
                value={conversationForm.integrationId}
                onValueChange={(value) => setConversationForm((prev) => ({ ...prev, integrationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подключенный канал" />
                </SelectTrigger>
                <SelectContent>
                  {integrations
                    .filter((integration) => integration.status === 'connected')
                    .map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.displayName} · {integration.channel}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Клиент (опционально)</Label>
              <Select
                value={conversationForm.clientId}
                onValueChange={(value) => setConversationForm((prev) => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Привяжите существующего клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>ID чата / номер</Label>
              <Input
                value={conversationForm.externalChatId}
                onChange={(event) => setConversationForm((prev) => ({ ...prev, externalChatId: event.target.value }))}
                placeholder="Telegram chat_id или номер WhatsApp в формате +79999999999"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Подпись для списка</Label>
              <Input
                value={conversationForm.title}
                onChange={(event) => setConversationForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Например, Дмитрий — кухня"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!conversationForm.integrationId || !conversationForm.externalChatId}>
                Создать диалог
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(instructionsDialog)} onOpenChange={(open) => !open && setInstructionsDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {instructionsDialog ? `Инструкция: ${channelMeta[instructionsDialog].title}` : 'Инструкция'}
            </DialogTitle>
            <DialogDescription>
              Пошаговое руководство по подключению {instructionsDialog === 'telegram' ? 'Telegram бота' : 'WhatsApp'}
            </DialogDescription>
          </DialogHeader>
          {renderInstructions()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstructionsDialog(null)}>
              Закрыть
            </Button>
            {instructionsDialog === 'telegram' && !integrationsByChannel.telegram && (
              <Button onClick={() => {
                setInstructionsDialog(null);
                setChannelDialog('telegram');
              }}>
                Подключить бота
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
        <AlertCircle className="size-4" />
        Telegram: после подключения выполните
        <code className="rounded bg-muted px-2 py-1 text-[11px]">
          https://api.telegram.org/bot[ТОКЕН]/setWebhook?url={renderWebhookHint('telegram')}
        </code>
        и убедитесь, что бот получил первое сообщение. Для WhatsApp используйте verify token при настройке webhook в Meta.
      </div>
    </div>
  );
}

