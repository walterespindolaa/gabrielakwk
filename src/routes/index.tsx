import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Compass, LayoutGrid, Megaphone, MessageCircle, PenLine, Sparkles, Target, UserCheck, TrendingUp, Briefcase, Lightbulb, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { FlipWords } from "@/components/ui/flip-words";
import { StackingCards, type StackingCardItem } from "@/components/ui/stacking-card";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";
import { BouncyCardsFeatures, type BouncyFeatureItem } from "@/components/ui/bouncy-cards-features";
import { MaterialsCarousel, type MaterialCarouselItem } from "@/components/ui/materials-carousel";
import { PainCard } from "@/components/ui/animated-pain-cards";
import { StickerCollage } from "@/components/ui/sticker-collage";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";
import wordmarkAsset from "@/assets/gabi-kwk-wordmark.png.asset.json";
import circleAsset from "@/assets/kwk-circle.png.asset.json";
import heroPhoto from "@/assets/gabi-hero.jpg.asset.json";
import aboutPhoto from "@/assets/gabi-about.jpg.asset.json";
import meetingOnePhoto from "@/assets/meeting-1.jpg.asset.json";
import meetingTwoPhoto from "@/assets/meeting-2.jpg.asset.json";
import meetingThreePhoto from "@/assets/meeting-3.jpg.asset.json";
import meetingFourPhoto from "@/assets/meeting-4.jpg.asset.json";
import sticker6 from "@/assets/stickers/sticker-6.png.asset.json";
import sticker9 from "@/assets/stickers/sticker-9.png.asset.json";
import sticker10 from "@/assets/stickers/sticker-10.png.asset.json";
import sticker12 from "@/assets/stickers/sticker-12.png.asset.json";
import sticker14 from "@/assets/stickers/sticker-14.png.asset.json";
import sticker16 from "@/assets/stickers/sticker-16.png.asset.json";
import sticker17 from "@/assets/stickers/sticker-17.png.asset.json";
import sticker18 from "@/assets/stickers/sticker-18.png.asset.json";
import sticker19 from "@/assets/stickers/sticker-19.png.asset.json";
import sticker21 from "@/assets/stickers/sticker-21.png.asset.json";

const WHATSAPP_URL = "https://wa.me/5547988537412";
const CTA_LABEL = "Quero conhecer a consultoria";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Consultoria CRIAR — KWK | Gabriela Kawikioni" },
      {
        name: "description",
        content:
          "Um processo de 4 encontros para transformar quem você é em uma presença digital que atrai, conecta e gera resultado. Método CRIAR por Gabriela Kawikioni.",
      },
      { property: "og:title", content: "Consultoria CRIAR — KWK" },
      {
        property: "og:description",
        content:
          "Seu trabalho é excelente. Seu Instagram ainda não sabe disso. Método CRIAR — 4 encontros, estratégia e autonomia.",
      },
    ],
  }),
});

function CTAButton({
  children,
  size = "md",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  variant?: "primary" | "ghost-light";
  className?: string;
}) {
  const sizes = size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3.5 text-sm";
  const variants =
    variant === "primary"
      ? "bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/20"
      : "bg-white text-brand hover:bg-white/90";
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] ${sizes} ${variants} ${className}`}
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </a>
  );
}

function LandingPage() {
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <PainSection />
      <Pullquote />
      <Method />
      <MidCTA />
      <Meetings />
      <Outcomes />
      {/* SocialProof removida */}
      <Deliverables />
      <FitChecklist />
      <About />
      <FAQ />
      <FinalCTA />
      <Footer />
      {/* Sticky mobile CTA */}
      <div
        className={`fixed bottom-4 inset-x-4 z-40 sm:hidden transition-all duration-300 ${
          showSticky ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-brand text-brand-foreground px-6 py-3.5 text-sm font-semibold shadow-2xl shadow-brand/30"
        >
          {CTA_LABEL}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

/* ─── Nav ─── */
function Nav() {
  return (
    <nav className="absolute top-0 inset-x-0 z-30">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="KWK — Consultoria CRIAR">
          <img
            src={monogramAsset.url}
            alt="KWK"
            className="h-12 sm:h-14 w-auto"
          />
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 text-brand px-4 py-2 text-sm font-medium hover:bg-brand/10 transition-colors"
        >
          {CTA_LABEL}
        </a>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative pt-20 pb-10 sm:pt-24 sm:pb-14 bg-gradient-to-b from-brand-soft via-background to-background overflow-hidden">
      <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-accent/40 blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-5 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-12 items-center">
        <div className="text-center lg:text-left order-2 lg:order-1">
          <img
            src={wordmarkAsset.url}
            alt="Gabi KWK — Estrategista Social Media"
            className="mx-auto lg:mx-0 w-[240px] sm:w-[320px] md:w-[380px] h-auto mb-7"
          />
          <p className="text-sm sm:text-base uppercase tracking-[0.22em] text-foreground/70 font-medium mb-4">
            Seu trabalho é excelente. <span className="text-brand">Seu Instagram ainda não sabe disso.</span>
          </p>
          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-foreground"
            style={{ lineHeight: "1.02" }}
          >
            <span className="text-brand">Cria</span>
            <FlipWords
              words={["tividade.", "ção.", "dores.", "tivos."]}
              className="italic text-brand px-0"
            />
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0" style={{ textWrap: "pretty", lineHeight: "1.55" }}>
            Um processo de 4 encontros para transformar quem você é em uma presença digital que atrai, conecta e gera resultado — seja você iniciante ou já presente no digital.
          </p>
          <div className="mt-9 flex justify-center lg:justify-start">
            <CTAButton size="lg">{CTA_LABEL}</CTAButton>
          </div>
        </div>
        <div className="order-1 lg:order-2 relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-accent/40 via-brand/10 to-transparent blur-2xl pointer-events-none" />
          <div className="relative aspect-[4/5] w-full max-w-xl lg:max-w-none mx-auto overflow-hidden rounded-3xl border border-border/40 shadow-2xl shadow-brand/15">
            <img
              src={heroPhoto.url}
              alt="Gabriela Kawikioni"
              className="w-full h-full object-cover scale-110"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pain section ─── */
const pains = [
  "Tenho um negócio que funciona — mas quando olho pro meu Instagram, parece que ele não diz nada sobre o que eu faço.",
  "Nunca postei nada. Sei que precisava ter começado antes, mas não sei por onde começar agora.",
  "Posto, mas não tem consistência, não tem retorno, não tem fio condutor.",
  "Já contratei alguém — mas as entregas ficaram desalinhadas com quem eu sou de verdade.",
  "Tenho muito a oferecer, mas na hora de mostrar isso no digital, trava tudo.",
];

function PainSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 bg-surface-alt">
      <StickerCollage variant="pain" />
      <div className="relative z-10 max-w-6xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center max-w-3xl mx-auto" style={{ lineHeight: "1.15" }}>
          Talvez você também já tenha <span className="italic text-brand">pensado nisso</span>:
        </h2>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {pains.map((p, i) => (
            <PainCard
              key={i}
              index={`0${i + 1}`}
              quote={p}
              variant={i % 2 === 0 ? "waves" : "crosses"}
              className={`lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""} ${i === 4 ? "sm:col-span-2 lg:col-span-2 lg:col-start-4" : ""}`}
            />
          ))}
        </div>
        <p className="mt-14 max-w-2xl mx-auto text-center text-lg text-foreground/90" style={{ textWrap: "pretty" }}>
          O problema não é você. É a falta de um caminho claro — e de alguém que entenda quem você é antes de sugerir o que você deve postar.
        </p>
      </div>
    </section>
  );
}

/* ─── Pullquote ─── */
function Pullquote() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-background">
      <StickerCollage variant="pullquote" />
      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
        <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium italic text-foreground" style={{ lineHeight: "1.2" }}>
          "Eu crio com você para você criar sozinha."
        </p>
        <p className="mt-8 text-sm uppercase tracking-[0.25em] text-brand">
          — a essência do Método CRIAR
        </p>
      </div>
    </section>
  );
}

/* ─── Method ─── */


const methodSteps: StackingCardItem[] = [
  {
    letter: "C",
    title: "Compreender",
    description:
      "Sua história, seus valores, seu diferencial — tudo que te torna única antes de falar em conteúdo.",
    bg: "#F4ECDF",
    fg: "#3A1320",
    accent: "#E8DCC7",
  },
  {
    letter: "R",
    title: "Reconhecer",
    description:
      "Seu público com profundidade real — quem ele é, o que sente e como você pode falar com ele de verdade.",
    bg: "#F6DCDC",
    fg: "#3A1320",
    accent: "#EBC4C4",
  },
  {
    letter: "I",
    title: "Identificar",
    description:
      "A identidade da sua marca — tom de voz, mensagem, pilares e como ela aparece no digital.",
    bg: "#D9DFEC",
    fg: "#3A1320",
    accent: "#C3CCDF",
  },
  {
    letter: "A",
    title: "Ativar",
    description:
      "Tudo em plano de ação — o que postar, quando postar e com qual objetivo.",
    bg: "#3A1320",
    fg: "#F4ECDF",
    accent: "#581B2E",
  },
  {
    letter: "R",
    title: "Reorganizar",
    description:
      "O perfil digital para que ele reflita, de verdade, quem você é e o que você entrega.",
    bg: "#EFD9C2",
    fg: "#3A1320",
    accent: "#E2C2A2",
  },
];

function Method() {
  return (
    <section className="pt-24 sm:pt-32 bg-surface-alt relative">
      <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-brand/5 blur-3xl pointer-events-none -z-0" />
      <div className="relative max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-4">O método</p>
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            <img
              src={circleAsset.url}
              alt=""
              aria-hidden="true"
              className="h-20 sm:h-28 md:h-32 w-auto"
            />
            <h2 className="font-display text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight text-brand leading-none whitespace-nowrap">
              CRIAR
            </h2>
          </div>
          <h3 className="mt-8 font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight max-w-3xl mx-auto" style={{ lineHeight: "1.2" }}>
            Um sistema para transformar negócios confusos em marcas claras, organizadas e posicionadas.
          </h3>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto" style={{ textWrap: "pretty" }}>
            Cada letra é uma etapa. Cada etapa tem uma entrega. E tudo é construído em cima de quem você é — não de fórmulas prontas.
          </p>
        </div>
      </div>

      <StackingCards items={methodSteps} />
    </section>
  );
}


/* ─── Mid CTA ─── */
function MidCTA() {
  return (
    <section className="pt-8 pb-4 bg-background">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <CTAButton size="lg">{CTA_LABEL}</CTAButton>
      </div>
    </section>
  );
}

/* ─── Meetings ─── */
const meetings: CardItem[] = [
  {
    id: "Encontro 1",
    title: "Quem é sua marca?",
    description:
      "Mergulhamos na sua história, trajetória e no que te faz diferente. Antes de pensar em qualquer post, entendemos a essência que precisa aparecer.",
    imgSrc: meetingOnePhoto.url,
    icon: <MessageCircle className="h-5 w-5" />,
    linkHref: "#",
  },
  {
    id: "Encontro 2",
    title: "Para quem você fala?",
    description:
      "Mapeamos público, dores, desejos, linguagem e jornada para criar uma comunicação que conecta sem parecer fórmula pronta.",
    imgSrc: meetingTwoPhoto.url,
    icon: <Target className="h-5 w-5" />,
    linkHref: "#",
  },
  {
    id: "Encontro 3",
    title: "Como sua marca fala?",
    description:
      "Construímos identidade de comunicação, tom de voz, pilares e reorganização do perfil para transmitir o que você realmente entrega.",
    imgSrc: meetingThreePhoto.url,
    icon: <LayoutGrid className="h-5 w-5" />,
    linkHref: "#",
  },
  {
    id: "Encontro 4",
    title: "Como transformar isso em resultado?",
    description:
      "Fechamos com funil, linha editorial, ideias de posts e um plano prático para os próximos 90 dias. Você sai com tudo nas mãos.",
    imgSrc: meetingFourPhoto.url,
    icon: <PenLine className="h-5 w-5" />,
    linkHref: "#",
  },
];

function Meetings() {
  return (
    <section className="pt-4 pb-24 sm:pt-6 sm:pb-28 bg-background">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight" style={{ lineHeight: "1.15" }}>
            4 encontros. Um processo. Um resultado.
          </h2>
          <p className="mt-4 text-muted-foreground">
            100% online. Cada encontro com foco em uma etapa do método.
          </p>
        </div>
        <ExpandingCards items={meetings} />
      </div>
    </section>
  );
}

/* ─── Outcomes ─── */
const outcomes: BouncyFeatureItem[] = [
  {
    id: "clareza",
    title: "Clareza digital",
    description: "Você entende quem é no digital — nada mais de perfil confuso ou mensagem solta.",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    id: "posicionamento",
    title: "Posicionamento definido",
    description: "Você sabe exatamente o que diz, para quem fala e por que aquilo importa.",
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: "conteudo",
    title: "Conteúdo com propósito",
    description: "Cada publicação passa a ter intenção, conexão e direção — sem postar por postar.",
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    id: "consistencia",
    title: "Consistência possível",
    description: "Uma rotina de criação que cabe na sua vida, sem sobrecarga e sem travar tudo.",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    id: "perfil",
    title: "Perfil que trabalha por você",
    description: "Sua presença começa a explicar seu valor mesmo quando você não está postando.",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    id: "autonomia",
    title: "Autonomia para continuar",
    description: "Você sai criando com segurança, sem depender de terceiros para cada próximo passo.",
    icon: <UserCheck className="h-5 w-5" />,
  },
];

function Outcomes() {
  return (
    <section className="py-24 sm:py-28 bg-surface-alt">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-14" style={{ lineHeight: "1.15" }}>
          O que muda depois da consultoria.
        </h2>
        <BouncyCardsFeatures items={outcomes} />
      </div>
    </section>
  );
}

/* ─── Social proof ─── */
function SocialProof() {
  const testimonials = [
    { name: "[Nome do depoimento]", context: "[Profissão / contexto]" },
    { name: "[Nome do depoimento]", context: "[Profissão / contexto]" },
    { name: "[Nome do depoimento]", context: "[Profissão / contexto]" },
  ];
  const seals = [
    "Estrategista com background em saúde, compliance e mercado financeiro",
    "Método próprio, construído sobre quem você é",
    "Você sai com autonomia — não dependente",
  ];
  return (
    <section className="py-24 sm:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-14" style={{ lineHeight: "1.15" }}>
          Por que confiar nesse processo.
        </h2>
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-soft border border-brand/15 flex items-center justify-center text-brand font-display text-lg">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.context}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                [Depoimento aqui]
              </p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {seals.map((s, i) => (
            <div key={i} className="rounded-xl border border-brand/15 bg-brand/[0.04] p-4 text-center text-sm text-foreground/85">
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Deliverables ─── */
const deliverables: MaterialCarouselItem[] = [
  { n: "01", title: "Relatório mestre", desc: "Posicionamento, persona, comunicação e plano de 90 dias em um documento completo.", image: sticker21.url },
  { n: "02", title: "Guia de equipamentos", desc: "Como gravar bem com o que você tem agora.", image: sticker10.url },
  { n: "03", title: "Rotina de criação", desc: "Calendário flexível para criar com antecedência e consistência.", image: sticker9.url },
  { n: "04", title: "Banco de carrosséis", desc: "20 estruturas prontas para personalizar + 20 prompts de IA.", image: sticker12.url },
  { n: "05", title: "Combinações de fontes", desc: "5 pares tipográficos para identidade visual consistente.", image: sticker17.url },
  { n: "06", title: "Mini dicionário", desc: "35 termos do marketing digital explicados sem tecnicismo.", image: sticker14.url },
];

function Deliverables() {
  return (
    <section className="py-24 sm:py-28 bg-surface-alt">
      <div className="max-w-5xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-14" style={{ lineHeight: "1.15" }}>
          Materiais para você continuar depois.
        </h2>
        <MaterialsCarousel items={deliverables} />

        <div className="mt-10 rounded-3xl bg-brand text-brand-foreground p-8 sm:p-10 relative overflow-hidden">
          <Sparkles className="absolute top-6 right-6 w-6 h-6 opacity-50" />
          <p className="text-xs uppercase tracking-[0.25em] font-semibold opacity-80 mb-3">
            Bônus exclusivo
          </p>
          <p className="font-display text-2xl sm:text-3xl font-medium" style={{ lineHeight: "1.25" }}>
            Acesso ao Sistema CRIA
          </p>
          <p className="mt-4 text-brand-foreground/85 max-w-2xl leading-relaxed">
            Sua área de membros para organizar e planejar conteúdo, com todos os materiais da consultoria em um só lugar. Disponível primeiro para quem passa pela consultoria.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Fit checklist ─── */
const fits = [
  { icon: Compass, secondary: Sparkles, title: "Está começando", desc: "Quer começar no digital e não sabe por onde — precisa de clareza e um caminho." },
  { icon: TrendingUp, secondary: Target, title: "Posta sem resultado", desc: "Já posta, mas não vê resultado e não entende por quê. Quer parar de tentar no escuro." },
  { icon: Briefcase, secondary: Megaphone, title: "Tem expertise para mostrar", desc: "Tem um negócio ou expertise real e quer mostrar isso com estratégia, não no improviso." },
  { icon: Lightbulb, secondary: PenLine, title: "Quer entender o processo", desc: "Quer entender o porquê de cada escolha — não só receber um feed bonito pronto." },
  { icon: Zap, secondary: UserCheck, title: "Busca autonomia", desc: "Quer sair com autonomia para criar conteúdo sem depender de terceiros toda vez." },
  { icon: Heart, secondary: Sparkles, title: "Quer atrair certo", desc: "Quer atrair as pessoas certas — clientes, oportunidades — não só seguidores." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

type FitItemProps = {
  icon: typeof Compass;
  secondary: typeof Sparkles;
  title: string;
  desc: string;
  direction: "left" | "right";
};

function FitItem({ icon: Icon, secondary: Secondary, title, desc, direction }: FitItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:border-brand/40 transition-all ${direction === "left" ? "md:text-right" : "md:text-left"}`}
    >
      <div className={`flex items-center gap-3 mb-3 ${direction === "left" ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <Secondary className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-brand/60" strokeWidth={2} />
        </div>
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FitChecklist() {
  const leftItems = fits.slice(0, 3);
  const rightItems = fits.slice(3, 6);

  return (
    <section className="relative py-24 sm:py-28 bg-background overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute top-20 left-10 w-64 h-64 rounded-full bg-brand/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-20 right-10 w-72 h-72 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-medium tracking-wider uppercase mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Para quem é
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight" style={{ lineHeight: "1.15" }}>
            Essa consultoria é <span className="italic text-brand">para você</span> que:
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center"
        >
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {leftItems.map((f, i) => (
              <FitItem key={i} {...f} direction="left" />
            ))}
          </div>

          {/* Center image */}
          <motion.div
            variants={itemVariants}
            className="relative order-first md:order-none mx-auto w-full max-w-[280px] md:w-[280px]"
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-border/40 shadow-2xl shadow-brand/15">
              <img src={aboutPhoto.url} alt="Gabriela Kawikioni" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/30 via-transparent to-transparent" />
            </div>
            <div aria-hidden className="absolute -top-3 -right-3 w-16 h-16 rounded-2xl bg-brand/15 -z-10" />
            <div aria-hidden className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-brand/10 -z-10" />
          </motion.div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {rightItems.map((f, i) => (
              <FitItem key={i} {...f} direction="right" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── About ─── */
function About() {
  return (
    <section className="py-24 sm:py-28 bg-surface-alt">
      <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-[320px_1fr] gap-10 items-center">
        <div className="mx-auto md:mx-0 w-full max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden border border-border/40 shadow-xl shadow-brand/10">
          <img src={aboutPhoto.url} alt="Gabriela Kawikioni" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6" style={{ lineHeight: "1.15" }}>
            Prazer, <span className="italic text-brand">Gabriela Kawikioni</span>.
          </h2>
          <p className="text-foreground/85 leading-relaxed mb-4">
            Sou Social Media Estrategista com background em saúde, compliance e mercado financeiro. Comecei no marketing sem grandes cursos — só com coragem, curiosidade e vontade real de aprender.
          </p>
          <p className="text-foreground/85 leading-relaxed mb-6">
            Sei o que é começar do zero, sentir medo de aparecer e duvidar do próprio trabalho. Por isso me conecto de verdade com quem está nesse momento.
          </p>
          <div className="border-l-2 border-brand pl-5 py-2">
            <p className="font-display text-lg italic text-foreground" style={{ lineHeight: "1.5" }}>
              Meu trabalho não é fazer posts bonitos. É traduzir a essência de cada profissional em presença digital com estratégia, autenticidade e resultado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  { q: "Nunca postei nada. Essa consultoria é para mim?", a: "Sim. O Método CRIAR foi pensado também para quem está começando do zero. Você não precisa ter histórico de conteúdo — precisa ter vontade de começar com clareza." },
  { q: "Já contratei social media antes e me frustrei.", a: "Eu entendo. A maioria das entregas de social media é execução sem estratégia. Aqui você sai com posicionamento construído — não só com posts prontos." },
  { q: "Preciso aparecer em vídeo?", a: "Não necessariamente. Trabalhamos juntas para encontrar a forma que faz mais sentido para a sua realidade." },
  { q: "Minha essência vai ser respeitada?", a: "É a base de tudo. Não uso fórmulas prontas. O processo parte inteiramente de quem você é." },
  { q: "E se eu não souber nada de marketing?", a: "Melhor assim. Começamos do zero juntas. O mini dicionário que você recebe já cobre todos os termos que você vai precisar conhecer." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 sm:py-28 bg-background">
      <div className="max-w-3xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-12" style={{ lineHeight: "1.15" }}>
          Perguntas que você provavelmente tem
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-muted/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-foreground">{f.q}</span>
                  <span className={`text-brand text-xl transition-transform flex-shrink-0 ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 bg-brand text-brand-foreground relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-black/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-5 text-center">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight" style={{ lineHeight: "1.15" }}>
          Se você continuar esperando se sentir pronta, vai continuar parada.
        </h2>
        <p className="mt-6 text-brand-foreground/85 max-w-xl mx-auto text-lg" style={{ textWrap: "pretty" }}>
          4 encontros. Um método. Um relatório completo. E você no controle da sua presença digital.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <CTAButton size="lg" variant="ghost-light">{CTA_LABEL}</CTAButton>
          <p className="text-xs text-brand-foreground/70">
            Após clicar, você será direcionada para uma conversa no WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border/60 py-10 bg-background">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold tracking-tight">KWK</span>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Gabriela Kawikioni</span>
        </div>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-brand transition-colors">
          Área de membros
        </Link>
      </div>
    </footer>
  );
}
