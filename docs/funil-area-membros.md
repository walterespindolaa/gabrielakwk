# Funil de Captação & Área de Membros — KWK

> Spec de construção. Frontend/app: Claude (Cowork). SQL/migrations: Walter.
> Última atualização: 18/06/2026.

## 1. Visão do funil (lead → cliente)

```
Instagram / divulgação
        ↓
Formulário de captação (LEAD)  ──► cai no Admin como LEAD
        ↓
Gabriela analisa (avalia fit) ──► [Não apta] arquiva
        ↓ (apta)
Gabriela entra em contato (WhatsApp)
        ↓
Contrato + pagamento
        ↓ botão "Virar cliente"
Briefing estratégico (pré-consultoria)
        ↓
Agendamento dos 4 encontros (C·R·I·A)
        ↓
Pós-consultoria — 30 dias de suporte (WhatsApp)
```

### Status do pipeline (lead)
Hoje o lead vive em `form_invites` (com `lead_name/email/whatsapp`, `submitted_at`, `approved_at`).
O status é derivado dos timestamps. Para o CRM kanban precisamos de um status explícito:

| status        | significado                                   | coluna no kanban |
|---------------|-----------------------------------------------|------------------|
| `novo`        | acabou de cair, ainda não respondeu o form    | Novos            |
| `respondido`  | preencheu o formulário de captação            | Respondidos      |
| `em_contato`  | Gabriela puxou no WhatsApp                     | Em contato       |
| `apta`        | qualificada, aguardando pagamento             | Aptas            |
| `cliente`     | pagou + acesso criado (vira `profiles`)       | (sai do funil)   |
| `nao_apta`    | descartado                                     | (arquivado)      |

---

## 2. Os dois formulários (são distintos!)

> ⚠️ Hoje existe **um** formulário "Pré-Consultoria — Método CRIAR" semeado no banco que
> **mistura** perguntas de lead e de briefing. Recomendo **separar em dois**, alinhados ao funil.

### Form A — Captação (LEAD) — público, no site
Curto, qualificador. Objetivo: Gabriela decidir o fit.

1. Qual é o seu nome? *(short)*
2. Qual é o seu @ no Instagram? *(short)*
3. Qual seu WhatsApp? *(short)*
4. Qual seu e-mail? *(short)*
5. Qual é o seu nicho ou área de atuação? *(short)*
6. Quais serviços, produtos ou soluções você oferece atualmente? *(long)*
7. Há quanto tempo você atua nessa área? *(choice: <1 ano / 1–3 / 3–5 / 5+)*
8. Como está sua produção de conteúdo hoje? *(choice: Nunca postei / Raramente, sem estratégia / Com alguma frequência / Rotina consistente)*
9. Como me conheceu? *(long)*
10. Qual é o principal desafio que você enfrenta hoje com sua presença digital? *(long)*
11. O que fez você decidir buscar ajuda neste momento? *(long)*
12. Se esta consultoria fosse um sucesso, o que teria mudado ao final? *(long)*
13. Hoje, o que você acredita que mais impede seu crescimento? *(long)*
14. Você está ciente de que os resultados dependem da sua dedicação...? *(choice: Sim / Não)*
15. Você se sente confortável em investir de R$800 a R$1000 hoje? *(choice: Sim / Não)*
16. Existe algo sobre sua marca/momento que eu deveria saber antes da conversa? *(long)*

### Form B — Briefing estratégico (pós-pagamento) — cliente logado
Liberado pelo botão "Virar cliente".

1. E-mail para agendamento da call *(short)*
2. Tem algum dia/horário/preferência para agendamentos? *(long)*
3. Me conta tudo que é importante eu saber sobre você antes da call! *(long)*
4. Quais canais você usa para se comunicar hoje? *(multichoice: Instagram, WhatsApp, Site/Blog, TikTok, LinkedIn, Nenhum)*
5. Em uma frase: o que você faz e para quem? *(long)*
6. Quais são os 3 valores mais importantes para você como profissional? *(long)*
7. Qual é o maior impacto que você quer gerar na vida de quem te contrata? *(long)*
8. O que você domina com profundidade que a maioria no seu segmento não tem? *(long)*
9. O que clientes costumam dizer que você faz diferente? *(long)*
10. Existe alguma dúvida que você carrega há muito tempo e quer destravar? *(long)*
11. O que te fez fechar essa consultoria comigo? *(long)*

Tipos de campo já suportados pelo schema atual (`schema.fields[]`): `short`, `long`, `choice`, `multichoice`, `section`.

---

## 3. StepForm — formulário página por página (reutilizável)

Em vez de mostrar todas as perguntas numa página só, criar um componente `<StepForm>` que:
- recebe `schema.fields[]` (mesma estrutura já usada no banco — zero mudança de dados);
- renderiza **uma pergunta por tela**, com barra de progresso, voltar/avançar, validação e animação;
- agrupa por `section` quando existir;
- **inclui o botão de voz por campo** (ver seção 4);
- ao final, faz o submit no mesmo `form_responses`/`submitInviteForm` já existente.

**Reuso:** o mesmo StepForm serve para Form A (lead), Form B (briefing) e os formulários dos 4 encontros. Um componente, todos os fluxos.

---

## 4. Transcrição por voz (falar → texto) nos campos

Botão de microfone em cada campo de texto. Duas abordagens:

| | Web Speech API (navegador) | Whisper / gpt-4o-transcribe (servidor) |
|---|---|---|
| Custo | grátis | ~US$0,006/min |
| Qualidade pt-BR | razoável | alta |
| Compatibilidade | Chrome/Edge/Safari (varia) | qualquer navegador |
| Chave de API | não | sim (server-side) |
| Latência | instantânea | ~1–3s |

**Recomendação:** como os formulários são peça-chave e o produto é premium, usar **transcrição no servidor (OpenAI Whisper / gpt-4o-mini-transcribe)** para qualidade e consistência entre dispositivos:
1. Gravar áudio no navegador (`MediaRecorder`).
2. Enviar para uma **server function** TanStack (`/transcribe`) que chama a API.
3. Devolver o texto e preencher o campo (a pessoa pode editar depois).

Opcional: usar **Claude** num segundo passo para limpar/organizar o texto transcrito (pontuação, parágrafos). A transcrição de áudio em si fica melhor no Whisper (Claude não tem endpoint público de transcrição de áudio).

🔐 **A chave da API fica SOMENTE no servidor** (secret do Cloudflare/Supabase), nunca no cliente. Fallback para Web Speech API quando o usuário negar microfone ou a API falhar.

---

## 5. CRM Kanban (Admin → Leads)

✅ Boa notícia: `@dnd-kit/core` + `@dnd-kit/sortable` **já estão instalados** no projeto.

- Colunas = status do pipeline (seção 1). Cards = leads.
- Arrastar card muda o `status` (update no `form_invites`).
- Cada card: nome, @, status do form (respondido/pendente), data, botões **Link** e **WhatsApp**.
- **Excluir/arquivar** (pedido do Walter): recomendo **soft-delete** (`archived = true`) + filtro "mostrar arquivados", além de um hard-delete real para limpeza. Evita perda acidental de histórico.
- Botão **"Virar cliente"** no card/detalhe (ver seção 6).

---

## 6. Botão "Virar cliente"

Já existe um embrião: "Aprovar e criar acesso" (`admin.leads`). Estender para o fluxo completo:
1. Marca `status = cliente`, grava `approved_at`.
2. Cria usuário (auth) + `profiles` + papel de cliente (fluxo de acesso já existe).
3. Cria `journey_progress` (jornada CRIAR zerada).
4. Libera o **Form B (briefing estratégico)** automaticamente na área de membros.

---

## 7. SQL que o Walter precisa criar (rascunho)

```sql
-- Pipeline + arquivamento de leads
ALTER TABLE public.form_invites
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo','respondido','em_contato','apta','cliente','nao_apta')),
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pipeline_order int;  -- ordem dentro da coluna

-- Backfill do status a partir dos timestamps atuais
UPDATE public.form_invites SET status =
  CASE WHEN approved_at IS NOT NULL THEN 'cliente'
       WHEN submitted_at IS NOT NULL THEN 'respondido'
       ELSE 'novo' END;

-- Form A (captação) e Form B (briefing) como dois forms distintos:
-- inserir 2 registros em public.forms com schema.fields[] das seções 2A e 2B.
```

---

## 8. Insights & ordem sugerida

1. **Separar Form A (lead) de Form B (briefing).** Hoje estão misturados num form só — isso confunde o funil e pede dados de briefing cedo demais. Lead curto qualifica melhor e converte mais.
2. **StepForm primeiro.** É a base que destrava TODOS os formulários (lead, briefing, encontros) + a voz. Maior alavanca de reuso.
3. **Voz no servidor (Whisper).** Mais simples de manter consistente; chave no servidor.
4. **Kanban com dnd-kit (já instalado)** + soft-delete. Rápido de entregar.
5. **`.env` no repo público = risco.** Rotacionar as chaves Supabase/Cloudflare e remover do histórico.
6. **Aplicar as 4 cores da marca** semanticamente no kanban (novo=azul, em_contato=rosa, apta=creme, cliente=vinho).
7. **Já entregue nesta rodada:** loader de marca (anti-tela-branca), splash inicial, preload de rotas, correção de resíduos de template no metadata.

### Ordem de construção proposta
`StepForm` → `Form A (lead) público` → `voz/transcrição` → `Kanban CRM + arquivar` → `botão Virar cliente` → `Form B (briefing)`.
```
```
