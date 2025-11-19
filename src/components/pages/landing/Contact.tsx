export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-black text-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="text-5xl md:text-7xl mb-12">Контакты</h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-16 leading-relaxed">
              Готовы начать работу с Buro CRM? Свяжитесь с нами любым удобным способом.
            </p>

            <div className="space-y-8">
              <div>
                <div className="text-sm text-gray-500 mb-2 tracking-widest">EMAIL</div>
                <a href="mailto:support@burocrm.ru" className="text-2xl hover:opacity-60 transition-opacity">
                  support@burocrm.ru
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2 tracking-widest">ТЕЛЕФОН</div>
                <a href="tel:+78001234567" className="text-2xl hover:opacity-60 transition-opacity">
                  +7 (800) 123-45-67
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2 tracking-widest">ГРАФИК РАБОТЫ</div>
                <p className="text-2xl">
                  Пн-Пт: 9:00 — 18:00<br />
                  Сб-Вс: Выходной
                </p>
              </div>
            </div>
          </div>

          <div>
            <form className="space-y-6">
              <div>
                <label className="block text-sm text-gray-500 mb-2 tracking-widest">ИМЯ</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-gray-700 py-3 text-xl focus:border-white outline-none transition-colors"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2 tracking-widest">КОМПАНИЯ</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-gray-700 py-3 text-xl focus:border-white outline-none transition-colors"
                  placeholder="Название компании"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2 tracking-widest">EMAIL</label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-gray-700 py-3 text-xl focus:border-white outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2 tracking-widest">ТЕЛЕФОН</label>
                <input
                  type="tel"
                  className="w-full bg-transparent border-b border-gray-700 py-3 text-xl focus:border-white outline-none transition-colors"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2 tracking-widest">СООБЩЕНИЕ</label>
                <textarea
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-700 py-3 text-xl focus:border-white outline-none resize-none transition-colors"
                  placeholder="Расскажите о вашей компании"
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-8 py-4 border-2 border-white text-lg hover:bg-white hover:text-black transition-colors duration-300"
              >
                Отправить заявку
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 mt-24 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Column 1 - Buro Brands Links */}
            <div className="space-y-4">
              <a 
                href="https://burocrm.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm tracking-widest hover:text-gray-400 transition-colors"
              >
                BURO CRM
              </a>
              <a 
                href="https://www.burodigital.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm tracking-widest hover:text-gray-400 transition-colors"
              >
                BURO DIGITAL
              </a>
              <a 
                href="https://burodsgn.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm tracking-widest hover:text-gray-400 transition-colors"
              >
                BURO DSGN
              </a>
            </div>

            {/* Column 2 - Legal Links */}
            <div className="space-y-4">
              <a href="#privacy" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#terms" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Условия использования
              </a>
              <a href="#agreement" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Пользовательское соглашение
              </a>
              <a href="#legal" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Юридическая информация
              </a>
            </div>

            {/* Column 3 - Copyright & Social */}
            <div className="flex flex-col items-start md:items-end gap-6">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">© 2025 Все права защищены</p>
                <span className="text-gray-700">•</span>
                <p className="text-xs text-gray-600">Разработано Buro Digital</p>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-4">
                <a 
                  href="https://github.com/burodigital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://t.me/burodigital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a 
                  href="https://vk.com/burodigital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="VK"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.72c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.491-.085.744-.576.744z"/>
                  </svg>
                </a>
                <a 
                  href="https://youtube.com/@burodigital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
