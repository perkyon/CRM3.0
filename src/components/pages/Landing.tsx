import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';
import { 
  Code, 
  Smartphone, 
  Palette, 
  Lightbulb,
  TrendingUp,
  Clock,
  BarChart3,
  Shield,
  Menu,
  X
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.landing}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.navLogo}>BURO DIGITAL</div>
          <button 
            className={styles.navMenu}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className={styles.navMenuOverlay} onClick={() => setMenuOpen(false)}>
            <div className={styles.navMenuContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.navMenuHeader}>
                <div className={styles.navLogo}>BURO DIGITAL</div>
                <button 
                  className={styles.navMenuClose}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className={styles.navMenuLinks}>
                <a href="#services" onClick={() => setMenuOpen(false)} className={styles.navMenuLink}>Возможности</a>
                <a href="#benefits" onClick={() => setMenuOpen(false)} className={styles.navMenuLink}>Преимущества</a>
                <a href="#pricing" onClick={() => setMenuOpen(false)} className={styles.navMenuLink}>Тарифы</a>
                <a href="#contact" onClick={() => setMenuOpen(false)} className={styles.navMenuLink}>Контакты</a>
                <div className={styles.navMenuActions}>
                  <button 
                    className={styles.navMenuActionButton}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Войти
                  </button>
                  <button 
                    className={`${styles.navMenuActionButton} ${styles.navMenuActionButtonSecondary}`}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/pricing');
                    }}
                  >
                    Регистрация
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine}>Цифровые</span>
              <span className={styles.heroTitleLine}>решения</span>
              <span className={styles.heroTitleLine}>для</span>
              <span className={styles.heroTitleLine}>вашего</span>
              <span className={styles.heroTitleLine}>бизнеса</span>
            </h1>
            <p className={styles.heroDescription}>
              Создаем современные веб-приложения, мобильные приложения и цифровые продукты, которые помогают бизнесу расти и развиваться.
            </p>
            <button 
              className={styles.heroButton}
              onClick={() => navigate('/pricing')}
            >
              Обсудить проект
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.servicesGrid}>
            {/* Service 1 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardWhite}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberWhite}`}>01</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#000' }}>
                  <Code size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Веб-разработка</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionWhite}`}>
                  Создаем современные веб-приложения и сайты с использованием передовых технологий и лучших практик разработки.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>React</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>TypeScript</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Next.js</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardBlack}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberBlack}`}>02</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#fff' }}>
                  <Smartphone size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Мобильная разработка</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionBlack}`}>
                  Разрабатываем нативные и кроссплатформенные мобильные приложения для iOS и Android.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>iOS</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Android</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>React Native</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardWhite}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberWhite}`}>03</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#000' }}>
                  <Palette size={32} />
                </div>
                <h2 className={styles.serviceTitle}>UI/UX дизайн</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionWhite}`}>
                  Создаем интуитивные и красивые интерфейсы, которые обеспечивают отличный пользовательский опыт.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Figma</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Прототипирование</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Дизайн-системы</span>
              </div>
            </div>

            {/* Service 4 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardBlack}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberBlack}`}>04</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#fff' }}>
                  <Lightbulb size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Консалтинг</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionBlack}`}>
                  Помогаем бизнесу выбрать правильные технологии и архитектурные решения для цифровой трансформации.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Архитектура</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Стратегия</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Оптимизация</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.benefitsTitle}>Преимущества</h2>
          <p className={styles.benefitsSubtitle}>
            Реальные результаты, которые получают наши клиенты
          </p>

          <div className={styles.benefitsGrid}>
            {/* Results */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <TrendingUp className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>РЕЗУЛЬТАТЫ</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Реализованных проектов</div>
                <div className={styles.benefitItemValue}>50+</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Довольных клиентов</div>
                <div className={styles.benefitItemValue}>30+</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Лет опыта</div>
                <div className={styles.benefitItemValue}>5+</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Средняя оценка</div>
                <div className={styles.benefitItemValue}>4.9/5</div>
              </div>
            </div>

            {/* Automation */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <Clock className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>АВТОМАТИЗАЦИЯ</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Адаптивный дизайн</div>
                <div className={styles.benefitItemValue}>100%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Оптимизация производительности</div>
                <div className={styles.benefitItemValue}>95%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Соблюдение сроков</div>
                <div className={styles.benefitItemValue}>98%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Поддержка после запуска</div>
                <div className={styles.benefitItemValue}>24/7</div>
              </div>
            </div>

            {/* Analytics */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <BarChart3 className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>АНАЛИТИКА</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Скорость загрузки</div>
                <div className={styles.benefitItemValue}><2с</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>SEO оптимизация</div>
                <div className={styles.benefitItemValue}>90+</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Доступность</div>
                <div className={styles.benefitItemValue}>WCAG AA</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Кроссбраузерность</div>
                <div className={styles.benefitItemValue}>100%</div>
              </div>
            </div>

            {/* Security */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <Shield className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>БЕЗОПАСНОСТЬ</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Шифрование данных</div>
                <div className={styles.benefitItemValue}>256bit</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Защита данных SSL</div>
                <div className={styles.benefitItemValue}>100%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Соответствие GDPR</div>
                <div className={styles.benefitItemValue}>100%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Uptime</div>
                <div className={styles.benefitItemValue}>99.9%</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div>
              <div className={styles.statValue}>50+</div>
              <div className={styles.statLabel}>Успешно реализованных проектов</div>
            </div>
            <div>
              <div className={styles.statValue}>30+</div>
              <div className={styles.statLabel}>Довольных клиентов по всему миру</div>
            </div>
            <div>
              <div className={styles.statValue}>24/7</div>
              <div className={styles.statLabel}>Техническая поддержка</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className={`${styles.section} ${styles.demoSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.demoTitle}>Портфолио</h2>
          <p className={styles.demoSubtitle}>
            Посмотрите примеры наших работ и успешных проектов
          </p>
          <button 
            className={styles.demoButton}
            onClick={() => window.open('https://www.burodigital.ru/portfolio', '_blank')}
          >
            Смотреть портфолио
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.pricingTitle}>Услуги</h2>
          <p className={styles.pricingSubtitle}>
            Гибкие тарифы и индивидуальный подход к каждому проекту. Свяжитесь с нами для расчета стоимости.
          </p>

          <div className={styles.pricingGrid}>
            {/* Service 1: Веб-разработка */}
            <div className={styles.pricingCard}>
              <h3 className={styles.pricingPlanTitle}>Веб-разработка</h3>
              <p className={styles.pricingPlanDescription}>Современные веб-приложения</p>
              <div className={styles.pricingPlanPrice}>от 150 000₽</div>
              <button 
                className={styles.pricingButton}
                onClick={() => navigate('/pricing')}
              >
                Обсудить проект →
              </button>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>React / Next.js</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>TypeScript</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Адаптивный дизайн</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>SEO оптимизация</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Интеграции API</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Техническая поддержка</span>
                </li>
              </ul>
            </div>

            {/* Service 2: Мобильная разработка (Популярный) */}
            <div className={`${styles.pricingCard} ${styles.pricingCardPopular} ${styles.pricingCardBlack}`}>
              <div className={styles.pricingCardPopularBadge}>Популярный</div>
              <h3 className={styles.pricingPlanTitle}>Мобильная разработка</h3>
              <p className={styles.pricingPlanDescription}>iOS и Android приложения</p>
              <div className={styles.pricingPlanPrice}>от 200 000₽</div>
              <button 
                className={`${styles.pricingButton} ${styles.pricingButtonPopular}`}
                onClick={() => navigate('/pricing')}
              >
                Обсудить проект →
              </button>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Нативная разработка</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>React Native</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Кроссплатформенность</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Публикация в сторы</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Push-уведомления</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Обновления и поддержка</span>
                </li>
              </ul>
            </div>

            {/* Service 3: UI/UX дизайн */}
            <div className={`${styles.pricingCard} ${styles.pricingCardBlack}`}>
              <h3 className={styles.pricingPlanTitle}>UI/UX дизайн</h3>
              <p className={styles.pricingPlanDescription}>Дизайн интерфейсов</p>
              <div className={styles.pricingPlanPrice}>от 80 000₽</div>
              <button 
                className={`${styles.pricingButton} ${styles.pricingButtonPopular}`}
                onClick={() => navigate('/pricing')}
              >
                Обсудить проект →
              </button>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Исследование пользователей</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Прототипирование</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Дизайн-системы</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Адаптивные макеты</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Анимации и переходы</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Гайдлайны и документация</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`${styles.section} ${styles.contactSectionDark}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.contactGrid}>
            {/* Contact Info */}
            <div>
              <h2 className={styles.contactTitle}>Контакты</h2>
              <p className={styles.contactDescription}>
                Готовы начать работу с Buro Digital? Свяжитесь с нами любым удобным способом.
              </p>
              <div className={styles.contactInfo}>
                <div className={styles.contactInfoItem}>
                  <div className={styles.contactInfoLabel}>EMAIL</div>
                  <a href="mailto:info@burodigital.ru" className={styles.contactInfoLink}>
                    info@burodigital.ru
                  </a>
                </div>
                <div className={styles.contactInfoItem}>
                  <div className={styles.contactInfoLabel}>ТЕЛЕФОН</div>
                  <a href="tel:+78001234567" className={styles.contactInfoLink}>
                    +7 (800) 123-45-67
                  </a>
                </div>
                <div className={styles.contactInfoItem}>
                  <div className={styles.contactInfoLabel}>ГРАФИК РАБОТЫ</div>
                  <div className={styles.contactInfoValue}>
                    Пн-Пт: 9:00 — 18:00<br />
                    Сб-Вс: Выходной
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.contactForm}>
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <div className={styles.contactFormField}>
                  <label className={styles.contactFormLabel}>ИМЯ</label>
                  <input 
                    type="text" 
                    placeholder="Ваше имя" 
                    className={styles.contactFormInput}
                  />
                </div>
                <div className={styles.contactFormField}>
                  <label className={styles.contactFormLabel}>КОМПАНИЯ</label>
                  <input 
                    type="text" 
                    placeholder="Название компании" 
                    className={styles.contactFormInput}
                  />
                </div>
                <div className={styles.contactFormField}>
                  <label className={styles.contactFormLabel}>EMAIL</label>
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className={styles.contactFormInput}
                  />
                </div>
                <div className={styles.contactFormField}>
                  <label className={styles.contactFormLabel}>ТЕЛЕФОН</label>
                  <input 
                    type="tel" 
                    placeholder="+7 (999) 123-45-67" 
                    className={styles.contactFormInput}
                  />
                </div>
                <div className={styles.contactFormField}>
                  <label className={styles.contactFormLabel}>СООБЩЕНИЕ</label>
                  <textarea 
                    placeholder="Расскажите о вашей компании" 
                    className={`${styles.contactFormInput} ${styles.contactFormTextarea}`}
                    rows={4}
                  />
                </div>
                <button type="submit" className={styles.contactFormButton}>
                  Отправить заявку
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrands}>
            <a href="https://burocrm.ru" className={styles.footerBrandLink} target="_blank" rel="noopener noreferrer">
              BURO CRM
            </a>
            <a href="https://www.burodigital.ru" className={styles.footerBrandLink} target="_blank" rel="noopener noreferrer">
              BURO DIGITAL
            </a>
            <a href="https://burodsgn.ru" className={styles.footerBrandLink} target="_blank" rel="noopener noreferrer">
              BURO DSGN
            </a>
          </div>
          <div className={styles.footerLinks}>
            <a href="#privacy" className={styles.footerLink}>Политика конфиденциальности</a>
            <a href="#terms" className={styles.footerLink}>Условия использования</a>
            <a href="#agreement" className={styles.footerLink}>Пользовательское соглашение</a>
            <a href="#legal" className={styles.footerLink}>Юридическая информация</a>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              <span>© 2025 Все права защищены</span>
              <span> • </span>
              <span>Разработано Buro Digital</span>
            </div>
            <div className={styles.footerSocial}>
              <a href="https://github.com/burodigital" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>
                GitHub
              </a>
              <a href="https://t.me/burodigital" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>
                Telegram
              </a>
              <a href="https://vk.com/burodigital" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>
                VK
              </a>
              <a href="https://youtube.com/@burodigital" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink}>
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
