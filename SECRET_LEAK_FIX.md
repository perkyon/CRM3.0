# 🔒 Инструкция по устранению утечки секрета Supabase

## ⚠️ Критическая ситуация

GitHub обнаружил утечку **Service Role Key** Supabase в публичном репозитории. Это критическая уязвимость безопасности!

## 🚨 Немедленные действия (сделай СЕЙЧАС)

### 1. Отзови старый ключ в Supabase (КРИТИЧНО!)

1. Открой https://supabase.com/dashboard
2. Выбери проект `ykdtitukhsvsvnbnskit`
3. Перейди в **Settings** → **API**
4. Найди раздел **Service Role Key** (service_role)
5. Нажми **"Regenerate"** или **"Revoke"**
6. **Скопируй новый ключ** (он больше не будет показан!)

### 2. Обнови переменные окружения

#### В Vercel:
1. Открой https://vercel.com/dashboard
2. Выбери проект `crm-3-0`
3. Перейди в **Settings** → **Environment Variables**
4. Найди `VITE_SUPABASE_SERVICE_ROLE_KEY`
5. **Замени** значение на новый ключ
6. **ВАЖНО:** После обновления запусти **новый build**:
   - Перейди в **Deployments**
   - Нажми **"Redeploy"** → **"Redeploy"** (выбери последний deployment)

#### Локально:
1. Открой `.env.local` (или другой файл с переменными)
2. Замени значение `VITE_SUPABASE_SERVICE_ROLE_KEY` на новый ключ

### 3. Проверь журналы безопасности в Supabase

1. В Supabase Dashboard перейди в **Logs** → **API Logs**
2. Проверь последние 25 дней на предмет:
   - Необычных запросов
   - Большого количества операций
   - Запросов с незнакомых IP адресов

### 4. Удали ключ из Git истории

#### Простой способ (быстрый, но не полный):
```bash
# Удали файл если он существует
git rm SUPABASE_SETUP.md  # или любой другой файл с ключом
git commit -m "Remove secret from repository"
git push
```

⚠️ **Проблема:** Ключ останется в истории Git. Любой, кто клонирует репозиторий, сможет его увидеть.

#### Полный способ (рекомендуется):

**Вариант A: Используй BFG Repo-Cleaner (проще)**

1. Установи BFG:
   ```bash
   brew install bfg  # macOS
   # или скачай с https://rtyley.github.io/bfg-repo-cleaner/
   ```

2. Создай файл с ключом для удаления:
   ```bash
   echo "старый_service_role_key" > keys-to-remove.txt
   ```

3. Очисти историю:
   ```bash
   bfg --replace-text keys-to-remove.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. Принудительно обнови репозиторий:
   ```bash
   git push --force --all
   ```

**Вариант B: Используй git filter-repo**

```bash
pip install git-filter-repo

# Замени старый_ключ на реальный старый ключ
git filter-repo --replace-text <(echo 'старый_ключ==>***REMOVED***') --force
git push --force --all
```

⚠️ **ВАЖНО:** `--force` перезапишет историю. Если другие люди работают с репозиторием, предупреди их!

### 5. Предотврати будущие утечки

1. **Проверь `.gitignore`:**
   ```bash
   # Убедись, что эти файлы в .gitignore:
   .env
   .env.local
   .env.*.local
   *.key
   *secret*
   *SECRET*
   ```

2. **Используй GitHub Secrets для CI/CD:**
   - В настройках репозитория → **Secrets and variables** → **Actions**
   - Добавь секреты туда, а не в код

3. **Проверяй код перед коммитом:**
   ```bash
   # Установи git-secrets или gitleaks
   brew install gitleaks
   
   # Проверь перед коммитом
   gitleaks detect --source . --verbose
   ```

## ✅ Чеклист исправления

- [ ] Отозван старый Service Role Key в Supabase
- [ ] Сгенерирован новый ключ
- [ ] Обновлен `VITE_SUPABASE_SERVICE_ROLE_KEY` в Vercel
- [ ] Запущен новый build в Vercel после обновления переменной
- [ ] Обновлен `.env.local` локально
- [ ] Проверены логи безопасности Supabase
- [ ] Удален ключ из текущего кода (если есть)
- [ ] Удален ключ из Git истории (опционально, но рекомендуется)
- [ ] Настроен `.gitignore` для предотвращения утечек
- [ ] Закрыто оповещение в GitHub (после выполнения всех шагов)

## 📚 Полезные ссылки

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Supabase: API Keys](https://supabase.com/docs/guides/database/api-keys)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

## ⚠️ После выполнения

После того, как ты выполнишь все шаги и убедишься, что новый ключ работает, можешь закрыть оповещение в GitHub:
1. Открой оповещение в GitHub
2. Выбери **"Close as resolved"** или **"Mark as revoked"**

