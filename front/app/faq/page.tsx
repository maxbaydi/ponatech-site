import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const PAGE_TITLE = 'Частые вопросы';
const PAGE_DESCRIPTION =
  'Собрали ответы на вопросы о поставках, оплате и работе с каталогом. Если нужного ответа нет, напишите нам.';
const SECTION_INDEX_OFFSET = 1;

type FaqItem = {
  title: string;
  description: string[];
  action?: { href: string; label: string };
};

const FAQ_ITEMS: FaqItem[] = [
  {
    title: 'Как оформить запрос на поставку?',
    description: [
      'Перейдите в форму запроса и опишите оборудование, которое нужно подобрать или поставить.',
      'Мы уточним детали, подготовим предложение и согласуем условия поставки.',
    ],
    action: { href: '/request', label: 'Оставить запрос' },
  },
  {
    title: 'Какие сроки поставки?',
    description: [
      'Срок зависит от наличия у производителя, логистики и требований к партии.',
      'После получения запроса мы сообщим ориентировочные сроки и этапы поставки.',
    ],
  },
  {
    title: 'Можно ли получить коммерческое предложение?',
    description: [
      'Да, подготовим КП после уточнения технических параметров и объема поставки.',
      'При необходимости добавим спецификацию, условия оплаты и доставки.',
    ],
  },
  {
    title: 'Как устроены оплата и документооборот?',
    description: [
      'Работаем по договору: оформляем инвойс, проводим официальный платёж в Китай, готовим упаковочный лист. При необходимости предоставляем услуги таможенного брокера.',
      'Формат оплаты зависит от условий контракта и согласовывается индивидуально.',
    ],
  },
  {
    title: 'Как быстро получить консультацию?',
    description: [
      'Свяжитесь с нами по контактам на сайте — ответим в рабочее время и поможем с подбором.',
    ],
    action: { href: '/contacts', label: 'Связаться с нами' },
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-16">
        <div className="container-custom">
          <div className="max-w-3xl w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{PAGE_TITLE}</h1>
              <p className="text-muted-foreground">{PAGE_DESCRIPTION}</p>
            </div>

            <div className="space-y-8 text-sm sm:text-base">
              {FAQ_ITEMS.map((item, index) => (
                <section key={item.title} className="space-y-3">
                  <h2 className="text-xl font-semibold">
                    {index + SECTION_INDEX_OFFSET}. {item.title}
                  </h2>
                  <div className="rich-text text-muted-foreground space-y-2">
                    {item.description.map((text) => (
                      <p key={text}>{text}</p>
                    ))}
                    {item.action && (
                      <Link href={item.action.href} className="text-primary hover:underline">
                        {item.action.label}
                      </Link>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
