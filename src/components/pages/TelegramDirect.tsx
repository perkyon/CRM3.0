import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface TelegramMessage {
  id: string;
  text: string;
  from: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  date: number;
  isOutgoing: boolean;
}

interface TelegramChat {
  id: number;
  title?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  unreadCount: number;
  lastMessage?: TelegramMessage;
}

export function TelegramDirect() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [authStep, setAuthStep] = useState<'phone' | 'code' | 'password' | 'connected'>('phone');
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<TelegramChat | null>(null);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Для работы с Telegram User API нужен MTProto клиент
  // В браузере это сложно, поэтому используем упрощенный подход
  // В реальности нужен отдельный сервис или использование Telegram Web

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      // В реальности здесь будет вызов API для отправки кода
      // const response = await fetch('/api/telegram-user/auth', {
      //   method: 'POST',
      //   body: JSON.stringify({ phone }),
      // });

      // Для демо просто переходим к следующему шагу
      setTimeout(() => {
        setAuthStep('code');
        setIsConnecting(false);
      }, 1000);
    } catch (error) {
      console.error('Auth error:', error);
      setIsConnecting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      // В реальности здесь будет проверка кода
      // const response = await fetch('/api/telegram-user/auth', {
      //   method: 'POST',
      //   body: JSON.stringify({ phone, code }),
      // });

      // Для демо проверяем, нужен ли пароль 2FA
      setTimeout(() => {
        // Если нужен пароль 2FA
        if (Math.random() > 0.5) {
          setAuthStep('password');
        } else {
          setAuthStep('connected');
          setIsAuthorized(true);
          loadChats();
        }
        setIsConnecting(false);
      }, 1000);
    } catch (error) {
      console.error('Code verification error:', error);
      setIsConnecting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      // В реальности здесь будет проверка пароля 2FA
      setTimeout(() => {
        setAuthStep('connected');
        setIsAuthorized(true);
        loadChats();
        setIsConnecting(false);
      }, 1000);
    } catch (error) {
      console.error('Password error:', error);
      setIsConnecting(false);
    }
  };

  const loadChats = async () => {
    setIsLoading(true);
    try {
      // В реальности здесь будет загрузка чатов через MTProto
      // const response = await fetch('/api/telegram-user/chats');
      // const data = await response.json();

      // Демо данные
      setTimeout(() => {
        setChats([
          {
            id: 1,
            firstName: 'Иван',
            lastName: 'Петров',
            type: 'private',
            unreadCount: 2,
            lastMessage: {
              id: '1',
              text: 'Привет, как дела?',
              from: { id: 1, firstName: 'Иван' },
              date: Date.now() - 3600000,
              isOutgoing: false,
            },
          },
          {
            id: 2,
            title: 'Рабочая группа',
            type: 'group',
            unreadCount: 5,
            lastMessage: {
              id: '2',
              text: 'Нужно обсудить проект',
              from: { id: 2, firstName: 'Мария' },
              date: Date.now() - 7200000,
              isOutgoing: false,
            },
          },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Load chats error:', error);
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: number) => {
    setIsLoading(true);
    try {
      // В реальности здесь будет загрузка сообщений через MTProto
      // const response = await fetch(`/api/telegram-user/messages?chatId=${chatId}`);
      // const data = await response.json();

      // Демо данные
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            text: 'Привет! Как дела с проектом?',
            from: { id: 1, firstName: 'Иван' },
            date: Date.now() - 7200000,
            isOutgoing: false,
          },
          {
            id: '2',
            text: 'Всё отлично, работаем над дизайном',
            from: { id: 0 },
            date: Date.now() - 3600000,
            isOutgoing: true,
          },
          {
            id: '3',
            text: 'Отлично! Когда будет готово?',
            from: { id: 1, firstName: 'Иван' },
            date: Date.now() - 1800000,
            isOutgoing: false,
          },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Load messages error:', error);
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage: TelegramMessage = {
      id: Date.now().toString(),
      text: messageText,
      from: { id: 0 },
      date: Date.now(),
      isOutgoing: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText('');

    try {
      // В реальности здесь будет отправка через MTProto
      // await fetch('/api/telegram-user/send', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     chatId: selectedChat.id,
      //     text: messageText,
      //   }),
      // });
    } catch (error) {
      console.error('Send message error:', error);
      // Удаляем сообщение при ошибке
      setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
    }
  };

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">Подключение Telegram</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Войдите в свой личный аккаунт Telegram
            </p>
          </div>

          {authStep === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Номер телефона</Label>
                <Input
                  type="tel"
                  placeholder="+7 999 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  На этот номер придет код подтверждения
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Отправка кода...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 size-4" />
                    Получить код
                  </>
                )}
              </Button>
            </form>
          )}

          {authStep === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Код из Telegram</Label>
                <Input
                  type="text"
                  placeholder="12345"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Введите код, который пришел в Telegram
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAuthStep('phone')}
                >
                  Назад
                </Button>
                <Button type="submit" className="flex-1" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    'Подтвердить'
                  )}
                </Button>
              </div>
            </form>
          )}

          {authStep === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Пароль двухфакторной аутентификации</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Если у вас включена 2FA, введите пароль
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAuthStep('code')}
                >
                  Назад
                </Button>
                <Button type="submit" className="flex-1" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    'Войти'
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <AlertCircle className="mb-1 inline size-4" /> Для работы с личным аккаунтом нужен
            MTProto клиент. Это демо-версия интерфейса.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Telegram (личный аккаунт)</h1>
            <p className="text-sm text-muted-foreground">Прямое подключение без БД</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <CheckCircle2 className="size-3" />
            Подключено
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Список чатов */}
        <div className="w-80 border-r bg-muted/30">
          <div className="border-b p-4">
            <Input placeholder="Поиск чатов..." />
          </div>
          <ScrollArea className="h-[calc(100vh-140px)]">
            {isLoading && chats.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="p-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      'w-full rounded-lg p-3 text-left transition-colors hover:bg-muted',
                      selectedChat?.id === chat.id && 'bg-muted',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 truncate">
                        <div className="font-medium">
                          {chat.title ||
                            [chat.firstName, chat.lastName].filter(Boolean).join(' ') ||
                            chat.username ||
                            `Chat ${chat.id}`}
                        </div>
                        {chat.lastMessage && (
                          <div className="truncate text-sm text-muted-foreground">
                            {chat.lastMessage.text}
                          </div>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Окно сообщений */}
        <div className="flex flex-1 flex-col">
          {selectedChat ? (
            <>
              <div className="border-b bg-card p-4">
                <div className="font-semibold">
                  {selectedChat.title ||
                    [selectedChat.firstName, selectedChat.lastName].filter(Boolean).join(' ') ||
                    selectedChat.username ||
                    `Chat ${selectedChat.id}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedChat.type === 'private' ? 'Личный чат' : 'Группа'}
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex flex-col gap-1',
                          message.isOutgoing ? 'items-end' : 'items-start',
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            message.isOutgoing
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground',
                          )}
                        >
                          {message.text}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.date), 'HH:mm')}
                        </span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t bg-card p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Введите сообщение..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!messageText.trim()}>
                    <Send className="size-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ⌘ + Enter для отправки
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto mb-4 size-12" />
                <p className="font-medium text-foreground">Выберите чат</p>
                <p className="text-sm">или начните новый диалог</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


