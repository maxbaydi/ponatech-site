export interface BrandData {
  name: string;
  slug: string;
  category: BrandCategory;
  country: string;
  description?: string;
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
  { name: 'Siemens', slug: 'siemens', category: 'industrial-automation', country: 'Германия', logo: `${LOGO_PATH}/siemens-logo-png_seeklogo-126288.webp` },
  { name: 'Schneider Electric', slug: 'schneider-electric', category: 'industrial-automation', country: 'Франция', logo: `${LOGO_PATH}/schneider-electric-logo-png_seeklogo-123510.webp` },
  { name: 'ABB', slug: 'abb', category: 'industrial-automation', country: 'Швейцария', logo: `${LOGO_PATH}/ABB-logo-6D64A214C8-seeklogo.com_400x400.webp` },
  { name: 'Rockwell Automation', slug: 'rockwell-automation', category: 'industrial-automation', country: 'США', description: 'Allen-Bradley', logo: `${LOGO_PATH}/rockwell-automation-logo-png_seeklogo-119341.webp` },
  { name: 'Mitsubishi Electric', slug: 'mitsubishi-electric', category: 'industrial-automation', country: 'Япония', logo: `${LOGO_PATH}/mitsubishi-electric.webp` },
  { name: 'Omron', slug: 'omron', category: 'industrial-automation', country: 'Япония', logo: `${LOGO_PATH}/omron.webp` },
  { name: 'Panasonic', slug: 'panasonic', category: 'industrial-automation', country: 'Япония' },
  { name: 'FANUC', slug: 'fanuc', category: 'industrial-automation', country: 'Япония', logo: `${LOGO_PATH}/fanuc-logo-EB41881AC6-seeklogo.com_400x400.webp` },
  { name: 'Yaskawa', slug: 'yaskawa', category: 'industrial-automation', country: 'Япония', logo: `${LOGO_PATH}/yaskawa-logo.webp` },
  { name: 'Delta', slug: 'delta', category: 'industrial-automation', country: 'Тайвань', logo: `${LOGO_PATH}/delta-electronics-logo-EE4D760E59-seeklogo.com_400x400.webp` },
  { name: 'Beckhoff', slug: 'beckhoff', category: 'industrial-automation', country: 'Германия', logo: `${LOGO_PATH}/beckhoff_wiki_pdf_400x400.webp` },
  { name: 'B&R', slug: 'br', category: 'industrial-automation', country: 'Австрия' },

  { name: 'Phoenix Contact', slug: 'phoenix-contact', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/phoenix-contact.webp` },
  { name: 'WAGO', slug: 'wago', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/Wago-logo.webp` },
  { name: 'Weidmüller', slug: 'weidmuller', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/weidmuller-logo.webp` },
  { name: 'Pilz', slug: 'pilz', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/pilz.webp` },
  { name: 'IFM', slug: 'ifm', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/ifm-logo-png_seeklogo-449732_400x400.webp` },
  { name: 'SICK', slug: 'sick', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/sick-optic-electronic-logo-png_seeklogo-126212.webp` },
  { name: 'Pepperl+Fuchs', slug: 'pepperl-fuchs', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/PepperlFuchs_blog.webp` },
  { name: 'Balluff', slug: 'balluff', category: 'industrial-components', country: 'Германия', logo: `${LOGO_PATH}/balluff-logo-png_seeklogo-387144_400x400.webp` },
  { name: 'Keyence', slug: 'keyence', category: 'industrial-components', country: 'Япония', logo: `${LOGO_PATH}/keyence-logo-png_seeklogo-78174_400x400.webp` },

  { name: 'Bosch Rexroth', slug: 'bosch-rexroth', category: 'drive-technology', country: 'Германия', logo: `${LOGO_PATH}/bosch-rexroth-logo-png_seeklogo-21528_400x400.webp` },
  { name: 'SEW-EURODRIVE', slug: 'sew-eurodrive', category: 'drive-technology', country: 'Германия', logo: `${LOGO_PATH}/Sew-Eurodrive-logo-E3992115A8-seeklogo.com_.webp` },
  { name: 'Danfoss', slug: 'danfoss', category: 'drive-technology', country: 'Дания', logo: `${LOGO_PATH}/danfoss-logo-png_seeklogo-38448_400x400.webp` },
  { name: 'Lenze', slug: 'lenze', category: 'drive-technology', country: 'Германия', logo: `${LOGO_PATH}/lenze.webp` },
  { name: 'Festo', slug: 'festo', category: 'drive-technology', country: 'Германия', logo: `${LOGO_PATH}/festo-logo-5362F1A251-seeklogo.com_400x400.webp` },
  { name: 'SMC', slug: 'smc', category: 'drive-technology', country: 'Япония' },
  { name: 'Parker', slug: 'parker', category: 'drive-technology', country: 'США' },

  { name: 'Eaton', slug: 'eaton', category: 'power-equipment', country: 'Ирландия', logo: `${LOGO_PATH}/eaton-logo-B09FD8CD00-seeklogo.com_400x400.webp` },
  { name: 'Emerson', slug: 'emerson', category: 'power-equipment', country: 'США', logo: `${LOGO_PATH}/emerson-electric-logo-png_seeklogo-47449_400x400.webp` },
  { name: 'Rittal', slug: 'rittal', category: 'power-equipment', country: 'Германия', logo: `${LOGO_PATH}/rittal.webp` },
  { name: 'Hager', slug: 'hager', category: 'power-equipment', country: 'Германия' },
  { name: 'Legrand', slug: 'legrand', category: 'power-equipment', country: 'Франция', logo: `${LOGO_PATH}/legrand-logo-png_seeklogo-83164_400x400.webp` },
  { name: 'Mean Well', slug: 'mean-well', category: 'power-equipment', country: 'Тайвань' },
  { name: 'Delta Electronics', slug: 'delta-electronics', category: 'power-equipment', country: 'Тайвань', logo: `${LOGO_PATH}/delta-electronics-logo-EE4D760E59-seeklogo.com_400x400.webp` },
  { name: 'APC', slug: 'apc', category: 'power-equipment', country: 'США', description: 'Schneider Electric', logo: `${LOGO_PATH}/apc-by-schneider-logo-8F55B2FD60-seeklogo.com_400x400.webp` },

  { name: 'Honeywell', slug: 'honeywell', category: 'measurement', country: 'США', logo: `${LOGO_PATH}/honeywell-logo-png_seeklogo-67766_400x400.webp` },
  { name: 'Endress+Hauser', slug: 'endress-hauser', category: 'measurement', country: 'Швейцария' },
  { name: 'Yokogawa', slug: 'yokogawa', category: 'measurement', country: 'Япония', logo: `${LOGO_PATH}/yokogawa-logo-CA17C03879-seeklogo.com_.webp` },
  { name: 'Fluke', slug: 'fluke', category: 'measurement', country: 'США', logo: `${LOGO_PATH}/fluke-logo-png_seeklogo-458958_400x400.webp` },
  { name: 'National Instruments', slug: 'national-instruments', category: 'measurement', country: 'США' },

  { name: 'Cisco', slug: 'cisco', category: 'network-equipment', country: 'США', logo: `${LOGO_PATH}/cisco-logo-png_seeklogo-273963_400x400.webp` },
  { name: 'Huawei', slug: 'huawei', category: 'network-equipment', country: 'Китай', logo: `${LOGO_PATH}/huawei-logo-png_seeklogo-68529_400x400.webp` },
  { name: 'H3C', slug: 'h3c', category: 'network-equipment', country: 'Китай' },
  { name: 'MikroTik', slug: 'mikrotik', category: 'network-equipment', country: 'Латвия' },
  { name: 'Ubiquiti', slug: 'ubiquiti', category: 'network-equipment', country: 'США' },
  { name: 'Fortinet', slug: 'fortinet', category: 'network-equipment', country: 'США' },
  { name: 'Palo Alto Networks', slug: 'palo-alto-networks', category: 'network-equipment', country: 'США' },
  { name: 'Juniper', slug: 'juniper', category: 'network-equipment', country: 'США' },

  { name: 'HPE', slug: 'hpe', category: 'it-equipment', country: 'США', description: 'Hewlett Packard Enterprise', logo: `${LOGO_PATH}/hewlett-packard-enterprise-logo-73E94D944D-seeklogo.com_400x400.webp` },
  { name: 'Dell', slug: 'dell', category: 'it-equipment', country: 'США', logo: `${LOGO_PATH}/dell-technologies-logo-png_seeklogo-381480_400x400.webp` },
  { name: 'Lenovo', slug: 'lenovo', category: 'it-equipment', country: 'Китай', logo: `${LOGO_PATH}/lenovo-logo-png_seeklogo-267847_400x400.webp` },
  { name: 'Supermicro', slug: 'supermicro', category: 'it-equipment', country: 'США', logo: `${LOGO_PATH}/supermicro-logo-9BA0E0BB79-seeklogo.com_.webp` },
  { name: 'Intel', slug: 'intel', category: 'it-equipment', country: 'США', logo: `${LOGO_PATH}/intel-logo-png_seeklogo-181977_400x400.webp` },
  { name: 'AMD', slug: 'amd', category: 'it-equipment', country: 'США' },
  { name: 'NVIDIA', slug: 'nvidia', category: 'it-equipment', country: 'США' },
  { name: 'Micron', slug: 'micron', category: 'it-equipment', country: 'США' },
  { name: 'Samsung', slug: 'samsung', category: 'it-equipment', country: 'Южная Корея' },
  { name: 'Seagate', slug: 'seagate', category: 'it-equipment', country: 'США', logo: `${LOGO_PATH}/seagate.webp` },
  { name: 'Western Digital', slug: 'western-digital', category: 'it-equipment', country: 'США' },
  { name: 'Advantech', slug: 'advantech', category: 'it-equipment', country: 'Тайвань', logo: `${LOGO_PATH}/advantech-logo-7EE7C75831-seeklogo.com_400x400.webp` },

  { name: 'Hikvision', slug: 'hikvision', category: 'security', country: 'Китай', logo: `${LOGO_PATH}/hikvision-logo-png_seeklogo-223929_400x400.webp` },
  { name: 'Dahua', slug: 'dahua', category: 'security', country: 'Китай' },
  { name: 'Axis', slug: 'axis', category: 'security', country: 'Швеция' },
  { name: 'Honeywell Security', slug: 'honeywell-security', category: 'security', country: 'США' },
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
