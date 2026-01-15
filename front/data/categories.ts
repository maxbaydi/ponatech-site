export interface CategoryData {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  brandSlugs: string[];
}

export const CATEGORIES: CategoryData[] = [
  {
    name: 'Контроллеры и системы управления',
    slug: 'kontrollery-i-sistemy-upravleniya',
    description: 'Программируемые логические контроллеры (ПЛК), PAC-системы, распределённые системы управления (DCS), модули ввода-вывода, панели оператора HMI и программное обеспечение для автоматизации.',
    brandSlugs: ['siemens', 'schneider-electric', 'abb', 'rockwell-automation', 'mitsubishi-electric', 'omron', 'beckhoff', 'br', 'delta', 'panasonic', 'yokogawa', 'honeywell', 'wago', 'advantech'],
  },
  {
    name: 'Приводная техника',
    slug: 'privodnaya-tehnika',
    description: 'Частотные преобразователи, сервоприводы, сервомоторы, шаговые двигатели и системы управления движением для промышленной автоматизации.',
    brandSlugs: ['siemens', 'abb', 'schneider-electric', 'danfoss', 'yaskawa', 'lenze', 'sew-eurodrive', 'mitsubishi-electric', 'delta', 'omron', 'panasonic', 'bosch-rexroth', 'rockwell-automation'],
  },
  {
    name: 'Редукторы и механическая передача',
    slug: 'reduktory-i-mehanicheskaya-peredacha',
    description: 'Мотор-редукторы, червячные и планетарные редукторы, линейные направляющие, шарико-винтовые передачи, муфты и компоненты механических систем.',
    brandSlugs: ['sew-eurodrive', 'bosch-rexroth', 'lenze', 'festo', 'parker'],
  },
  {
    name: 'Пневматика и гидравлика',
    slug: 'pnevmatika-i-gidravlika',
    description: 'Пневмоцилиндры, гидроцилиндры, распределители, клапаны, фитинги, системы подготовки воздуха, гидростанции и вакуумная техника.',
    brandSlugs: ['festo', 'smc', 'parker', 'bosch-rexroth', 'emerson'],
  },
  {
    name: 'Датчики и измерительные приборы',
    slug: 'datchiki-i-izmeritelnye-pribory',
    description: 'Индуктивные, ёмкостные, оптические и ультразвуковые датчики, датчики давления, расхода, уровня и температуры, энкодеры, системы технического зрения и измерительное оборудование.',
    brandSlugs: ['ifm', 'sick', 'pepperl-fuchs', 'balluff', 'keyence', 'omron', 'endress-hauser', 'honeywell', 'yokogawa', 'fluke', 'national-instruments', 'siemens', 'schneider-electric'],
  },
  {
    name: 'Промышленные соединители и клеммы',
    slug: 'promyshlennye-soediniteli-i-klemmy',
    description: 'Клеммные блоки, промышленные разъёмы, кабельные вводы, кабель-каналы, маркировка и инструменты для электромонтажа.',
    brandSlugs: ['phoenix-contact', 'wago', 'weidmuller', 'legrand', 'harting'],
  },
  {
    name: 'Электротехника и коммутационное оборудование',
    slug: 'elektrotehnika-i-kommutacionnoe-oborudovanie',
    description: 'Автоматические выключатели, контакторы, пускатели, реле, УЗО, предохранители, распределительные устройства, щитовое оборудование и системы безопасности.',
    brandSlugs: ['abb', 'schneider-electric', 'siemens', 'eaton', 'hager', 'legrand', 'pilz', 'rittal'],
  },
  {
    name: 'Источники питания и ИБП',
    slug: 'istochniki-pitaniya-i-ibp',
    description: 'Импульсные и линейные блоки питания, источники бесперебойного питания (ИБП), DC/DC преобразователи, зарядные устройства и системы резервного электроснабжения.',
    brandSlugs: ['mean-well', 'delta-electronics', 'apc', 'phoenix-contact', 'eaton', 'emerson', 'wago', 'siemens', 'schneider-electric'],
  },
  {
    name: 'Серверы, СХД и сетевое оборудование',
    slug: 'servery-shd-i-setevoe-oborudovanie',
    description: 'Серверы, системы хранения данных, сетевые коммутаторы, маршрутизаторы, межсетевые экраны, точки доступа Wi-Fi и компоненты для ЦОД.',
    brandSlugs: ['dell', 'hpe', 'lenovo', 'supermicro', 'cisco', 'huawei', 'juniper', 'fortinet', 'palo-alto-networks', 'mikrotik', 'ubiquiti', 'h3c', 'intel', 'amd', 'nvidia', 'samsung', 'seagate', 'western-digital', 'micron', 'advantech'],
  },
  {
    name: 'Системы видеонаблюдения и безопасности',
    slug: 'sistemy-videonablyudeniya-i-bezopasnosti',
    description: 'IP-камеры, видеорегистраторы (NVR/DVR), PTZ-камеры, системы контроля и управления доступом (СКУД), домофоны, охранная сигнализация и программное обеспечение для видеоаналитики.',
    brandSlugs: ['hikvision', 'dahua', 'axis', 'honeywell-security', 'ubiquiti'],
  },
];

export function getCategoryBySlug(slug: string): CategoryData | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoriesForBrand(brandSlug: string): CategoryData[] {
  return CATEGORIES.filter((c) => c.brandSlugs.includes(brandSlug));
}

export const CATEGORY_COUNT = CATEGORIES.length;
