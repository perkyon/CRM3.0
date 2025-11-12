# Устранение проблем с автоматическим деплоем на Vercel

## Проблема
Коммиты не автоматически деплоятся на Vercel, даже после переподключения репозитория.

## Возможные причины и решения

### 1. Проверьте настройки Auto-deploy

В Vercel Dashboard → проект `crm-3-0` → **Settings** → **Git**:

- Убедитесь, что **Production Branch** = `main`
- Проверьте, что **Auto-deploy** включен (должна быть галочка)
- Если есть опция "Ignore Build Step", убедитесь, что она отключена

### 2. Проверьте настройки Build

В Vercel Dashboard → проект `crm-3-0` → **Settings** → **General**:

- **Build Command**: должно быть `npm run vercel-build` или `npm run build`
- **Output Directory**: должно быть `dist`
- **Install Command**: должно быть `npm install` или пусто (по умолчанию)

### 3. Проверьте GitHub App Permissions

1. Зайдите в GitHub → **Settings** → **Applications** → **Installed GitHub Apps**
2. Найдите "Vercel" или "Vercel for GitHub"
3. Убедитесь, что у приложения есть права:
   - ✅ Repository access (должен быть доступ к `perkyon/CRM3.0`)
   - ✅ Repository permissions: Contents (Read and write)
   - ✅ Repository permissions: Metadata (Read-only)
   - ✅ Repository permissions: Pull requests (Read and write)
   - ✅ Repository permissions: Webhooks (Read and write)

### 4. Проверьте, что коммиты действительно в main

```bash
# Проверьте текущую ветку
git branch

# Убедитесь, что все коммиты запушены
git log origin/main..HEAD

# Если есть неотправленные коммиты, отправьте их
git push origin main
```

### 5. Проверьте настройки Production Branch

В Vercel Dashboard → проект `crm-3-0` → **Settings** → **Git**:

- **Production Branch** должен быть точно `main` (не `master`, не `Main`)
- Если указана другая ветка, измените на `main`

### 6. Проверьте Deployment Protection

В Vercel Dashboard → проект `crm-3-0` → **Settings** → **Deployment Protection**:

- Убедитесь, что нет правил, блокирующих деплой
- Если есть "Deployment Protection Rules", проверьте, что они не блокируют деплой из `main`

### 7. Проверьте логи и ошибки

В Vercel Dashboard → проект `crm-3-0` → **Deployments**:

- Посмотрите на последние деплои
- Если есть деплои со статусом "Error" или "Canceled", откройте их и проверьте логи
- Возможно, есть ошибка сборки, которая блокирует деплой

### 8. Проверьте Environment Variables

В Vercel Dashboard → проект `crm-3-0` → **Settings** → **Environment Variables**:

- Убедитесь, что все необходимые переменные окружения установлены
- Проверьте, что они установлены для Production environment

### 9. Попробуйте ручной деплой

Если автоматический деплой не работает, попробуйте ручной:

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Деплой в production
vercel --prod
```

Если ручной деплой работает, значит проблема именно в автоматическом деплое.

### 10. Проверьте GitHub Webhook вручную

1. Зайдите в GitHub → `perkyon/CRM3.0` → **Settings** → **Webhooks**
2. Если webhook есть, нажмите на него
3. Проверьте:
   - **Payload URL** - должен быть URL от Vercel
   - **Recent Deliveries** - посмотрите последние запросы
   - Если есть ошибки (красные статусы), это может быть причиной

### 11. Пересоздайте проект в Vercel (крайний случай)

Если ничего не помогает:

1. В Vercel Dashboard создайте новый проект
2. Подключите тот же репозиторий `perkyon/CRM3.0`
3. Установите те же настройки (Build Command, Output Directory)
4. Установите те же Environment Variables
5. Удалите старый проект

## Что проверить прямо сейчас

1. ✅ Коммиты запушены в `main`? (`git log origin/main..HEAD` должен быть пуст)
2. ✅ Production Branch = `main` в Vercel?
3. ✅ Auto-deploy включен в Vercel?
4. ✅ Есть ли webhook в GitHub?
5. ✅ Есть ли ошибки в последних деплоях в Vercel?

## Диагностика

Выполните эти команды и проверьте результат:

```bash
# Проверьте текущую ветку
git branch

# Проверьте последние коммиты
git log --oneline -5

# Проверьте, что все запушено
git status

# Проверьте remote
git remote -v
```

