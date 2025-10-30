-- ============================================
-- ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ ПОЛИТИК
-- ============================================

-- Contacts
DROP POLICY IF EXISTS "anon_all_contacts" ON contacts;
CREATE POLICY "anon_all_contacts" 
  ON contacts FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Addresses
DROP POLICY IF EXISTS "anon_all_addresses" ON addresses;
CREATE POLICY "anon_all_addresses" 
  ON addresses FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Client Tags
DROP POLICY IF EXISTS "anon_all_client_tags" ON client_tags;
CREATE POLICY "anon_all_client_tags" 
  ON client_tags FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Проверка
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('contacts', 'addresses', 'client_tags')
ORDER BY tablename, policyname;

