const { config } = require('dotenv');
const { PrismaClient } = require('@prisma/client');

config();

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Контроллеры и системы управления',
    slug: 'kontrollery-i-sistemy-upravleniya',
    description: 'Программируемые логические контроллеры (ПЛК), PAC-системы, распределённые системы управления (DCS), модули ввода-вывода, панели оператора HMI и программное обеспечение для автоматизации.',
  },
  {
    name: 'Приводная техника',
    slug: 'privodnaya-tehnika',
    description: 'Частотные преобразователи, сервоприводы, сервомоторы, шаговые двигатели и системы управления движением для промышленной автоматизации.',
  },
  {
    name: 'Редукторы и механическая передача',
    slug: 'reduktory-i-mehanicheskaya-peredacha',
    description: 'Мотор-редукторы, червячные и планетарные редукторы, линейные направляющие, шарико-винтовые передачи, муфты и компоненты механических систем.',
  },
  {
    name: 'Пневматика и гидравлика',
    slug: 'pnevmatika-i-gidravlika',
    description: 'Пневмоцилиндры, гидроцилиндры, распределители, клапаны, фитинги, системы подготовки воздуха, гидростанции и вакуумная техника.',
  },
  {
    name: 'Датчики и измерительные приборы',
    slug: 'datchiki-i-izmeritelnye-pribory',
    description: 'Индуктивные, ёмкостные, оптические и ультразвуковые датчики, датчики давления, расхода, уровня и температуры, энкодеры, системы технического зрения и измерительное оборудование.',
  },
  {
    name: 'Промышленные соединители и клеммы',
    slug: 'promyshlennye-soediniteli-i-klemmy',
    description: 'Клеммные блоки, промышленные разъёмы, кабельные вводы, кабель-каналы, маркировка и инструменты для электромонтажа.',
  },
  {
    name: 'Электротехника и коммутационное оборудование',
    slug: 'elektrotehnika-i-kommutacionnoe-oborudovanie',
    description: 'Автоматические выключатели, контакторы, пускатели, реле, УЗО, предохранители, распределительные устройства, щитовое оборудование и системы безопасности.',
  },
  {
    name: 'Источники питания и ИБП',
    slug: 'istochniki-pitaniya-i-ibp',
    description: 'Импульсные и линейные блоки питания, источники бесперебойного питания (ИБП), DC/DC преобразователи, зарядные устройства и системы резервного электроснабжения.',
  },
  {
    name: 'Серверы, СХД и сетевое оборудование',
    slug: 'servery-shd-i-setevoe-oborudovanie',
    description: 'Серверы, системы хранения данных, сетевые коммутаторы, маршрутизаторы, межсетевые экраны, точки доступа Wi-Fi и компоненты для ЦОД.',
  },
  {
    name: 'Системы видеонаблюдения и безопасности',
    slug: 'sistemy-videonablyudeniya-i-bezopasnosti',
    description: 'IP-камеры, видеорегистраторы (NVR/DVR), PTZ-камеры, системы контроля и управления доступом (СКУД), домофоны, охранная сигнализация и программное обеспечение для видеоаналитики.',
  },
];

const run = async () => {
  console.log(`Starting categories seeding. Total categories: ${CATEGORIES.length}`);

  let created = 0;
  let updated = 0;

  for (const categoryData of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
      },
      update: {
        name: categoryData.name,
        description: categoryData.description,
      },
    });

    const isNew = category.createdAt.getTime() === category.updatedAt.getTime();
    if (isNew) {
      created++;
      console.log(`Created: ${category.name}`);
    } else {
      updated++;
      console.log(`Updated: ${category.name}`);
    }
  }

  console.log(`\nSeeding completed!`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Total: ${CATEGORIES.length}`);
};

run()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
