import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";
import wordmarkAsset from "@/assets/gabi-kwk-wordmark.png.asset.json";
import circleAsset from "@/assets/kwk-circle.png.asset.json";
import heroPhoto from "@/assets/gabi-hero.jpg.asset.json";
import aboutPhoto from "@/assets/gabi-about.jpg.asset.json";

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
    <section className="py-24 sm:py-28 bg-surface-alt">
      <div className="max-w-5xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center max-w-3xl mx-auto" style={{ lineHeight: "1.15" }}>
          Talvez você também já tenha pensado nisso:
        </h2>
        <div className="mt-14 grid sm:grid-cols-2 gap-4">
          {pains.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-card border border-border/60 p-6 text-foreground/80 leading-relaxed shadow-sm ${
                i === 4 ? "sm:col-span-2 sm:max-w-2xl sm:mx-auto" : ""
              }`}
            >
              <span className="text-brand text-2xl font-display leading-none">"</span>
              <p className="mt-1 text-[15px]">{p}</p>
            </div>
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
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-5 text-center">
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
    <section className="py-24 sm:py-32 bg-surface-alt relative overflow-hidden">
      <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-brand/5 blur-3xl pointer-events-none" />
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
    <section className="py-16 bg-background">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <CTAButton size="lg">{CTA_LABEL}</CTAButton>
      </div>
    </section>
  );
}

/* ─── Meetings ─── */
const meetings = [
  { n: 1, badge: "C", title: "Quem é sua marca?", desc: "Mergulhamos na sua história, trajetória e o que te faz diferente. Entendemos quem você é antes de pensar em qualquer post." },
  { n: 2, badge: "R", title: "Para quem você fala?", desc: "Mapeamos seu público com profundidade — dores, desejos, linguagem, jornada. Definimos posicionamento e diferencial." },
  { n: 3, badge: "I + R", title: "Como sua marca fala?", desc: "Construímos a identidade de comunicação e reorganizamos o perfil para que ele transmita o que você realmente entrega." },
  { n: 4, badge: "A", title: "Como transformar isso em resultado?", desc: "Funil, linha editorial, ideias de posts e plano para os próximos 90 dias. Você sai com tudo nas mãos." },
];

function Meetings() {
  return (
    <section className="py-24 sm:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight" style={{ lineHeight: "1.15" }}>
            4 encontros. Um processo. Um resultado.
          </h2>
          <p className="mt-4 text-muted-foreground">
            100% online. Cada encontro com foco em uma etapa do método.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {meetings.map((m) => (
            <div key={m.n} className="rounded-2xl border border-border/60 bg-card p-7 hover:border-brand/30 transition-all relative">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Encontro {m.n}</span>
                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 px-3 rounded-full bg-brand/10 text-brand text-xs font-bold tracking-wider">
                  {m.badge}
                </span>
              </div>
              <h3 className="font-display text-2xl font-medium mb-3" style={{ lineHeight: "1.2" }}>
                {m.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Outcomes ─── */
const outcomes = [
  "Clareza sobre quem você é no digital — nada mais de perfil confuso.",
  "Posicionamento definido — você vai saber exatamente o que diz, para quem e por quê.",
  "Conteúdo com propósito — sem postar por postar. Cada publicação com intenção.",
  "Consistência sem sobrecarga — uma rotina que cabe na sua vida.",
  "Um perfil que trabalha por você — mesmo quando você não está postando.",
  "Autonomia para continuar — você sai criando, não dependendo de terceiros.",
];

function Outcomes() {
  return (
    <section className="py-24 sm:py-28 bg-surface-alt">
      <div className="max-w-4xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-14" style={{ lineHeight: "1.15" }}>
          O que muda depois da consultoria.
        </h2>
        <ul className="space-y-4">
          {outcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-4 rounded-xl bg-card border border-border/50 p-5">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-success/15 flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-success" strokeWidth={3} />
              </div>
              <p className="text-foreground/85 leading-relaxed">{o}</p>
            </li>
          ))}
        </ul>
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
const deliverables = [
  { n: "01", title: "Relatório mestre", desc: "Posicionamento, persona, comunicação e plano de 90 dias em um documento completo." },
  { n: "02", title: "Guia de equipamentos", desc: "Como gravar bem com o que você tem agora." },
  { n: "03", title: "Rotina de criação", desc: "Calendário flexível para criar com antecedência e consistência." },
  { n: "04", title: "Banco de carrosséis", desc: "20 estruturas prontas para personalizar + 20 prompts de IA." },
  { n: "05", title: "Combinações de fontes", desc: "5 pares tipográficos para identidade visual consistente." },
  { n: "06", title: "Mini dicionário", desc: "35 termos do marketing digital explicados sem tecnicismo." },
];

function Deliverables() {
  return (
    <section className="py-24 sm:py-28 bg-surface-alt">
      <div className="max-w-5xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-14" style={{ lineHeight: "1.15" }}>
          Materiais para você continuar depois.
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {deliverables.map((d) => (
            <div key={d.n} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-brand/30 transition-all">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-2xl font-medium text-brand">{d.n}</span>
                <h3 className="font-semibold text-foreground">{d.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>

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
  "Quer começar no digital e não sabe por onde",
  "Já posta, mas não vê resultado e não entende por quê",
  "Tem um negócio ou expertise e quer mostrar isso com estratégia",
  "Quer entender o processo — não só receber um feed bonito",
  "Quer sair com autonomia para criar sem depender de terceiros",
  "Quer atrair as pessoas certas — não só seguidores",
];

function FitChecklist() {
  return (
    <section className="py-24 sm:py-28 bg-background">
      <div className="max-w-3xl mx-auto px-5">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center mb-12" style={{ lineHeight: "1.15" }}>
          Essa consultoria é para você que:
        </h2>
        <ul className="space-y-3">
          {fits.map((f, i) => (
            <li key={i} className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0">
              <span className="text-brand text-xl leading-none mt-0.5">✦</span>
              <span className="text-foreground/85 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
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
