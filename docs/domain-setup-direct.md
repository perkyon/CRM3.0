# Настройка домена без CloudFlare

Инструкция по подключению кастомного домена к Vercel напрямую, минуя CloudFlare.

## Шаг 1: Добавление домена в Vercel

1. Откройте проект в [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Settings** → **Domains**
3. Нажмите **Add Domain**
4. Введите ваш домен (например: `crm.yourdomain.com` или `yourdomain.com`)
5. Vercel покажет необходимые DNS записи

## Шаг 2: Настройка DNS у регистратора домена

### Вариант A: Поддомен (например, crm.yourdomain.com)

Добавьте **CNAME запись** у вашего регистратора:

```
Type: CNAME
Name: crm (или @ для корневого домена)
Value: cname.vercel-dns.com
TTL: 3600 (или Auto)
```

### Вариант B: Корневой домен (yourdomain.com)

Vercel предоставит IP адреса. Добавьте **A записи**:

```
Type: A
Name: @
Value: 76.76.21.21 (IP от Vercel)
TTL: 3600
```

Или используйте **ALIAS/ANAME** запись (если поддерживается):

```
Type: ALIAS/ANAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### Вариант C: WWW поддомен

Для `www.yourdomain.com` добавьте CNAME:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

## Шаг 3: Проверка DNS записей

После добавления записей проверьте их распространение:

```bash
# Для поддомена
dig crm.yourdomain.com CNAME

# Для корневого домена
dig yourdomain.com A
```

Или используйте онлайн инструменты:
- [DNS Checker](https://dnschecker.org/)
- [MXToolbox](https://mxtoolbox.com/DNSLookup.aspx)

## Шаг 4: Ожидание распространения DNS

- Обычно занимает **5-30 минут**
- Может занять до **48 часов** (редко)
- Проверяйте статус в Vercel Dashboard

## Шаг 5: SSL сертификат

Vercel автоматически выдаст SSL сертификат через Let's Encrypt после успешной проверки DNS.

## Примеры для популярных регистраторов

### Namecheap

1. **Advanced DNS** → **Add New Record**
2. Выберите тип записи (CNAME или A)
3. Введите значения из Vercel
4. Сохраните

### GoDaddy

1. **DNS Management** → **Add**
2. Выберите тип записи
3. Введите значения
4. Сохраните

### Google Domains / Cloud Identity

1. **DNS** → **Custom records**
2. Добавьте запись
3. Сохраните

### REG.RU / Timeweb / другие российские регистраторы

1. **Управление DNS** → **Добавить запись**
2. Выберите тип (CNAME или A)
3. Введите значения от Vercel
4. Сохраните

## Проверка настройки

После успешной настройки:

1. Домен должен отображаться как **Valid** в Vercel Dashboard
2. SSL сертификат должен быть **Active**
3. Сайт должен открываться по вашему домену

## Troubleshooting

### Домен не резолвится

- Проверьте правильность DNS записей
- Убедитесь, что TTL не слишком большой
- Подождите распространения DNS (может занять время)

### SSL не выдается

- Убедитесь, что DNS записи корректны
- Проверьте, что домен указывает на Vercel
- Подождите 5-10 минут после настройки DNS

### Редирект не работает

- Проверьте настройки в Vercel Dashboard → Domains
- Убедитесь, что `vercel.json` настроен правильно

## Обновление переменных окружения

После настройки домена обновите переменные окружения в Vercel:

```
VITE_PUBLIC_APP_URL=https://yourdomain.com
```

Или для поддомена:

```
VITE_PUBLIC_APP_URL=https://crm.yourdomain.com
```

## Примечания

- Vercel автоматически обрабатывает редиректы с www на без www (или наоборот)
- Можно настроить несколько доменов для одного проекта
- Vercel предоставляет бесплатный SSL для всех доменов


