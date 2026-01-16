import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SITE_CONTACTS } from '@/lib/site-contacts';

const DATA_CATEGORIES = [
  'контактные данные: email, телефон',
  'данные профиля: имя, компания, должность (если указано)',
  'данные для запросов и заявок: содержание запроса, список оборудования, комментарии',
  'данные для поставки и документооборота: реквизиты, адрес доставки и получатель (если применимо)',
  'технические данные: IP-адрес, данные браузера, cookie, дата и время обращений',
];

const PROCESSING_PURPOSES = [
  'регистрация и обслуживание учетной записи, аутентификация пользователей',
  'обработка заявок на поставку и взаимодействие по запросам',
  'обратная связь, поддержка и информирование по статусу обращений',
  'исполнение договорных обязательств и соблюдение требований законодательства',
  'повышение качества сервиса, безопасность и предотвращение злоупотреблений',
];

const USER_RIGHTS = [
  'получать сведения о своих данных и способах их обработки',
  'уточнять, обновлять или удалять свои данные',
  'отзывать согласие на обработку данных (если это не противоречит закону)',
  'обращаться с вопросами и запросами по адресу электронной почты оператора',
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-16">
        <div className="container-custom">
          <div className="max-w-3xl w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Политика конфиденциальности</h1>
              <p className="text-muted-foreground">
                PONA TECH — китайская технологическая компания, работающая по прямым контрактам с производителями и
                официальными партнерами в Китае, Германии, США, Японии, Южной Корее, Швейцарии и других странах. Мы
                обеспечиваем международные поставки промышленного и ИТ-оборудования. Настоящая политика объясняет, какие
                данные мы собираем и как их используем.
              </p>
            </div>

            <div className="space-y-8 text-sm sm:text-base">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Общие положения</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Политика применяется ко всем пользователям сайта и сервисов PONA TECH. Регистрируясь и используя
                    сервис, вы подтверждаете согласие с условиями обработки персональных данных.
                  </p>
                  <p>
                    Мы обрабатываем персональные данные в соответствии с применимым законодательством и принимаем меры
                    для их защиты.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Оператор персональных данных</h2>
                <div className="rich-text text-muted-foreground">
                  <p>Оператор персональных данных — PONA TECH.</p>
                  <ul>
                    <li>
                      Email: <a href={SITE_CONTACTS.email.mailto}>{SITE_CONTACTS.email.display}</a>
                    </li>
                    <li>
                      Телефон (Telegram):{' '}
                      <a href={`tel:${SITE_CONTACTS.phones.telegram.tel}`}>{SITE_CONTACTS.phones.telegram.display}</a>
                    </li>
                    <li>
                      Телефон (офис):{' '}
                      <a href={`tel:${SITE_CONTACTS.phones.office.tel}`}>{SITE_CONTACTS.phones.office.display}</a>
                    </li>
                    <li>
                      Адрес:
                      <span className="block">
                        {SITE_CONTACTS.address.lines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Какие данные мы собираем</h2>
                <div className="rich-text text-muted-foreground">
                  <p>Мы обрабатываем данные, которые вы предоставляете при регистрации и обращениях:</p>
                  <ul>
                    {DATA_CATEGORIES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Цели обработки персональных данных</h2>
                <div className="rich-text text-muted-foreground">
                  <ul>
                    {PROCESSING_PURPOSES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. Правовые основания</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Мы обрабатываем персональные данные на основании вашего согласия, а также для исполнения договора и
                    выполнения требований законодательства.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Передача третьим лицам</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Мы не продаем персональные данные. Передача возможна только в объеме, необходимом для выполнения
                    ваших запросов и обязательств, например логистическим и сервисным партнерам, а также по требованиям
                    закона.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Хранение и защита данных</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Мы храним данные в течение срока, необходимого для целей обработки, или в течение сроков, требуемых
                    законом. Применяем организационные и технические меры для защиты данных от утечки и неправомерного
                    доступа.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">8. Права пользователя</h2>
                <div className="rich-text text-muted-foreground">
                  <ul>
                    {USER_RIGHTS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">9. Cookie и логирование</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Мы используем cookie и технические журналы для корректной работы сайта, поддержки сессий и улучшения
                    пользовательского опыта. Вы можете ограничить использование cookie в настройках браузера, но это
                    может повлиять на функциональность сервиса.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">10. Изменения политики</h2>
                <div className="rich-text text-muted-foreground">
                  <p>
                    Мы можем обновлять политику конфиденциальности. Актуальная версия всегда размещается на этой
                    странице.
                  </p>
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
