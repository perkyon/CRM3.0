import { Users, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';

export default function Services() {
  const services = [
    {
      number: '01',
      icon: Users,
      title: 'Управление клиентами',
      description: 'База клиентов с полной историей заказов, контактами и предпочтениями. CRM для долгосрочных отношений.',
      tags: ['CRM', 'База клиентов', 'История заказов'],
      color: 'white',
    },
    {
      number: '02',
      icon: ShoppingCart,
      title: 'Контроль заказов',
      description: 'Отслеживайте каждый заказ от замера до установки. Все этапы под контролем в одном интерфейсе.',
      tags: ['Заказы', 'Статусы', 'Отслеживание'],
      color: 'black',
    },
    {
      number: '03',
      icon: Calendar,
      title: 'Производственный календарь',
      description: 'Планируйте загрузку цеха, распределяйте задачи между работниками и контролируйте сроки.',
      tags: ['Планирование', 'Календарь', 'Задачи'],
      color: 'white',
    },
    {
      number: '04',
      icon: DollarSign,
      title: 'Финансовый учет',
      description: 'Отслеживайте платежи, авансы и долги. Формируйте отчеты о прибыли и убытках.',
      tags: ['Финансы', 'Платежи', 'Отчеты'],
      color: 'black',
    },
  ];

  return (
    <section id="services" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {services.map((service, index) => {
            const Icon = service.icon;
            const [ref, inView] = useInView({
              triggerOnce: true,
              threshold: 0.2,
            });

            return (
              <motion.div
                key={index}
                ref={ref}
                initial={{ opacity: 0, y: 60 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`p-12 md:p-16 lg:p-24 min-h-[500px] flex flex-col justify-between border border-gray-200 group cursor-pointer transition-all duration-500 ${
                  service.color === 'black' 
                    ? 'bg-black text-white hover:bg-gray-900' 
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                <div>
                  <motion.div 
                    className={`text-8xl md:text-9xl mb-8 transition-opacity duration-500 ${
                      service.color === 'black' ? 'text-white opacity-20 group-hover:opacity-30' : 'text-black opacity-10 group-hover:opacity-20'
                    }`}
                  >
                    {service.number}
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    className={`mb-6 inline-block p-4 border ${
                      service.color === 'black' ? 'border-white' : 'border-black'
                    }`}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>

                  <h2 className="text-3xl md:text-4xl mb-6 transition-transform duration-500 group-hover:translate-x-2">
                    {service.title}
                  </h2>
                  <p className={`text-lg md:text-xl leading-relaxed ${
                    service.color === 'black' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {service.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  {service.tags.map((tag, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.5 + idx * 0.1 }}
                      className={`text-sm px-4 py-2 border transition-all duration-300 ${
                        service.color === 'black' 
                          ? 'border-white text-white hover:bg-white hover:text-black' 
                          : 'border-black text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
