import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';
import { 
  Users, 
  ShoppingCart, 
  Calendar, 
  DollarSign,
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
          <div className={styles.navLogo}>BURO CRM</div>
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
                <div className={styles.navLogo}>BURO CRM</div>
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
              <span className={styles.heroTitleLine}>CRM</span>
              <span className={styles.heroTitleLine}>система</span>
              <span className={styles.heroTitleLine}>для</span>
              <span className={styles.heroTitleLine}>мебельного</span>
              <span className={styles.heroTitleLine}>производства</span>
            </h1>
            <p className={styles.heroDescription}>
              Управляйте клиентами, заказами и производством в одной системе. Увеличьте продажи на 40% и сократите время на рутину в 3 раза.
            </p>
            <button 
              className={styles.heroButton}
              onClick={() => navigate('/pricing')}
            >
              Попробовать бесплатно
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
                  <Users size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Управление клиентами</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionWhite}`}>
                  База клиентов с полной историей заказов, контактами и предпочтениями. CRM для долгосрочных отношений.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>CRM</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>База клиентов</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>История заказов</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardBlack}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberBlack}`}>02</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#fff' }}>
                  <ShoppingCart size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Контроль заказов</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionBlack}`}>
                  Отслеживайте каждый заказ от замера до установки. Все этапы под контролем в одном интерфейсе.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Заказы</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Статусы</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Отслеживание</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardWhite}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberWhite}`}>03</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#000' }}>
                  <Calendar size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Производственный календарь</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionWhite}`}>
                  Планируйте загрузку цеха, распределяйте задачи между работниками и контролируйте сроки.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Планирование</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Календарь</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagWhite}`}>Задачи</span>
              </div>
            </div>

            {/* Service 4 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardBlack}`}>
              <div>
                <div className={`${styles.serviceNumber} ${styles.serviceNumberBlack}`}>04</div>
                <div className={styles.serviceIcon} style={{ borderColor: '#fff' }}>
                  <DollarSign size={32} />
                </div>
                <h2 className={styles.serviceTitle}>Финансовый учет</h2>
                <p className={`${styles.serviceDescription} ${styles.serviceDescriptionBlack}`}>
                  Отслеживайте платежи, авансы и долги. Формируйте отчеты о прибыли и убытках.
                </p>
              </div>
              <div className={styles.serviceTags}>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Финансы</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Платежи</span>
                <span className={`${styles.serviceTag} ${styles.serviceTagBlack}`}>Отчеты</span>
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
                <div className={styles.benefitItemLabel}>Рост продаж</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Экономия времени</div>
                <div className={styles.benefitItemValue}>0x</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Удовлетворенность клиентов</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Снижение ошибок</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
            </div>

            {/* Automation */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <Clock className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>АВТОМАТИЗАЦИЯ</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Уведомления клиентам</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Напоминания о платежах</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Контроль сроков</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Формирование отчетов</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
            </div>

            {/* Analytics */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <BarChart3 className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>АНАЛИТИКА</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Динамика продаж</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Загрузка производства</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Финансовые показатели</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Эффективность менеджеров</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
            </div>

            {/* Security */}
            <div className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <Shield className={styles.benefitIcon} />
                <h3 className={styles.benefitCardTitle}>БЕЗОПАСНОСТЬ</h3>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Резервное копирование</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Защита данных SSL</div>
                <div className={styles.benefitItemValue}>0bit</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>Разграничение доступа</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitItemLabel}>SLA Uptime</div>
                <div className={styles.benefitItemValue}>0%</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div>
              <div className={styles.statValue}>0+</div>
              <div className={styles.statLabel}>Мебельных компаний используют систему</div>
            </div>
            <div>
              <div className={styles.statValue}>0K+</div>
              <div className={styles.statLabel}>Заказов обрабатывается ежемесячно</div>
            </div>
            <div>
              <div className={styles.statValue}>0/7</div>
              <div className={styles.statLabel}>Поддержка на русском языке</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className={`${styles.section} ${styles.demoSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.demoTitle}>Демо-версия</h2>
          <p className={styles.demoSubtitle}>
            Посмотрите, как работает система изнутри
          </p>
          <button 
            className={styles.demoButton}
            onClick={() => navigate('/login')}
          >
            Открыть демо
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.pricingTitle}>Тарифы</h2>
          <p className={styles.pricingSubtitle}>
            Прозрачное ценообразование без скрытых платежей. Первые 3 месяца бесплатно.
          </p>

          <div className={styles.pricingGrid}>
            {/* Plan 1: Старт */}
            <div className={styles.pricingCard}>
              <h3 className={styles.pricingPlanTitle}>Старт</h3>
              <p className={styles.pricingPlanDescription}>Для небольших мастерских</p>
              <div className={styles.pricingPlanPrice}>2 990₽/мес</div>
              <button 
                className={styles.pricingButton}
                onClick={() => navigate('/pricing')}
              >
                Выбрать план →
              </button>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>До 3 пользователей</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>До 50 заказов в месяц</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Управление клиентами</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Каталог продукции</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Базовая аналитика</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Email поддержка</span>
                </li>
              </ul>
            </div>

            {/* Plan 2: Бизнес (Популярный) */}
            <div className={`${styles.pricingCard} ${styles.pricingCardPopular} ${styles.pricingCardBlack}`}>
              <div className={styles.pricingCardPopularBadge}>Популярный</div>
              <h3 className={styles.pricingPlanTitle}>Бизнес</h3>
              <p className={styles.pricingPlanDescription}>Для растущих компаний</p>
              <div className={styles.pricingPlanPrice}>5 990₽/мес</div>
              <button 
                className={`${styles.pricingButton} ${styles.pricingButtonPopular}`}
                onClick={() => navigate('/pricing')}
              >
                Выбрать план →
              </button>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>До 10 пользователей</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>До 200 заказов в месяц</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Все функции Старт</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Производственный календарь</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Финансовый учет</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Расширенная аналитика</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Интеграции с 1С</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Приоритетная поддержка</span>
                </li>
              </ul>
            </div>

            {/* Plan 3: Производство */}
            <div className={`${styles.pricingCard} ${styles.pricingCardBlack}`}>
              <h3 className={styles.pricingPlanTitle}>Производство</h3>
              <p className={styles.pricingPlanDescription}>Для крупных предприятий</p>
              <div className={styles.pricingPlanPrice}>12 990₽/мес</div>
              <button 
                className={`${styles.pricingButton} ${styles.pricingButtonPopular}`}
                onClick={() => navigate('/pricing')}
              >
                Выбрать план →
              </button>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Неограниченно пользователей</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Неограниченно заказов</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Все функции Бизнес</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Управление складом</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>API доступ</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Персональный менеджер</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>Обучение команды</span>
                </li>
                <li className={styles.pricingFeature}>
                  <div className={styles.pricingFeatureDot}>
                    <div className={styles.pricingFeatureDotInner} />
                  </div>
                  <span>SLA 99.9%</span>
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
                Готовы начать работу с Buro CRM? Свяжитесь с нами любым удобным способом.
              </p>
              <div className={styles.contactInfo}>
                <div className={styles.contactInfoItem}>
                  <div className={styles.contactInfoLabel}>EMAIL</div>
                  <a href="mailto:support@burocrm.ru" className={styles.contactInfoLink}>
                    support@burocrm.ru
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
