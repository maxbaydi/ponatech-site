"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MessageCircle, ArrowRight, HelpCircle } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PAGE_TITLE = "Частые вопросы";
const PAGE_DESCRIPTION =
  "Мы собрали ответы на самые популярные вопросы о работе с нами, поставках и оплате. Если вы не нашли нужной информации, свяжитесь с нами.";

type FaqItem = {
  id: string;
  title: string;
  description: string[];
  action?: { href: string; label: string };
  category?: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "item-1",
    title: "Как оформить запрос на поставку?",
    description: [
      "Перейдите в форму запроса и опишите оборудование, которое нужно подобрать или поставить.",
      "Мы уточним детали, подготовим предложение и согласуем условия поставки.",
    ],
    action: { href: "/request", label: "Оставить запрос" },
    category: "Заказы",
  },
  {
    id: "item-2",
    title: "Какие сроки поставки?",
    description: [
      "Срок зависит от наличия у производителя, логистики и требований к партии.",
      "После получения запроса мы сообщим ориентировочные сроки и этапы поставки.",
    ],
    category: "Доставка",
  },
  {
    id: "item-3",
    title: "Можно ли получить коммерческое предложение?",
    description: [
      "Да, подготовим КП после уточнения технических параметров и объема поставки.",
      "При необходимости добавим спецификацию, условия оплаты и доставки.",
    ],
    category: "Документы",
  },
  {
    id: "item-4",
    title: "Как устроены оплата и документооборот?",
    description: [
      "Работаем по договору: оформляем инвойс, проводим официальный платёж в Китай, готовим упаковочный лист. При необходимости предоставляем услуги таможенного брокера.",
      "Формат оплаты зависит от условий контракта и согласовывается индивидуально.",
    ],
    category: "Оплата",
  },
  {
    id: "item-5",
    title: "Как быстро получить консультацию?",
    description: [
      "Свяжитесь с нами по контактам на сайте — ответим в рабочее время и поможем с подбором.",
    ],
    action: { href: "/contacts", label: "Связаться с нами" },
    category: "Поддержка",
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = FAQ_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.some((desc) =>
        desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-16 pb-12 lg:pt-24 lg:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
          
          <div className="container-custom relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
                  <HelpCircle className="mr-2 h-3.5 w-3.5" />
                  <span>База знаний</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {PAGE_TITLE}
                </h1>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  {PAGE_DESCRIPTION}
                </p>

                <div className="relative max-w-lg mx-auto">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Поиск по вопросам..."
                    className="pl-10 h-12 text-base shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20 transition-all hover:border-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 lg:py-16">
          <div className="container-custom max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {filteredItems.length > 0 ? (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {filteredItems.map((item, index) => (
                        <AccordionItem 
                          key={item.id} 
                          value={item.id}
                          className={cn(
                            "px-6 py-2 transition-colors hover:bg-muted/30",
                            index === filteredItems.length - 1 ? "border-b-0" : ""
                          )}
                        >
                          <AccordionTrigger className="text-base sm:text-lg font-medium py-5 hover:no-underline">
                            <span className="text-left">{item.title}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                            <div className="space-y-4">
                              {item.description.map((text, i) => (
                                <p key={i}>{text}</p>
                              ))}
                              {item.action && (
                                <div className="pt-2">
                                  <Button asChild variant="outline" size="sm" className="group">
                                    <Link href={item.action.href}>
                                      {item.action.label}
                                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Попробуйте изменить запрос или свяжитесь с нами напрямую.
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-4 text-primary"
                    onClick={() => setSearchQuery("")}
                  >
                    Сбросить поиск
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16"
            >
              <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-lg">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-background-position" />
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />
                
                <CardContent className="p-8 sm:p-10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                  <div className="space-y-2 max-w-xl">
                    <h3 className="text-2xl font-bold">Не нашли ответ на свой вопрос?</h3>
                    <p className="text-primary-foreground/90 text-lg">
                      Напишите нам, и мы проконсультируем вас по любым вопросам поставок и сотрудничества.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="shrink-0 shadow-md font-semibold">
                    <Link href="/contacts">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Написать нам
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
