# ⚡ Быстрая настройка Vercel

## Project ID
```
prj_oSi34qpXBLZkknWvaKEhqiFHwleC
```

## 🔧 Переменные окружения (Settings → Environment Variables)

Добавьте для **Production**, **Preview** и **Development**:

```env
VITE_SUPABASE_URL=https://ykdtitukhsvsvnbnskit.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHRpdHVraHN2c3ZuYm5za2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg3MjAsImV4cCI6MjA3NzI1NDcyMH0.tjCfpEG30rxaCuu22EmV3kKGxH45FDMTJNuPknpsl7w
```

## ⚙️ Настройки сборки (Settings → General)

- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🌐 Подключение домена (Settings → Domains)

1. Нажмите **"Add Domain"**
2. Введите: `burodigital.ru`
3. Скопируйте DNS записи, которые покажет Vercel
4. Добавьте их в reg.ru (см. DOMAIN_SETUP_GUIDE.md)

## 🔄 После добавления переменных

1. **Deployments** → выберите последний deployment
2. **"Redeploy"** → **"Redeploy"**

## 📋 Проверка

- [ ] Переменные окружения добавлены
- [ ] Настройки сборки проверены
- [ ] Деплой успешно завершен
- [ ] Домен добавлен в Vercel
- [ ] DNS записи добавлены в reg.ru
- [ ] Домен работает (https://burodigital.ru)

