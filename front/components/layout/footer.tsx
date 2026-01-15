import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BRAND_CATEGORIES } from '@/data/brands';
import { SITE_CONTACTS } from '@/lib/site-contacts';

const FOOTER_LINKS = {
  catalog: [
    { label: 'Все товары', href: '/catalog' },
    { label: 'Бренды', href: '/brands' },
    { label: 'Новинки', href: '/catalog?sort=created_desc' },
  ],
  company: [
    { label: 'О компании', href: '/#about' },
    { label: 'Почему мы', href: '/#why-us' },
    { label: 'Контакты', href: '/contacts' },
  ],
  support: [
    { label: 'Оставить заявку', href: '/request' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Политика конфиденциальности', href: '/privacy' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/assets/ponatech-logo-rectangular.PNG"
                alt="Pona Tech"
                width={160}
                height={46}
                className="h-10 sm:h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-background/70 text-sm leading-relaxed max-w-sm mb-6">
              PONA TECH — международные поставки промышленного и ИТ-оборудования. Прямые закупки от 70+ мировых
              брендов.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={SITE_CONTACTS.email.mailto}
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <Mail className="h-4 w-4" />
                {SITE_CONTACTS.email.display}
              </a>
              <a
                href={`tel:${SITE_CONTACTS.phones.telegram.tel}`}
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>
                  {SITE_CONTACTS.phones.telegram.display} — {SITE_CONTACTS.phones.telegram.title}
                </span>
              </a>
              <a
                href={`tel:${SITE_CONTACTS.phones.office.tel}`}
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>
                  {SITE_CONTACTS.phones.office.display} — {SITE_CONTACTS.phones.office.title}
                </span>
              </a>
              <span className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="h-4 w-4" />
                <span className="flex flex-col">
                  {SITE_CONTACTS.address.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Каталог</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.catalog.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Компания</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Поддержка</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-background/20" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">© {currentYear} PONA TECH. Все права защищены.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-background/40">
              Работаем с {Object.keys(BRAND_CATEGORIES).length} категориями оборудования
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
