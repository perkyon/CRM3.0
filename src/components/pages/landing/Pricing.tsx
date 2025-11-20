import { useState } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';

interface PricingProps {
  onSelectPlan: () => void;
}

export default function Pricing({ onSelectPlan }: PricingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans = [
    {
      name: 'Старт',
      price: '2 990',
      description: 'Для небольших мастерских',
      features: [
        'До 3 пользователей',
        'До 50 заказов в месяц',
        'Управление клиентами',
        'Каталог продукции',
        'Базовая аналитика',
        'Email поддержка',
      ],
    },
    {
      name: 'Бизнес',
      price: '5 990',
      description: 'Для растущих компаний',
      features: [
        'До 10 пользователей',
        'До 200 заказов в месяц',
        'Все функции Старт',
        'Производственный календарь',
        'Финансовый учет',
        'Расширенная аналитика',
        'Интеграции с 1С',
        'Приоритетная поддержка',
      ],
      highlighted: true,
    },
    {
      name: 'Производство',
      price: '12 990',
      description: 'Для крупных предприятий',
      features: [
        'Неограниченно пользователей',
        'Неограниченно заказов',
        'Все функции Бизнес',
        'Управление складом',
        'API доступ',
        'Персональный менеджер',
        'Обучение команды',
        'SLA 99.9%',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-white border-t border-gray-200" ref={ref}>
      <div className="container mx-auto px-6 md:px-12">
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl mb-8"
          style={{ color: '#151515' }}
        >
          Тарифы
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-24 max-w-3xl"
          style={{ color: '#151515' }}
        >
          Прозрачное ценообразование без скрытых платежей. Первые 3 месяца бесплатно.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.2 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: hoveredIndex === index ? 1.05 : 1,
                  y: hoveredIndex === index ? -8 : 0,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`relative p-12 border-2 transition-all duration-500 cursor-pointer h-full ${
                  plan.highlighted 
                    ? 'bg-black text-white border-black' 
                    : hoveredIndex === index
                    ? 'bg-gray-50 border-black'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-blue-500 text-white text-sm"
                  >
                    Популярный
                  </motion.div>
                )}

                {/* Hover Glow Effect */}
                {hoveredIndex === index && !plan.highlighted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500"
                  />
                )}

                <div className="relative z-10">
                  <div className="mb-12">
                    <motion.h3 
                      animate={{
                        scale: hoveredIndex === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl mb-2"
                    >
                      {plan.name}
                    </motion.h3>
                    <p className="text-sm mb-8" style={{ color: plan.highlighted ? '#ffffff' : '#151515' }}>
                      {plan.description}
                    </p>
                    
                    <motion.div 
                      className="mb-8"
                      animate={{
                        x: hoveredIndex === index ? 10 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-5xl">{plan.price}</span>
                      <span className="text-lg ml-2" style={{ color: plan.highlighted ? '#ffffff' : '#151515' }}>
                        ₽/мес
                      </span>
                    </motion.div>

                    <motion.button
                      onClick={onSelectPlan}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-4 border-2 text-lg transition-all duration-300 relative overflow-hidden group ${
                        plan.highlighted
                          ? 'border-white text-white hover:bg-white hover:text-black'
                          : 'border-black text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      <motion.span
                        animate={{
                          x: hoveredIndex === index ? [0, 5, 0] : 0,
                        }}
                        transition={{ duration: 0.6, repeat: hoveredIndex === index ? Infinity : 0 }}
                      >
                        Выбрать план →
                      </motion.span>
                    </motion.button>
                  </div>

                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <motion.li 
                        key={idx} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.2 + idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          animate={{
                            scale: hoveredIndex === index ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ 
                            duration: 0.6, 
                            delay: idx * 0.05,
                            repeat: hoveredIndex === index ? Infinity : 0,
                            repeatDelay: 1,
                          }}
                        >
                          <Check className={`w-5 h-5 mt-0.5 ${
                            plan.highlighted ? 'text-white' : 'text-black'
                          }`} />
                        </motion.div>
                        <span style={{ color: plan.highlighted ? '#ffffff' : '#151515' }}>
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Corner decoration on hover */}
                {hoveredIndex === index && (
                  <>
                    <motion.div
                      initial={{ width: 0, height: 0 }}
                      animate={{ width: 20, height: 2 }}
                      className={`absolute top-0 left-0 ${
                        plan.highlighted ? 'bg-white' : 'bg-black'
                      }`}
                    />
                    <motion.div
                      initial={{ width: 0, height: 0 }}
                      animate={{ width: 2, height: 20 }}
                      className={`absolute top-0 left-0 ${
                        plan.highlighted ? 'bg-white' : 'bg-black'
                      }`}
                    />
                    <motion.div
                      initial={{ width: 0, height: 0 }}
                      animate={{ width: 20, height: 2 }}
                      className={`absolute bottom-0 right-0 ${
                        plan.highlighted ? 'bg-white' : 'bg-black'
                      }`}
                    />
                    <motion.div
                      initial={{ width: 0, height: 0 }}
                      animate={{ width: 2, height: 20 }}
                      className={`absolute bottom-0 right-0 ${
                        plan.highlighted ? 'bg-white' : 'bg-black'
                      }`}
                    />
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
