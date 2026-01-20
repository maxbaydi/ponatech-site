import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { SITE_CONTACTS } from '@/lib/site-contacts';

const PAGE_TITLE = 'Восстановление пароля';
const PAGE_DESCRIPTION =
  'Функция восстановления пароля через email пока недоступна. Мы поможем восстановить доступ вручную.';
const CONTACTS_TITLE = 'Свяжитесь с нами для восстановления доступа';
const BACK_TO_LOGIN_LABEL = 'Вернуться к входу';

const SUPPORT_CHANNELS = [
  { label: 'Email', value: SITE_CONTACTS.email.display, href: SITE_CONTACTS.email.mailto },
  {
    label: SITE_CONTACTS.phones.telegram.title,
    value: SITE_CONTACTS.phones.telegram.display,
    href: `tel:${SITE_CONTACTS.phones.telegram.tel}`,
  },
  {
    label: SITE_CONTACTS.phones.office.title,
    value: SITE_CONTACTS.phones.office.display,
    href: `tel:${SITE_CONTACTS.phones.office.tel}`,
  },
];

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-16">
        <div className="container-custom">
          <div className="max-w-2xl w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{PAGE_TITLE}</h1>
              <p className="text-muted-foreground">{PAGE_DESCRIPTION}</p>
            </div>

            <div className="space-y-6 text-sm sm:text-base">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">{CONTACTS_TITLE}</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {SUPPORT_CHANNELS.map((channel) => (
                    <li key={channel.label} className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-medium text-foreground">{channel.label}:</span>
                      <a href={channel.href} className="text-primary hover:underline">
                        {channel.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <div>
                <Button asChild variant="outline">
                  <Link href="/login">{BACK_TO_LOGIN_LABEL}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
