import { TrendingUp, Clock, Award, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

export default function Technologies() {
  const benefits = [
    {
      title: 'Результаты',
      icon: TrendingUp,
      items: [
        { name: 'Рост продаж', value: 40, suffix: '%' },
        { name: 'Экономия времени', value: 3, suffix: 'x' },
        { name: 'Удовлетворенность клиентов', value: 95, suffix: '%' },
        { name: 'Снижение ошибок', value: 60, suffix: '%' },
      ],
    },
    {
      title: 'Автоматизация',
      icon: Clock,
      items: [
        { name: 'Уведомления клиентам', value: 100, suffix: '%' },
        { name: 'Напоминания о платежах', value: 100, suffix: '%' },
        { name: 'Контроль сроков', value: 100, suffix: '%' },
        { name: 'Формирование отчетов', value: 100, suffix: '%' },
      ],
    },
    {
      title: 'Аналитика',
      icon: Award,
      items: [
        { name: 'Динамика продаж', value: 100, suffix: '%' },
        { name: 'Загрузка производства', value: 100, suffix: '%' },
        { name: 'Финансовые показатели', value: 100, suffix: '%' },
        { name: 'Эффективность менеджеров', value: 100, suffix: '%' },
      ],
    },
    {
      title: 'Безопасность',
      icon: Shield,
      items: [
        { name: 'Резервное копирование', value: 100, suffix: '%' },
        { name: 'Защита данных SSL', value: 256, suffix: 'bit' },
        { name: 'Разграничение доступа', value: 100, suffix: '%' },
        { name: 'SLA Uptime', value: 99.9, suffix: '%' },
      ],
    },
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="technologies" className="py-24 md:py-32 bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 md:px-12" ref={ref}>
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl mb-8"
        >
          Преимущества
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-24 max-w-3xl"
        >
          Реальные результаты, которые получают наши клиенты
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {benefits.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <Icon className="w-6 h-6" />
                  <h3 className="text-sm tracking-widest text-gray-400">
                    {category.title.toUpperCase()}
                  </h3>
                </div>
                <div className="space-y-8">
                  {category.items.map((item, idx) => (
                    <AnimatedMetric 
                      key={idx} 
                      item={item} 
                      inView={inView}
                      delay={0.6 + index * 0.1 + idx * 0.1}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-24 pt-24 border-t border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StatCounter value={500} suffix="+" label="Мебельных компаний используют систему" inView={inView} />
            <StatCounter value={10} suffix="K+" label="Заказов обрабатывается ежемесячно" inView={inView} />
            <StatCounter value={24} suffix="/7" label="Поддержка на русском языке" inView={inView} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedMetric({ item, inView, delay }: { item: any; inView: boolean; delay: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setProgress(item.value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [inView, item.value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xl">{item.name}</span>
        <motion.span 
          className="text-xl"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: delay + 0.3 }}
        >
          {item.suffix === '%' || item.suffix === 'x' 
            ? `${Math.round(progress)}${item.suffix}`
            : `${progress}${item.suffix}`
          }
        </motion.span>
      </div>
      <div className="h-px bg-gray-200 relative overflow-hidden">
        <motion.div
          className="h-px bg-black absolute left-0 top-0"
          initial={{ width: '0%' }}
          animate={inView ? { width: item.suffix === '%' ? `${progress}%` : '100%' } : { width: '0%' }}
          transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function StatCounter({ value, suffix, label, inView }: { value: number; suffix: string; label: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [inView, value]);

  return (
    <div>
      <motion.div 
        className="text-6xl mb-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {count}{suffix}
      </motion.div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
