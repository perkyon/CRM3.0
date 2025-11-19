import { motion } from 'motion/react';

export default function CRMDemo() {
  return (
    <section className="py-24 md:py-32 bg-black text-white border-t border-gray-800">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl mb-8">Демо-версия</h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl">
            Посмотрите, как работает система изнутри
          </p>

          <a
            href="https://www.burodigital.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 border-2 border-white text-lg hover:bg-white hover:text-black transition-colors duration-300"
          >
            Открыть демо
          </a>
        </motion.div>
      </div>
    </section>
  );
}
