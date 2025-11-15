# Исправление проблемы с www.burodigital.ru

## Проблема
Домен `www.burodigital.ru` не работает, хотя `crm-buro.vercel.app` работает.

## Решение

### Шаг 1: Проверь домены в Vercel

1. Зайди в **Vercel Dashboard** → проект `crm-buro` → **Settings** → **Domains**
2. Проверь, какие домены добавлены:
   - Должен быть `burodigital.ru`
   - Должен быть `www.burodigital.ru`

### Шаг 2: Добавь www домен (если его нет)

1. Если `www.burodigital.ru` не добавлен:
   - Нажми **"Add Domain"**
   - Введи: `www.burodigital.ru`
   - Нажми **"Add"**

### Шаг 3: Проверь DNS записи в reg.ru

В reg.ru должны быть **ОБЕ** записи:

**Для корневого домена:**
```
Type: A (или CNAME, как указано в Vercel)
Name: @
Value: [значение из Vercel]
TTL: 3600
```

**Для www поддомена:**
```
Type: CNAME
Name: www
Value: [значение из Vercel - обычно cname.vercel-dns.com или что-то вроде 6efec8aa135f798e.vercel-dns-017.com]
TTL: 3600
```

**ВАЖНО:** Используй **точные значения**, которые Vercel показывает в Dashboard → Domains!

### Шаг 4: Проверь статус доменов в Vercel

В Vercel Dashboard → **Domains** проверь статус:
- `burodigital.ru` должен быть **"Valid"** (зеленый)
- `www.burodigital.ru` должен быть **"Valid"** (зеленый)

Если статус **"Invalid Configuration"** или **"Pending"**:
- Проверь DNS записи в reg.ru
- Подожди 5-10 минут для распространения DNS
- Обнови страницу в Vercel Dashboard

### Шаг 5: Проверь DNS распространение

Используй онлайн инструменты для проверки:
- https://dnschecker.org
- Введи `www.burodigital.ru`
- Проверь, что CNAME запись указывает на Vercel

### Шаг 6: Если ничего не помогает

1. **Удали домен из Vercel:**
   - Vercel Dashboard → Domains → нажми на домен → **"Remove"**

2. **Добавь заново:**
   - Добавь `burodigital.ru`
   - Добавь `www.burodigital.ru`
   - Скопируй **новые** DNS записи
   - Обнови DNS записи в reg.ru

3. **Подожди 10-15 минут** для распространения DNS

## Частые проблемы

### Проблема: "Invalid Configuration"
- Проверь, что DNS записи **точно совпадают** с теми, что в Vercel
- Убедись, что используешь правильный тип записи (A или CNAME)

### Проблема: "Failed To Generate Cert"
- Подожди, пока DNS записи распространятся (5-10 минут)
- Проверь, что домен имеет статус "Valid"
- SSL сертификат выдается автоматически после проверки DNS

### Проблема: Домен не резолвится
- Проверь DNS записи через https://dnschecker.org
- Убедись, что записи добавлены правильно в reg.ru
- Подожди до 24 часов (обычно 5-10 минут)

