# Быстрая настройка домена без CloudFlare

## Быстрая инструкция

### 1. В Vercel Dashboard
- Settings → Domains → Add Domain
- Введите ваш домен
- Скопируйте DNS записи, которые покажет Vercel

### 2. У регистратора домена

**Для поддомена (crm.example.com):**
```
CNAME → crm → cname.vercel-dns.com
```

**Для корневого домена (example.com):**
```
A → @ → 76.76.21.21 (IP от Vercel)
или
ALIAS/ANAME → @ → cname.vercel-dns.com (если поддерживается)
```

**Для www (www.example.com):**
```
CNAME → www → cname.vercel-dns.com
```

### 3. Ожидание
- 5-30 минут для распространения DNS
- Vercel автоматически выдаст SSL сертификат

### 4. Переменные окружения в Vercel
```
VITE_PUBLIC_APP_URL=https://yourdomain.com
```

## Проверка

```bash
# Проверка DNS
dig yourdomain.com A
dig crm.yourdomain.com CNAME

# Проверка SSL
curl -I https://yourdomain.com
```

## Готово! ✅

Подробная инструкция: [domain-setup-direct.md](./domain-setup-direct.md)


