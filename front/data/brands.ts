export interface BrandData {
  name: string;
  slug: string;
  category: BrandCategory;
  country: string;
  description?: string;
  about?: string;
  logo?: string;
}

export type BrandCategory =
  | 'industrial-automation'
  | 'industrial-components'
  | 'drive-technology'
  | 'it-equipment'
  | 'security'
  | 'measurement'
  | 'power-equipment'
  | 'network-equipment';

export const BRAND_CATEGORIES: Record<BrandCategory, string> = {
  'industrial-automation': 'Промышленная автоматизация',
  'industrial-components': 'Промышленные компоненты',
  'drive-technology': 'Приводная техника',
  'it-equipment': 'ИТ-оборудование',
  security: 'Системы безопасности',
  measurement: 'КИПиА и измерительная техника',
  'power-equipment': 'Силовое оборудование',
  'network-equipment': 'Сетевое оборудование',
};

const LOGO_PATH = '/assets/brands';

export const BRANDS: BrandData[] = [
  {
    name: 'Siemens',
    slug: 'siemens',
    category: 'industrial-automation',
    country: 'Германия',
    logo: `${LOGO_PATH}/siemens-logo-png_seeklogo-126288.webp`,
    about: 'Siemens AG — немецкий технологический концерн, основанный в 1847 году. Один из мировых лидеров в области промышленной автоматизации, электрификации и цифровизации. Производит ПЛК серии SIMATIC, приводную технику SINAMICS, системы управления SCADA и комплексные решения для умного производства.',
  },
  {
    name: 'Schneider Electric',
    slug: 'schneider-electric',
    category: 'industrial-automation',
    country: 'Франция',
    logo: `${LOGO_PATH}/schneider-electric-logo-png_seeklogo-123510.webp`,
    about: 'Schneider Electric — французская транснациональная корпорация, основанная в 1836 году. Специализируется на управлении электроэнергией, автоматизации зданий и промышленности. Выпускает контроллеры Modicon, системы распределения электроэнергии, ИБП и решения для центров обработки данных.',
  },
  {
    name: 'ABB',
    slug: 'abb',
    category: 'industrial-automation',
    country: 'Швейцария',
    logo: `${LOGO_PATH}/ABB-logo-6D64A214C8-seeklogo.com_400x400.webp`,
    about: 'ABB Ltd — швейцарско-шведская корпорация, образованная в 1988 году слиянием ASEA и Brown Boveri. Мировой лидер в области электрооборудования, робототехники и промышленной автоматизации. Производит частотные преобразователи, промышленных роботов, низковольтную аппаратуру и системы управления.',
  },
  {
    name: 'Rockwell Automation',
    slug: 'rockwell-automation',
    category: 'industrial-automation',
    country: 'США',
    description: 'Allen-Bradley',
    logo: `${LOGO_PATH}/rockwell-automation-logo-png_seeklogo-119341.webp`,
    about: 'Rockwell Automation — американская компания, крупнейший в мире производитель систем промышленной автоматизации. Выпускает оборудование под брендом Allen-Bradley: контроллеры ControlLogix/CompactLogix, панели операторов PanelView, частотные преобразователи PowerFlex и программное обеспечение FactoryTalk.',
  },
  {
    name: 'Mitsubishi Electric',
    slug: 'mitsubishi-electric',
    category: 'industrial-automation',
    country: 'Япония',
    logo: `${LOGO_PATH}/mitsubishi-electric.webp`,
    about: 'Mitsubishi Electric Corporation — японский производитель электрического и электронного оборудования, основанный в 1921 году. В области автоматизации выпускает контроллеры серии MELSEC, сервоприводы, ЧПУ-системы, промышленных роботов и комплексные решения e-F@ctory для умного производства.',
  },
  {
    name: 'Omron',
    slug: 'omron',
    category: 'industrial-automation',
    country: 'Япония',
    logo: `${LOGO_PATH}/omron.webp`,
    about: 'Omron Corporation — японская корпорация, основанная в 1933 году. Специализируется на автоматизации производства, электронных компонентах и медицинском оборудовании. Производит контроллеры Sysmac, датчики, реле, системы технического зрения и коллаборативных роботов.',
  },
  {
    name: 'Panasonic',
    slug: 'panasonic',
    category: 'industrial-automation',
    country: 'Япония',
    about: 'Panasonic Corporation — японский многопрофильный концерн, основанный в 1918 году. В промышленной автоматизации производит сервоприводы MINAS, контроллеры FP, датчики, сварочные аппараты и оборудование для монтажа электронных компонентов.',
  },
  {
    name: 'FANUC',
    slug: 'fanuc',
    category: 'industrial-automation',
    country: 'Япония',
    logo: `${LOGO_PATH}/fanuc-logo-EB41881AC6-seeklogo.com_400x400.webp`,
    about: 'FANUC Corporation — японский производитель промышленной автоматизации, основанный в 1956 году. Мировой лидер в производстве промышленных роботов, систем ЧПУ и обрабатывающих центров. Роботы FANUC используются в автомобилестроении, электронике и других отраслях.',
  },
  {
    name: 'Yaskawa',
    slug: 'yaskawa',
    category: 'industrial-automation',
    country: 'Япония',
    logo: `${LOGO_PATH}/yaskawa-logo.webp`,
    about: 'Yaskawa Electric Corporation — японская компания, основанная в 1915 году. Один из крупнейших в мире производителей сервоприводов, частотных преобразователей и промышленных роботов серии Motoman. Пионер технологий мехатроники и робототехники.',
  },
  {
    name: 'Delta',
    slug: 'delta',
    category: 'industrial-automation',
    country: 'Тайвань',
    logo: `${LOGO_PATH}/delta-electronics-logo-EE4D760E59-seeklogo.com_400x400.webp`,
    about: 'Delta Electronics — тайваньская корпорация, основанная в 1971 году. Производит решения для промышленной автоматизации: ПЛК, HMI-панели, сервоприводы, частотные преобразователи, а также источники питания и системы управления зданиями.',
  },
  {
    name: 'Beckhoff',
    slug: 'beckhoff',
    category: 'industrial-automation',
    country: 'Германия',
    logo: `${LOGO_PATH}/beckhoff_wiki_pdf_400x400.webp`,
    about: 'Beckhoff Automation — немецкая компания, основанная в 1980 году. Пионер технологии PC-based Control и разработчик протокола EtherCAT. Производит промышленные ПК, контроллеры TwinCAT, модули ввода-вывода и линейные сервоприводы.',
  },
  {
    name: 'B&R',
    slug: 'br',
    category: 'industrial-automation',
    country: 'Австрия',
    about: 'B&R Industrial Automation — австрийская компания, с 2017 года часть ABB. Специализируется на инновационных решениях для автоматизации машин и процессов. Выпускает контроллеры, сервоприводы ACOPOS, системы визуализации и интегрированные транспортные системы.',
  },

  {
    name: 'Phoenix Contact',
    slug: 'phoenix-contact',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/phoenix-contact.webp`,
    about: 'Phoenix Contact — немецкая компания, основанная в 1923 году. Мировой лидер в производстве промышленных соединителей, клеммных блоков, источников питания и компонентов для автоматизации. Разработчик инновационных решений для промышленной связи и защиты от перенапряжений.',
  },
  {
    name: 'WAGO',
    slug: 'wago',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/Wago-logo.webp`,
    about: 'WAGO — немецкий производитель электротехнических компонентов, основанный в 1951 году. Изобретатель пружинной клеммной технологии CAGE CLAMP. Выпускает клеммные соединители, модульные контроллеры, интерфейсные модули и решения для автоматизации.',
  },
  {
    name: 'Weidmüller',
    slug: 'weidmuller',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/weidmuller-logo.webp`,
    about: 'Weidmüller — немецкая компания, основанная в 1850 году. Специализируется на решениях для промышленных электрических соединений: клеммные блоки, разъёмы, корпуса, инструменты для монтажа и решения для Industrial IoT.',
  },
  {
    name: 'Pilz',
    slug: 'pilz',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/pilz.webp`,
    about: 'Pilz GmbH — немецкая компания, основанная в 1948 году. Мировой лидер в области безопасной автоматизации. Производит реле и контроллеры безопасности, датчики безопасности, световые барьеры и предоставляет услуги по функциональной безопасности.',
  },
  {
    name: 'IFM',
    slug: 'ifm',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/ifm-logo-png_seeklogo-449732_400x400.webp`,
    about: 'ifm electronic — немецкий производитель датчиков и систем автоматизации, основанный в 1969 году. Выпускает индуктивные, ёмкостные, оптические датчики, датчики давления, расхода и вибрации, а также системы технического зрения и IIoT-платформы.',
  },
  {
    name: 'SICK',
    slug: 'sick',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/sick-optic-electronic-logo-png_seeklogo-126212.webp`,
    about: 'SICK AG — немецкий производитель датчиков и сенсорных решений, основанный в 1946 году. Один из мировых лидеров в области промышленной сенсорики: фотоэлектрические датчики, энкодеры, системы безопасности, 2D/3D-сканеры и решения для логистики.',
  },
  {
    name: 'Pepperl+Fuchs',
    slug: 'pepperl-fuchs',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/PepperlFuchs_blog.webp`,
    about: 'Pepperl+Fuchs — немецкая компания, основанная в 1945 году. Специализируется на промышленных датчиках и решениях для взрывозащищённых зон. Производит индуктивные и ультразвуковые датчики, энкодеры, системы AS-Interface и барьеры искробезопасности.',
  },
  {
    name: 'Balluff',
    slug: 'balluff',
    category: 'industrial-components',
    country: 'Германия',
    logo: `${LOGO_PATH}/balluff-logo-png_seeklogo-387144_400x400.webp`,
    about: 'Balluff GmbH — немецкая семейная компания, основанная в 1921 году. Производит датчики, системы идентификации, сетевые и соединительные решения для промышленной автоматизации. Разработчик систем RFID и IO-Link.',
  },
  {
    name: 'Keyence',
    slug: 'keyence',
    category: 'industrial-components',
    country: 'Япония',
    logo: `${LOGO_PATH}/keyence-logo-png_seeklogo-78174_400x400.webp`,
    about: 'Keyence Corporation — японская компания, основанная в 1974 году. Разрабатывает и производит датчики, системы машинного зрения, измерительные приборы, лазерные маркеры и микроскопы. Известна прямыми продажами и высоким уровнем инноваций.',
  },

  {
    name: 'Bosch Rexroth',
    slug: 'bosch-rexroth',
    category: 'drive-technology',
    country: 'Германия',
    logo: `${LOGO_PATH}/bosch-rexroth-logo-png_seeklogo-21528_400x400.webp`,
    about: 'Bosch Rexroth — подразделение Bosch Group, один из мировых лидеров в области приводной техники и систем управления. Производит гидравлику, пневматику, линейную технику, электроприводы и системы для мобильных машин и промышленных приложений.',
  },
  {
    name: 'SEW-EURODRIVE',
    slug: 'sew-eurodrive',
    category: 'drive-technology',
    country: 'Германия',
    logo: `${LOGO_PATH}/Sew-Eurodrive-logo-E3992115A8-seeklogo.com_.webp`,
    about: 'SEW-EURODRIVE — немецкий производитель приводной техники, основанный в 1931 году. Мировой лидер в производстве мотор-редукторов, частотных преобразователей и децентрализованных приводных систем. Решения используются в конвейерных системах, упаковке и логистике.',
  },
  {
    name: 'Danfoss',
    slug: 'danfoss',
    category: 'drive-technology',
    country: 'Дания',
    logo: `${LOGO_PATH}/danfoss-logo-png_seeklogo-38448_400x400.webp`,
    about: 'Danfoss — датская инженерная компания, основанная в 1933 году. Производит частотные преобразователи серии VLT и VACON, гидравлику, компрессоры и компоненты для холодильных систем. Ориентирована на энергоэффективные решения.',
  },
  {
    name: 'Lenze',
    slug: 'lenze',
    category: 'drive-technology',
    country: 'Германия',
    logo: `${LOGO_PATH}/lenze.webp`,
    about: 'Lenze SE — немецкий производитель приводной техники, основанный в 1947 году. Специализируется на автоматизации движения: сервоприводы, контроллеры, редукторы, частотные преобразователи и программное обеспечение для машиностроения.',
  },
  {
    name: 'Festo',
    slug: 'festo',
    category: 'drive-technology',
    country: 'Германия',
    logo: `${LOGO_PATH}/festo-logo-5362F1A251-seeklogo.com_400x400.webp`,
    about: 'Festo — немецкая компания, основанная в 1925 году. Мировой лидер в области пневматики и электроавтоматики. Производит пневмоцилиндры, клапаны, приводы, захваты и системы для автоматизации производства. Известна образовательными решениями.',
  },
  {
    name: 'SMC',
    slug: 'smc',
    category: 'drive-technology',
    country: 'Япония',
    about: 'SMC Corporation — японская компания, основанная в 1959 году. Крупнейший в мире производитель пневматического оборудования. Выпускает цилиндры, клапаны, фитинги, системы подготовки воздуха, вакуумное оборудование и термоконтроллеры.',
  },
  {
    name: 'Parker',
    slug: 'parker',
    category: 'drive-technology',
    country: 'США',
    about: 'Parker Hannifin — американская корпорация, основанная в 1917 году. Мировой лидер в технологиях движения и управления. Производит гидравлические и пневматические системы, фильтры, уплотнения, электромеханические приводы и решения для аэрокосмической отрасли.',
  },

  {
    name: 'Eaton',
    slug: 'eaton',
    category: 'power-equipment',
    country: 'Ирландия',
    logo: `${LOGO_PATH}/eaton-logo-B09FD8CD00-seeklogo.com_400x400.webp`,
    about: 'Eaton Corporation — глобальная компания по управлению электроэнергией, основанная в 1911 году. Производит автоматические выключатели, УЗО, контакторы, ИБП и распределительное оборудование. Также работает в области гидравлики и аэрокосмических систем.',
  },
  {
    name: 'Emerson',
    slug: 'emerson',
    category: 'power-equipment',
    country: 'США',
    logo: `${LOGO_PATH}/emerson-electric-logo-png_seeklogo-47449_400x400.webp`,
    about: 'Emerson Electric — американская технологическая корпорация, основанная в 1890 году. Специализируется на автоматизации процессов, климатическом оборудовании и инструментах. Производит системы управления DeltaV, клапаны Fisher и измерительные приборы Rosemount.',
  },
  {
    name: 'Rittal',
    slug: 'rittal',
    category: 'power-equipment',
    country: 'Германия',
    logo: `${LOGO_PATH}/rittal.webp`,
    about: 'Rittal — немецкая компания, основанная в 1961 году. Мировой лидер в производстве промышленных и IT-шкафов, климатических систем и инфраструктуры для ЦОД. Часть Friedhelm Loh Group, работает в связке с EPLAN и Cideon.',
  },
  {
    name: 'Hager',
    slug: 'hager',
    category: 'power-equipment',
    country: 'Германия',
    about: 'Hager Group — немецкая семейная компания, основанная в 1955 году. Специализируется на электрораспределительном оборудовании: модульная аппаратура, щитовое оборудование, кабельные системы и решения для умного дома.',
  },
  {
    name: 'Legrand',
    slug: 'legrand',
    category: 'power-equipment',
    country: 'Франция',
    logo: `${LOGO_PATH}/legrand-logo-png_seeklogo-83164_400x400.webp`,
    about: 'Legrand — французская компания, основанная в 1865 году. Мировой специалист в электрической и цифровой инфраструктуре зданий. Производит розетки, выключатели, кабельные каналы, UPS и решения для дата-центров.',
  },
  {
    name: 'Mean Well',
    slug: 'mean-well',
    category: 'power-equipment',
    country: 'Тайвань',
    about: 'Mean Well — тайваньский производитель источников питания, основанный в 1982 году. Один из крупнейших в мире поставщиков стандартных блоков питания. Выпускает AC/DC и DC/DC преобразователи, LED-драйверы и зарядные устройства.',
  },
  {
    name: 'Delta Electronics',
    slug: 'delta-electronics',
    category: 'power-equipment',
    country: 'Тайвань',
    logo: `${LOGO_PATH}/delta-electronics-logo-EE4D760E59-seeklogo.com_400x400.webp`,
    about: 'Delta Electronics — тайваньская корпорация, основанная в 1971 году. Мировой лидер в силовой электронике и энергоменеджменте. Производит ИБП, источники питания, системы охлаждения для ЦОД и решения для электромобильной инфраструктуры.',
  },
  {
    name: 'APC',
    slug: 'apc',
    category: 'power-equipment',
    country: 'США',
    description: 'Schneider Electric',
    logo: `${LOGO_PATH}/apc-by-schneider-logo-8F55B2FD60-seeklogo.com_400x400.webp`,
    about: 'APC by Schneider Electric — американский бренд, основанный в 1981 году. Мировой лидер в производстве ИБП для дома, офиса и дата-центров. Выпускает линейки Back-UPS, Smart-UPS и Symmetra, а также PDU и системы охлаждения.',
  },

  {
    name: 'Honeywell',
    slug: 'honeywell',
    category: 'measurement',
    country: 'США',
    logo: `${LOGO_PATH}/honeywell-logo-png_seeklogo-67766_400x400.webp`,
    about: 'Honeywell International — американский многоотраслевой конгломерат, основанный в 1906 году. В области КИПиА производит датчики, контроллеры, системы автоматизации зданий и процессов. Также работает в аэрокосмической и оборонной сферах.',
  },
  {
    name: 'Endress+Hauser',
    slug: 'endress-hauser',
    category: 'measurement',
    country: 'Швейцария',
    about: 'Endress+Hauser — швейцарская семейная компания, основанная в 1953 году. Мировой лидер в измерительной технике: датчики уровня, расхода, давления, температуры и аналитические приборы для химической, нефтегазовой и пищевой промышленности.',
  },
  {
    name: 'Yokogawa',
    slug: 'yokogawa',
    category: 'measurement',
    country: 'Япония',
    logo: `${LOGO_PATH}/yokogawa-logo-CA17C03879-seeklogo.com_.webp`,
    about: 'Yokogawa Electric — японская компания, основанная в 1915 году. Специализируется на системах управления процессами и измерительном оборудовании. Производит DCS-системы CENTUM, полевые приборы и решения для автоматизации непрерывных производств.',
  },
  {
    name: 'Fluke',
    slug: 'fluke',
    category: 'measurement',
    country: 'США',
    logo: `${LOGO_PATH}/fluke-logo-png_seeklogo-458958_400x400.webp`,
    about: 'Fluke Corporation — американская компания, основанная в 1948 году. Мировой лидер в производстве портативных измерительных приборов: мультиметры, осциллографы, тепловизоры, калибраторы и приборы для диагностики электрооборудования.',
  },
  {
    name: 'National Instruments',
    slug: 'national-instruments',
    category: 'measurement',
    country: 'США',
    about: 'National Instruments (NI) — американская компания, основанная в 1976 году. Производит системы автоматизированного тестирования, сбора данных и виртуальных приборов. Разработчик платформы LabVIEW и модульного оборудования PXI.',
  },

  {
    name: 'Cisco',
    slug: 'cisco',
    category: 'it-equipment',
    country: 'США',
    logo: `${LOGO_PATH}/cisco-logo-png_seeklogo-273963_400x400.webp`,
    about: 'Cisco Systems — американская корпорация, основанная в 1984 году. Мировой лидер в сетевых технологиях. Производит маршрутизаторы, коммутаторы, точки доступа Wi-Fi, системы унифицированных коммуникаций и решения для кибербезопасности.',
  },
  {
    name: 'Huawei',
    slug: 'huawei',
    category: 'it-equipment',
    country: 'Китай',
    logo: `${LOGO_PATH}/huawei-logo-png_seeklogo-68529_400x400.webp`,
    about: 'Huawei Technologies — китайская телекоммуникационная компания, основанная в 1987 году. Производит сетевое оборудование, серверы, системы хранения данных, смартфоны и решения для развёртывания сетей 5G.',
  },
  {
    name: 'H3C',
    slug: 'h3c',
    category: 'network-equipment',
    country: 'Китай',
    about: 'H3C (New H3C Technologies) — китайская компания, выделенная из совместного предприятия Huawei и 3Com. Производит коммутаторы, маршрутизаторы, точки доступа, серверы и решения для облачной инфраструктуры.',
  },
  {
    name: 'MikroTik',
    slug: 'mikrotik',
    category: 'network-equipment',
    country: 'Латвия',
    about: 'MikroTik — латвийская компания, основанная в 1996 году. Производит маршрутизаторы и коммутаторы под управлением RouterOS. Популярна среди провайдеров и системных администраторов благодаря гибкости настроек и доступной цене.',
  },
  {
    name: 'Ubiquiti',
    slug: 'ubiquiti',
    category: 'network-equipment',
    country: 'США',
    about: 'Ubiquiti Inc. — американская компания, основанная в 2005 году. Производит сетевое оборудование для корпоративных и домашних сетей: системы UniFi, точки доступа, коммутаторы, камеры видеонаблюдения и решения для провайдеров.',
  },
  {
    name: 'Fortinet',
    slug: 'fortinet',
    category: 'network-equipment',
    country: 'США',
    about: 'Fortinet — американская компания по кибербезопасности, основанная в 2000 году. Производит межсетевые экраны FortiGate, решения NGFW, системы обнаружения вторжений, VPN и комплексную платформу Security Fabric.',
  },
  {
    name: 'Palo Alto Networks',
    slug: 'palo-alto-networks',
    category: 'network-equipment',
    country: 'США',
    about: 'Palo Alto Networks — американская компания, основанная в 2005 году. Мировой лидер в области сетевой безопасности. Производит межсетевые экраны нового поколения, облачные решения Prisma и платформу для защиты конечных точек.',
  },
  {
    name: 'Juniper',
    slug: 'juniper',
    category: 'network-equipment',
    country: 'США',
    about: 'Juniper Networks — американская компания, основанная в 1996 году. Производит высокопроизводительное сетевое оборудование: маршрутизаторы, коммутаторы, решения для безопасности и SD-WAN. Операционная система Junos используется на всех устройствах.',
  },

  {
    name: 'HPE',
    slug: 'hpe',
    category: 'it-equipment',
    country: 'США',
    description: 'Hewlett Packard Enterprise',
    logo: `${LOGO_PATH}/hewlett-packard-enterprise-logo-73E94D944D-seeklogo.com_400x400.webp`,
    about: 'Hewlett Packard Enterprise — американская корпорация, выделенная из HP в 2015 году. Специализируется на корпоративных IT-решениях: серверы ProLiant, системы хранения, сетевое оборудование Aruba и гиперконвергентные системы.',
  },
  {
    name: 'Dell',
    slug: 'dell',
    category: 'it-equipment',
    country: 'США',
    logo: `${LOGO_PATH}/dell-technologies-logo-png_seeklogo-381480_400x400.webp`,
    about: 'Dell Technologies — американская корпорация, основанная в 1984 году. Один из крупнейших производителей серверов, систем хранения данных, рабочих станций и ноутбуков. Включает бренды Dell EMC, VMware и другие.',
  },
  {
    name: 'Lenovo',
    slug: 'lenovo',
    category: 'it-equipment',
    country: 'Китай',
    logo: `${LOGO_PATH}/lenovo-logo-png_seeklogo-267847_400x400.webp`,
    about: 'Lenovo Group — китайская транснациональная корпорация, основанная в 1984 году. Крупнейший в мире производитель ПК. Выпускает серверы ThinkSystem, рабочие станции, ноутбуки ThinkPad и решения для ЦОД.',
  },
  {
    name: 'Supermicro',
    slug: 'supermicro',
    category: 'it-equipment',
    country: 'США',
    logo: `${LOGO_PATH}/supermicro-logo-9BA0E0BB79-seeklogo.com_.webp`,
    about: 'Super Micro Computer — американская компания, основанная в 1993 году. Производит серверы, системы хранения данных, серверные материнские платы и решения для ЦОД. Специализируется на высокопроизводительных и энергоэффективных системах.',
  },
  {
    name: 'Intel',
    slug: 'intel',
    category: 'it-equipment',
    country: 'США',
    logo: `${LOGO_PATH}/intel-logo-png_seeklogo-181977_400x400.webp`,
    about: 'Intel Corporation — американская корпорация, основанная в 1968 году. Крупнейший в мире производитель микропроцессоров. Выпускает процессоры Xeon для серверов, чипсеты, сетевые контроллеры, SSD и ускорители для ИИ.',
  },
  {
    name: 'AMD',
    slug: 'amd',
    category: 'it-equipment',
    country: 'США',
    about: 'Advanced Micro Devices — американская компания, основанная в 1969 году. Производит процессоры Ryzen и EPYC, графические процессоры Radeon и ускорители для ЦОД. Основной конкурент Intel и NVIDIA.',
  },
  {
    name: 'NVIDIA',
    slug: 'nvidia',
    category: 'it-equipment',
    country: 'США',
    about: 'NVIDIA Corporation — американская компания, основанная в 1993 году. Мировой лидер в производстве графических процессоров. Выпускает GPU GeForce для игр, профессиональные карты Quadro, ускорители для ИИ и HPC, а также платформу CUDA.',
  },
  {
    name: 'Micron',
    slug: 'micron',
    category: 'it-equipment',
    country: 'США',
    about: 'Micron Technology — американская компания, основанная в 1978 году. Один из крупнейших в мире производителей памяти: DRAM, NAND Flash, SSD. Выпускает продукцию под брендом Crucial для потребительского рынка.',
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    category: 'it-equipment',
    country: 'Южная Корея',
    about: 'Samsung Electronics — южнокорейский конгломерат, основанный в 1969 году. Мировой лидер в производстве полупроводников, памяти и дисплеев. Выпускает SSD, серверную память, смартфоны и бытовую электронику.',
  },
  {
    name: 'Seagate',
    slug: 'seagate',
    category: 'it-equipment',
    country: 'США',
    logo: `${LOGO_PATH}/seagate.webp`,
    about: 'Seagate Technology — американская компания, основанная в 1978 году. Один из крупнейших производителей жёстких дисков. Выпускает HDD для корпоративных серверов, NAS, систем видеонаблюдения и потребительского рынка.',
  },
  {
    name: 'Western Digital',
    slug: 'western-digital',
    category: 'it-equipment',
    country: 'США',
    about: 'Western Digital — американская компания, основанная в 1970 году. Крупнейший производитель накопителей данных. Выпускает HDD и SSD под брендами WD, SanDisk и HGST для корпоративного и потребительского рынка.',
  },
  {
    name: 'Advantech',
    slug: 'advantech',
    category: 'it-equipment',
    country: 'Тайвань',
    logo: `${LOGO_PATH}/advantech-logo-7EE7C75831-seeklogo.com_400x400.webp`,
    about: 'Advantech — тайваньская компания, основанная в 1983 году. Мировой лидер в промышленных компьютерах и встраиваемых системах. Производит промышленные ПК, панельные компьютеры, модули ввода-вывода и IoT-шлюзы.',
  },

  {
    name: 'Hikvision',
    slug: 'hikvision',
    category: 'security',
    country: 'Китай',
    logo: `${LOGO_PATH}/hikvision-logo-png_seeklogo-223929_400x400.webp`,
    about: 'Hikvision — китайская компания, основанная в 2001 году. Мировой лидер в производстве систем видеонаблюдения. Выпускает IP-камеры, видеорегистраторы, системы СКУД и решения на базе искусственного интеллекта для безопасности.',
  },
  {
    name: 'Dahua',
    slug: 'dahua',
    category: 'security',
    country: 'Китай',
    about: 'Dahua Technology — китайская компания, основанная в 2001 году. Второй по величине производитель систем видеонаблюдения в мире. Производит IP-камеры, PTZ-камеры, видеорегистраторы, домофоны и системы контроля доступа.',
  },
  {
    name: 'Axis',
    slug: 'axis',
    category: 'security',
    country: 'Швеция',
    about: 'Axis Communications — шведская компания, основанная в 1984 году. Пионер и лидер в области сетевых камер видеонаблюдения. Производит IP-камеры, видеоэнкодеры, сетевые динамики и программное обеспечение для видеоаналитики.',
  },
  {
    name: 'Honeywell Security',
    slug: 'honeywell-security',
    category: 'security',
    country: 'США',
    about: 'Honeywell Security — подразделение Honeywell, специализирующееся на системах безопасности. Производит охранно-пожарные сигнализации, системы контроля доступа, видеонаблюдение и интегрированные платформы управления безопасностью.',
  },
];

export const FEATURED_BRANDS = BRANDS.filter((b) =>
  ['siemens', 'abb', 'schneider-electric', 'cisco', 'dell', 'nvidia', 'hikvision', 'omron'].includes(b.slug)
);

export function getBrandsByCategory(category: BrandCategory): BrandData[] {
  return BRANDS.filter((b) => b.category === category);
}

export function getBrandBySlug(slug: string): BrandData | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export const BRAND_COUNT = BRANDS.length;
