import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SITE_CONTACTS } from '@/lib/site-contacts';

const SERVICE_NOTES = [
  'Информация на сайте носит справочный характер и не является публичной офертой.',
  'Цены, сроки и доступность товаров уточняются после обработки заявки.',
  'Окончательные условия фиксируются в коммерческом предложении и/или договоре.',
];

const USER_OBLIGATIONS = [
  'предоставлять достоверные данные при регистрации и обращениях',
  'использовать сервисы только в законных целях и не нарушать права третьих лиц',
  'не предпринимать попытки несанкционированного доступа или вмешательства в работу сайта',
  'сохранять конфиденциальность учетных данных и не передавать доступ третьим лицам',
];

const LIABILITY_LIMITS = [
  'перерывы в работе сайта по техническим или организационным причинам',
  'неточности, вызванные некорректными или неполными данными пользователя',
  'действия третьих лиц, включая производителей, перевозчиков и сервисных партнеров',
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-16">
        <div className="container-custom">
          <div className="max-w-3xl w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Условия использования</h1>
              <p className="text-muted-foreground">
                PONA TECH — китайская технологическая компания, работающая по прямым контрактам с производителями и
                официальными партнерами в Китае, Германии, США, Японии, Южной Корее, Швейцарии и других странах. Мы
                обеспечиваем международные поставки промышленного и ИТ-оборудования. Настоящие условия регулируют
                использование сайта и сервисов.
              </p>
            </div>

            <div className="space-y-8 text-sm sm:text-base">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Общие положения</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Используя сайт и регистрируясь, вы подтверждаете согласие с настоящими условиями. Если вы не согласны
                    с условиями, пожалуйста, не используйте сайт.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Назначение сайта и сервисов</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Сайт предназначен для информирования о поставках оборудования и приема заявок на подбор и поставку.
                  </p>
                  <ul>
                    {SERVICE_NOTES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Регистрация и учетная запись</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Для доступа к отдельным функциям может потребоваться регистрация. Вы несете ответственность за
                    достоверность данных, указанных при регистрации, и за сохранность учетных данных.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Обязанности пользователя</h2>
                <div className="rich-text text-muted-foreground">
                  <ul>
                    {USER_OBLIGATIONS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. Заявки и взаимодействие</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Отправляя заявку, вы соглашаетесь на получение ответов по указанным контактам. Мы можем запросить
                    дополнительную информацию для уточнения спецификаций, количества и сроков поставки.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Оплата и доставка</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Условия оплаты, поставки, логистики и документооборота определяются в коммерческом предложении и/или
                    договоре.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Интеллектуальная собственность</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Все материалы сайта, включая тексты, изображения и элементы дизайна, являются объектами охраны
                    авторского права и принадлежат PONA TECH или правообладателям. Использование материалов без
                    разрешения запрещено.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">8. Ограничение ответственности</h2>
                <div className="rich-text text-muted-foreground">
                  <p>Мы не несем ответственность за:</p>
                  <ul>
                    {LIABILITY_LIMITS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">9. Персональные данные</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Обработка персональных данных осуществляется в соответствии с{' '}
                    <Link href="/privacy">политикой конфиденциальности</Link>.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">10. Контакты и изменения условий</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    По вопросам использования сайта и условий обслуживания вы можете обратиться по адресу{' '}
                    <a href={SITE_CONTACTS.email.mailto}>{SITE_CONTACTS.email.display}</a> или по телефону{' '}
                    <a href={`tel:${SITE_CONTACTS.phones.office.tel}`}>{SITE_CONTACTS.phones.office.display}</a>.
                  </p>
                  <p>Мы вправе обновлять условия использования. Актуальная версия размещается на этой странице.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
