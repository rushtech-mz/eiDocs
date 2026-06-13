# Auditoria de Refinamento — UI / UX / Código (Frontend eiDocuments)

> Documento de trabalho. Lista de anomalias detetadas para refinarmos **pouco a pouco**.
> Cada item tem ficheiro + linha aproximada. Nada foi alterado ainda — isto é só o levantamento.

---

## 0. Resumo executivo — maiores prioridades

1. **A landing page está visualmente "partida"**: depende de classes Tailwind (`bg-gradient-primary`, `text-primary-blue`, `shadow-soft/strong/gradient`, `animate-pulse-slow`, `delay-100..700`, etc.) definidas em `tailwind.config.ts`, mas o projeto usa **Tailwind v4** (`@import "tailwindcss"` no `globals.css`, sem `@config`) — **o `tailwind.config.ts` não é carregado**. Essas classes não geram CSS. Confirmado: `globals.css` não tem diretiva `@config`.
2. **Existem 7 implementações de sidebar/layout diferentes** (`Sidebar.tsx`, `AdminSidebar.tsx`, `UserSidebar.tsx`, `AdminLayout.tsx`, `SuperadminLayout.tsx`, dois ficheiros `UserLayout.tsx`, `ManageLayout.tsx`), com cores de "marca" diferentes por role (azul / vermelho / indigo-cinza), dark mode presente nuns e ausente noutros, e responsividade mobile só em metade.
3. **Dois sistemas de Toast/Notification** coexistem — só um está realmente ligado (`ToastContext`); `Notification.tsx` / `useNotification.ts` / `NotificationContainer.tsx` são código morto.
4. **3 sistemas de inputs/botões**: shadcn (`button.tsx`/`input.tsx`, com tokens), `ModernButton`/`ModernInput` (Tailwind hardcoded, gradiente azul), e `AuthInput`/`AuthButton` (mínimos, não usados). Forms usam ainda uma 4ª variante (inputs com classes gigantes inline, foco índigo).
5. **Branding inconsistente**: "eiDocs" vs "eiDocuments" vs "Rush Tech MZ" vs resíduos de **"Contratuz"** (nome antigo do projeto) em `alt=` de imagens.
6. **`types/index.ts` tem interfaces duplicadas/conflituantes** (`BaseQueryParams`, `*QueryParams` aparecem 2x com `q` vs `search`).
7. **As 5 páginas `manage/*`** (categorias, departamentos, documentos, tipos, usuários) repetem ~80 linhas de lógica idêntica cada uma (estado de modais, handlers CRUD, `window.confirm`, formatação de datas/badges) — maior oportunidade de refactor.
8. **`bg-${value.cor}-500`** (classe Tailwind dinâmica) aparece em 4 páginas — não funciona com Tailwind JIT, cor da categoria nunca aparece.
9. Bastante **código morto**: `usePagination.ts`, `useAuthForm.ts`, `AuthInput`/`AuthButton`, `StatsOverview.tsx`, `useStatsCache.ts`, `pagination.tsx`/`table.tsx`/`avatar.tsx`/`separator.tsx` (shadcn não usados), `ToastDemo.tsx`, `ProblemsSection.tsx`, `FAQSection.tsx`, `components/layouts/AdminLayout.tsx`, `components/layouts/UserLayout.tsx`, `UserSidebar.tsx`.

---

## 1. Sistema de Design / Tokens (transversal)

- **CRÍTICO** — `tailwind.config.ts` (paleta "Rush Tech": `primary-blue #1E90FF`, `primary-purple #9D4EDD`, `gradient-primary`, `shadow-soft/medium/strong/gradient`, animações `pulse-slow`/`slide-up`/`float`, breakpoints `xs`/`3xl`) **não é carregado** pelo Tailwind v4. `globals.css` não tem `@config "../tailwind.config.ts"`.
- `globals.css:144-154` define `.gradient-primary`/`.gradient-secondary`/`.gradient-success` com cores **diferentes** (`#667eea→#764ba2`) das do `tailwind.config.ts`/`colors.ts` (`#1E90FF→#9D4EDD`) — 3 paletas "primary" coexistindo.
- `src/styles/colors.ts` (paleta Rush Tech documentada com instruções de uso) **não é importado em lado nenhum** — código morto.
- Coexistem 3-4 sistemas de componentes de input/botão:
  - shadcn `button.tsx`/`input.tsx` (tokens `--primary`, `--ring`, dark mode via CSS vars) — usado pouco.
  - `ModernButton.tsx`/`ModernInput.tsx` (gradiente azul `from-blue-600 to-blue-700`, hardcoded) — usado em `PageHeader`, `FilterPanel`, dashboards.
  - `AuthInput.tsx`/`AuthButton.tsx` — mínimos, **não usados em lado nenhum** (código morto).
  - Forms (`CategoriaForm`, `DepartamentoForm`, `TipoForm`, `UsuarioForm`) usam inputs nativos com classe gigante repetida `focus:ring-indigo-500` — uma 4ª cor de foco (índigo) diferente do azul usado no resto.
  - `DocumentoEditModal.tsx:31-32` define `inputClass` próprio com `focus:ring-blue-500` — 5ª variante.
- Componentes shadcn instalados mas **nunca usados**: `pagination.tsx`, `table.tsx`, `avatar.tsx`, `separator.tsx` — confirmar se vale a pena manter.
- `bg-${value.cor}-500` / `bg-${value?.cor || 'gray'}-500` (classes Tailwind construídas dinamicamente) em:
  - `app/manage/documentos/page.tsx:178`
  - `app/user/documentos/page.tsx:213`
  - `app/user/meus-documentos/page.tsx:228`
  - `app/user/buscar/page.tsx:171`
  → Tailwind JIT não gera estas classes; a cor da categoria nunca aparece visualmente.
- Badges de "Status" (`bg-green-100 text-green-800` / `bg-red-100 text-red-800`) hardcoded e repetidos em pelo menos 9 ficheiros, sem variantes `dark:` — candidatos a `<StatusBadge>` com tokens semânticos (`success`/`destructive`).

---

## 2. Layouts / Sidebars / Navegação (transversal)

### Tabela: página → layout → sidebar atualmente em uso

| Página | Layout | Sidebar | Dark mode | Mobile responsivo | Accent/branding |
|---|---|---|---|---|---|
| `dashboard/admin` | `components/ui/ManageLayout.tsx` | `AdminSidebar.tsx` | Sim | Sim | Vermelho, "Admin Panel" |
| `dashboard/editor` | `components/ui/ManageLayout.tsx` | `AdminSidebar.tsx` | Sim | Sim | Vermelho, "Admin Panel" |
| `dashboard/superadmin` | `components/layouts/SuperadminLayout.tsx` | inline (própria) | **Não** | **Não** | Indigo/cinza, "eiDocs / Rush Tech Admin" |
| `dashboard/user` | `components/ui/UserLayout.tsx` | `Sidebar.tsx` | Sim | Sim | Azul, "eiDocs" |
| `manage/*` (5 páginas) | `ManageLayout.tsx` | `AdminSidebar.tsx` | Sim | Sim | Vermelho, "Admin Panel" |
| `user/documentos`, `meus-documentos`, `buscar`, `configuracoes` | `components/ui/UserLayout.tsx` | `Sidebar.tsx` | Sim | Sim | Azul, "eiDocs" |
| `user/upload` | (confirmar — provavelmente `ui/UserLayout.tsx`) | `Sidebar.tsx` | **Não** (página em si sem `dark:`) | — | Azul |

### Componentes órfãos (não usados pelas rotas atuais)
- `components/layouts/AdminLayout.tsx` (sidebar com SVGs inline, fixed `ml-64`, sem dark/responsivo, `alt="Contratuz Logo"`)
- `components/layouts/UserLayout.tsx` (usa `UserSidebar`, fixed, sem dark/responsivo)
- `components/ui/UserSidebar.tsx` (sem dark mode, sem responsivo, `alt="Contratuz Logo"` x2, item "Configurações" comentado)

### Inconsistências entre as ativas
- `AdminSidebar` (vermelho) é usada tanto por **admin** como por **editor** — branding "Admin Panel" aparece para um "Editor", semanticamente estranho.
- `Sidebar.tsx` (azul, "eiDocs") muda bruscamente para vermelho ao entrar em `manage/*` — sem um design system que explique a troca de cor por área.
- `SuperadminLayout.tsx` é uma 3ª implementação isolada (`bg-gray-900` + `indigo-600`), sem dark mode nem responsividade — sidebar fixa sobrepõe conteúdo em ecrãs pequenos.
- A lógica "destacar item ativo via `usePathname`" está duplicada em `Sidebar.tsx`, `AdminSidebar.tsx`, `UserSidebar.tsx` e `SuperadminLayout.tsx` — 4 cópias.

---

## 3. Autenticação (login / register / forgot-password / reset-password)

- **Login** (`app/login/page.tsx`): gradiente `from-blue-50 to-indigo-100` + botões `bg-blue-600` (l.99,188); logo `alt="eiDocs Logo"` mas título usa "eiDocuments" (l.124); skeleton de loading sem dark mode (l.112); validação mínima (campos `required` apenas, l.60-63); texto "Não tens conta?" em PT-PT, inconsistente com PT-BR do resto.
- **Register** (`app/register/page.tsx`): gradiente `from-indigo-50 via-white to-purple-50` (l.330) — 2ª variação; cor de destaque `indigo-600` em todos os botões/links (l.187,281,309,355) vs `blue-600` no login; logo é um ícone `Building2` em quadrado `bg-indigo-600` (l.335-339) — 3ª representação de marca; `validateStep1/2` duplicam validação que já existe (sem uso) em `useAuthForm.ts`; **Step 3 "Tudo pronto"** → botão "Ir para o dashboard" (l.308-313) faz `router.push("/dashboard")` sem autenticar — possível fluxo quebrado (user não fica logado); `StepIndicator`/`FieldError` definidos inline (l.41-79), não reutilizáveis.
- **Forgot password** (`app/forgot-password/page.tsx`): volta a `from-blue-50 to-indigo-100` + `blue-600` (l.38,110) — alinhado ao login mas não ao register; mensagem de erro genérica (l.22); `catch {}` silencioso esconde erros reais de rede (l.29-31).
- **Reset password** (`app/reset-password/page.tsx`): mesmo gradiente do login; estado "token inválido" (l.51-62) é uma página totalmente à parte sem header/logo padrão; botão "mostrar senha" só no campo "Nova senha" (l.101-108), não em "Confirmar senha" (l.115-127); redirect por `setTimeout` 2.5s sem indicação visual (l.43); validação de senha duplicada manualmente (igual a `register` l.117-118).
- **`useAuthForm.ts`**: hook completo e bem feito, **não importado em lado nenhum** — código morto; as 4 páginas reimplementam validação à sua maneira.
- **`AuthInput.tsx` / `AuthButton.tsx`**: confirmados não usados — código morto. `AuthButton` não tem prop `type` (risco de submit acidental se usado num form).
- **`AuthCard.tsx`**: só usado em `app/demo/page.tsx`; tem paleta própria (`from-blue-50 to-indigo-50` / `from-green-50 to-emerald-50`), sem dark mode.
- Padrão de input com ícone (`relative` + ícone absoluto + `<input>`) repetido manualmente em login/forgot/reset — candidato a componente partilhado.

---

## 4. Landing Page

- Ver item crítico da secção 1 — a maioria dos efeitos visuais (gradientes "Rush Tech", sombras `shadow-soft/strong/gradient`, animações `pulse-slow`/`slide-up`/`delay-*`) **não renderiza**.
- `app/page.tsx`: importa `LandingNav, HeroSection, FeaturesSection, HowItWorksSection, PricingSection, CTASection, LandingFooter`. **`ProblemsSection.tsx` e `FAQSection.tsx` não são importados** — código morto.
  - `ProblemsSection.tsx` exporta um componente chamado `HeroSection` (colide de nome com o `HeroSection.tsx` real) — parece um rascunho alternativo do Hero, mais rico (placeholder de dashboard, ícones de problemas), nunca integrado.
- `LandingNav.tsx`: branding "Rush Tech MZ / Soluções de Informática" (l.88-103) — marca diferente de "eiDocs"/"eiDocuments" usada no resto da app; nome da empresa usa `bg-gradient-primary bg-clip-text text-transparent` (l.98) que, sem o gradiente carregar, deixa o **texto invisível** (transparente sem cor de fallback); link `#faq` (l.35) aponta para secção que não está renderizada (FAQSection não importada) — link morto.
- `HeroSection.tsx`: `border-primary-blue/20`, `text-primary-blue`, `bg-gradient-primary`, `animate-pulse-slow` (l.15-16,21-23,30,59) — todos dependentes do tema não carregado; sem CTA "Já é cliente? Entrar" na própria secção.
- `FeaturesSection.tsx`: `<span className="inline-block px-4 py-2 bg-gradient-primary/10 text-primary-blue ...">` (l.48-49) **vazio**, sem texto — elemento órfão; gradientes por feature (`from-blue-500 to-cyan-500`, `from-purple-500 to-pink-500`, l.12,20,28,36) são uma 4ª paleta de cores na mesma página.
- `HowItWorksSection.tsx`: mesmas dependências `bg-gradient-primary/10`/`text-primary-blue` (l.40,44); array de "steps" com `gradient`/`bgColor` hardcoded por item, padrão duplicado de `FeaturesSection`/`PricingSection`.
- `PricingSection.tsx`: preços "MT" como strings hardcoded sem formatação (l.103); botões "Começar" (l.125-133) **sem `href`/`onClick`** — não levam a lugar nenhum (nem `/register`).
- `Ctasection.tsx`: secção inteira depende de `bg-gradient-primary` (l.9) / `text-primary-blue` (l.21) — sem CSS, fica sem fundo e botão sem cor de texto; nome do ficheiro `Ctasection.tsx` (casing inconsistente vs `LandingFooter.tsx`/`HeroSection.tsx`).
- `LandingFooter.tsx`: `hover:bg-primary-blue` (l.56,59,62) dependente do tema quebrado; email `contato@rushtech.co.mz` (l.52) reforça branding "Rush Tech" vs domínios "eidocuments"/"eidocs" usados noutros locais.

---

## 5. Dashboards (admin / editor / superadmin / user)

- **Erro duplicado**: `dashboard/admin/page.tsx` tem **dois blocos** que renderizam erro (`error && !loading` no topo l.246-264, e outro `{error && (...)}` l.290) — pode duplicar a mensagem na tela.
- `dashboard/editor/page.tsx:48-52` — `console.log` de debug ("🔍 Editor Dashboard Debug") com `user`/`stats`/`error` expostos no browser, em produção.
- `dashboard/editor/page.tsx:83-90` — botão "Atualizar" é `<button>` cru com classes manuais, enquanto admin (l.277) e user (l.233) usam `ModernButton`.
- `dashboard/admin/page.tsx` — estados não usados: `searchTerm`/`setSearchTerm` (l.60), `viewMode`/`setViewMode` (l.62), ícones `Search`/`Grid`/`List`/`SortAsc`/`SortDesc`/`Eye`/`MoreVertical` importados mas não usados (l.8-26); `filteredDepartments` (l.236-240) filtra por `searchTerm` mas **não existe input visível** para o usuário escrever — funcionalidade fantasma.
- Estruturas de página completamente diferentes entre **admin** (4 cards + Atividade Recente/Resumo Rápido + lista Departamentos) e **editor** (4+1 cards + 2 gráficos + Documentos Recentes + 3 quick actions) apesar de partilharem o mesmo layout visual.
- `dashboard/user/page.tsx` — 5 `StatsCard` em `lg:grid-cols-5` (l.253) vs `lg:grid-cols-4` em admin/editor — grelha inconsistente; "Meus Documentos"/"Documentos do Departamento" aparecem **duplicados** como quick action E como stats card clicável (l.79-108 vs l.254-279).
- 3 abordagens de **loading** diferentes: admin = spinner full-page **+** skeletons por card (duplo padrão, l.246-251 e l.306-307); editor = só skeletons (l.111-119); user = spinner full-screen `min-h-screen` (l.186-191).
- Cards de estatística com 3 estilos diferentes entre dashboards: admin `bg-white rounded-lg border p-6` + ícone `w-12 h-12`; editor `text-3xl font-bold` colorido + ícone circular `p-3 bg-X-100 rounded-full`; user usa o componente `StatsCard` (`rounded-xl`, ícone `w-14 h-14`) — "mesmo" conceito, 3 implementações.
- Cores de ícones de stat sem mapeamento consistente: "Categorias/FolderOpen" é amarelo em admin (l.397-399) mas roxo em editor (l.178-180).
- `dashboard/superadmin/page.tsx:17-22` (`PLAN_COLORS`) — 5º esquema de cores (amarelo/azul/roxo/verde) só usado aqui, para badges de plano.
- 3 implementações locais quase idênticas de "documentos recentes": `Document` (admin l.34-45), `Document` (editor l.25-32), `DepartmentDocument` (user l.32-41) — sem tipo partilhado.
- 2 fórmulas diferentes de "crescimento": admin `crescimentoSemanal * 0.8` (l.205-214) vs user `(ativos/total)*100 - 50` (l.110-115) — heurísticas arbitrárias e inconsistentes.
- `app/demo/page.tsx` — confirmado ser página de demonstração de componentes (`ModernInput`, `ModernButton`, `AuthCard`, `AuthLink`, `NotificationDemo`), sem layout/sidebar, rota `/demo` publicamente acessível — provavelmente deve ser removida ou protegida.
- `app/user/page.tsx` — apenas `redirect('/user/documentos')`, sem loading/placeholder; rota redundante face a `/dashboard/user`.
- **Componentes de stats mortos**: `StatsOverview.tsx` (define `StatCard`/`StatCardSkeleton` alternativos com shadcn `Card`, nunca importado); `useStatsCache.ts`/`useStatsWithCache` (cache 5min + auto-refresh, nunca consumido); `useStatsComparison`/`useAutoRefreshStats` em `useStats.ts` (l.120-163, sem consumidores aparentes).
- `dashboard/superadmin/page.tsx:42-129` — `CreateTenantModal` definido inline no ficheiro da página, ao contrário do padrão (componentes em `components/`).

---

## 6. Páginas "Manage" (categorias / departamentos / documentos / tipos / usuários)

### Duplicação estrutural (as 5 páginas)
- ~80 linhas quase idênticas por página: estados (`isFormOpen`, `isDetailOpen`, `selectedX`, `isFilterOpen`, `activeFilters`) + handlers (`handleAdd/Edit/View/Delete/FormSuccess/FormClose/DetailClose/Search`) — candidato a hook `useManagePage<T>()`.
- `handleDelete` repete `window.confirm(...)` + try/catch + `console.error` nas 5 páginas (`categorias:125-137`, `departamentos:87-99`, `documentos:55-67`, `tipos:229-241`, `usuarios:57-69`) — `window.confirm` nativo destoa do resto da UI (shadcn tem `AlertDialog`).
- Coluna "Status" (badge verde/vermelho) e "Data de Criação" (`toLocaleDateString('pt-BR')`) copiadas literalmente nas 5 páginas.
- **`departamentos/page.tsx:244-274`** — `<FilterPanel>` **duplicado 2x** com as mesmas props (copy/paste).
- `tipos/page.tsx:53-91` — lógica de "sanitização de params" única a esta página (sem equivalente nas outras 4).
- `tipos/page.tsx:39-50` — loading screen full-page custom (`animate-spin`) antes de montar `ManageLayout`; nenhuma outra página `manage` faz isto.
- `documentos/page.tsx:82-117` — padrão "buscar registo completo antes de editar/ver" só existe aqui.

### Funcionalidade incompleta / inconsistente
- `categorias/page.tsx:110-114` — `handleApplyFilters` só faz `console.log` (TODO), filtro **não tem efeito**; em `tipos/page.tsx` o filtro já está ligado via `activeFilters`.
- `documentos/page.tsx:320` — botão "Filtrar" só `console.log`; **não existe `FilterPanel`** nesta página (existe nas outras).
- `usuarios/page.tsx:233-234` — `onFilter` e `onExport` são `console.log` placeholders; `onExport` não existe nas outras páginas.
- `departamentos/page.tsx:227` — `onAdd={isAdmin() ? handleAdd : undefined}` sem feedback ao usuário sobre porquê o botão "Adicionar" desaparece.
- `documentos`/`usuarios` não desestruturam `error` de `usePaginatedData`; `categorias`/`departamentos`/`tipos` desestruturam `error` mas **nunca o exibem** na UI.
- Nenhuma página tem empty state customizado (ilustração/CTA) além de `emptyMessage` simples.

### Modais (FormModal / DetailModal / Forms / Details)
- `DetailModal.tsx` e `FormModal.tsx` são **praticamente idênticos** (estrutura, `sizeClasses`, portal, overlay, ESC) — diferem só no `id` do título; candidato a `<Modal>` base único.
- Tamanhos de modal inconsistentes entre criar/ver da mesma entidade: `CategoriaDetail` usa `xl`, mas o `FormModal` de Categoria não define `size` (fica `md`); `TipoDetail` usa `lg` enquanto os outros 4 details usam `xl`, sem motivo aparente.
- 4 forms (`CategoriaForm`, `DepartamentoForm`, `TipoForm`, `UsuarioForm`) repetem quase byte-a-byte `handleInputChange`, `errors: Record<string,string>`, `validateForm()`, e botão submit `bg-indigo-600` idêntico (`CategoriaForm:304-310`, `DepartamentoForm:205-211`, `TipoForm:319-325`, `UsuarioForm:347-353`).
- `checkCodigoExists` replicado quase idêntico em `CategoriaForm:126-135`, `DepartamentoForm:80-89`, `TipoForm:130-139` — candidato a hook `useCodigoUnico`.
- `DocumentoForm.tsx` (760 linhas!) com cascata departamento→categoria→tipo via `useEffect`s encadeados (l.117-187); `DocumentoEditModal.tsx` é **outro** form de edição de documento, com implementação totalmente distinta:
  - `DocumentoEditModal.tsx:191-212` usa `<input type="text">` simples para categoria/tipo guardando **`nome`** em vez de `_id` — possível bug grave ao salvar (envia nome em vez de ObjectId).
  - `DocumentoEditModal.tsx:243` tem opção `"rascunho"` no Status, mas `DocumentoForm.tsx:715-716` só aceita `ativo`/`arquivado` — enums de `status` divergentes entre os dois editores do mesmo recurso.
  - `DocumentoForm` é renderizado em `<FormModal size="lg">`, `DocumentoEditModal` usa `size="xl"`, outros forms usam `md` — 3 tamanhos para "modal de form".
- Validação só no `onSubmit` (sem validação em tempo real/`onBlur`) em todos os forms; erros de submit só vão para `console.error` (`CategoriaForm:159-161`, `DepartamentoForm:113-115`, `TipoForm:163-165`, `UsuarioForm:169-171`, `DocumentoForm:347-349`) — se o toast não disparar, usuário fica sem feedback.
- Emojis usados como indicadores visuais (`ℹ️`, `🔒`, `⚠️`) em `TipoForm.tsx:193-196,228-231,272-274`, `CategoriaForm.tsx:236`, `UsuarioForm.tsx:319` — inconsistente com `lucide-react` usado no resto.
- `DepartamentoForm.tsx:153-157` e `UsuarioForm.tsx:231-235` — `style={{ textTransform: 'uppercase'/'lowercase' }}` redundante (já existe classe Tailwind `uppercase`/`lowercase`).

### Details (Categoria/Departamento/Documento/Tipo/Usuario)
- `formatDate` redefinida de forma idêntica em **5 ficheiros** (`DepartamentoDetail:23-31`, `TipoDetail:24-32`, `CategoriaDetail:52-60`, `UsuarioDetail:107-115`, `DocumentoDetail:43-52`) — candidato a util partilhado.
- Bloco "Informações Básicas" (ícone + nome + badge Ativo/Inativo + grid metadados) replicado nos 5 — candidato a `<DetailHeader>`.
- Bloco "Metadados/Informações do Sistema" replicado nos 5 — candidato a `<SystemInfoFooter>`.
- `getDepartmentName` duplicado em `CategoriaDetail:62-67` e `UsuarioDetail:117-122`, com `// TODO: Buscar nome do departamento` — quando `departamento` vem como string, mostra "Carregando..." **permanentemente** (nunca refaz fetch).
- `UsuarioDetail.tsx:64-105` — `loadStats` é **inteiramente mock** (`Math.random()`, datas/relatórios hardcoded "2024-01-20"); o resultado nem é renderizado — código de demo esquecido.
- `CategoriaDetail.tsx:176`, `TipoDetail.tsx:162,177,192` — filtram estatísticas por **nome** (`cat.categoria === categoria.nome`) em vez de ID — risco de dados cruzados se houver nomes repetidos entre departamentos.
- `DocumentoDetail.tsx:114` — `title=""` no `DetailModal` (os outros 4 details passam título descritivo) — header do modal fica em branco/duplicado.
- `DocumentoDetail.tsx:118` — único com header em gradiente (`from-blue-600 to-blue-400`); os outros 4 usam ícone simples — inconsistência visual forte entre modais "irmãos".

### Hooks / Tipos
- `usePagination.ts` — não usado em lugar nenhum (todas as páginas usam `usePaginatedData.ts`) — código morto.
- `usePaginatedData.ts:9` usa `q` como param de busca; `types/index.ts` tem versões conflituantes de `*QueryParams` com `q` vs `search` — risco real de busca não funcionar para certas entidades.
- `useDocumentos.ts:2` importa `DocumentoQueryParams` de `@/services/documentosService` — **3ª** definição do mesmo tipo, além das 2 já em `types/index.ts`.
- `console.log`/`console.error` com emojis deixados em produção: `UsuarioForm.tsx:161,164`, `tipos/page.tsx:214`.

---

## 7. Área do Usuário (`user/*`) e visualização de documentos

### Layout
- `documentos`, `meus-documentos`, `buscar`, `configuracoes` usam `components/ui/UserLayout.tsx` (com `Sidebar.tsx`, dark mode + mobile) — correto e consistente entre si.
- `components/layouts/UserLayout.tsx` (usa `UserSidebar`, sem dark mode) é código órfão/legado — risco de alguém trocar por engano e perder dark mode/header mobile.

### Dark mode incompleto
- `user/documentos/page.tsx` — células da tabela (`text-gray-900/500/600`, l.138,159,176,194,211,254,270) e badges (l.213,234,241,268-274) **sem `dark:`**, apesar do `UserLayout` ter dark mode — tabela com baixo contraste em modo escuro.
- `user/meus-documentos/page.tsx` — mesmo problema (l.209,229,234-260,269-280).
- `user/buscar/page.tsx` — constrói o **próprio header** manualmente (l.239-338) em vez de `PageHeader` (inconsistente com `documentos`/`meus-documentos`); bloco de "estado inicial"/"sem resultados" (l.366-401) e texto "Buscando por..." (l.354) **sem `dark:`**, enquanto o resto da página tem.
- `user/upload/page.tsx` — **nenhuma classe `dark:`** em toda a página (l.497,610,618...) — destoa fortemente das outras 4 páginas de `user/*`.
- `user/configuracoes/page.tsx` — a **mais consistente** com dark mode (classes centralizadas `inputClass`/`labelClass`, l.8-12); é a única página que expõe `useTheme()` (toggle claro/escuro), escondido numa aba — difícil de descobrir.
- `DocumentPreview.tsx` e `DocumentoViewModal.tsx` — **sem nenhuma classe `dark:`**; abrir o preview a partir de uma página em dark mode mostra um modal totalmente claro.

### Inconsistências entre páginas "irmãs"
- Coluna "Data" chama-se "Data" em `documentos` (l.207) mas "Data de Criação" em `meus-documentos` (l.265).
- `meus-documentos` tem coluna "Status" (`status: 'ativo'|'arquivado'|'rascunho'`, l.276-280) que `documentos` não tem; `documentos` usa "Status" para `ativo: boolean` — dois conceitos de "status" diferentes com o mesmo nome de coluna.
- `emptyMessage` rico (ícone+título+descrição+CTA) em `meus-documentos` (l.337-353) e `buscar` (l.365-374), mas simples string em `documentos` (l.340) — sem CTA "criar documento".
- `formatFileSize`, `formatDate`, `getMovementBadge`/`getStatusBadge` copiados quase ao caractere entre `documentos`, `meus-documentos` e dentro de `DocumentoViewModal.tsx` (l.25-75) — 3 cópias.
- `handleSaveEdit` idêntico entre `documentos` (l.96-133) e `meus-documentos` (l.100-132).
- Imports não usados: `Building2`/`FolderOpen`/`User` em `documentos/page.tsx:8` e `meus-documentos/page.tsx:8`.

### Busca (`user/buscar/page.tsx`)
- `handleSearch` (l.59-74) chama `buscarPorTexto(searchQuery)` **ignorando** o estado `filtros` (categoria, tipoMovimento, datas) — filtros avançados são apenas visuais, não afetam o resultado.
- Campo "Departamento" nos filtros (l.314-318) está sempre desabilitado/pré-preenchido — ocupa espaço para mostrar info já implícita.
- `onSort` é só `console.log` em `buscar`/`documentos`/`meus-documentos` — ordenação de coluna decorativa.
- `buscar` não tem ação "Detalhes" (`DocumentoViewModal`), só "Pré-visualizar"+"Download" — `documentos`/`meus-documentos` têm 3 modos de visualização (preview, detalhes, edição); fluxo inconsistente entre páginas.

### Upload (`user/upload/page.tsx`)
- Vários `console.log` de debug com emojis (l.162-170,397-399,428-430).
- Progress bar (l.432-443) é **simulada** em saltos fixos (20→60→90→100%), não reflete progresso real do upload.
- `isFormValid` (l.467-483) duplica a validação de `handleUpload` (l.345-393) — duas implementações da mesma regra que podem divergir.
- Mensagem "Esta categoria não possui tipos específicos..." duplicada (l.681-683 e l.696).
- Ícones via emoji (`getFileIcon()`, l.335-343: 🖼️📄📝📊📈📃📎) e `ℹ️` (l.696) misturados com `lucide-react` no resto da app.
- Após sucesso, `setTimeout(2000)` redireciona sem indicar visualmente a contagem (l.454-456).

### Outros
- `configuracoes/page.tsx:81` — `alert('As senhas não coincidem')` nativo, em vez do sistema de Toast.
- `documentos/page.tsx:81` — `alert('Você só pode editar...')` nativo, idem.
- `canUserEditDocument` (`documentos/page.tsx:77-94`) compara por `usuarioId === user?._id || usuarioNome === user?.nome` — fallback por nome é frágil (nomes podem repetir).
- Botão de edição desabilitado (l.312-316) é um `<div title=...>` em vez de `<button disabled>` — não acessível via teclado/leitor de ecrã.
- `DocumentPreview.tsx:217` — preview de texto/código usa tema "terminal verde" (`bg-gray-900 text-green-400`), destoante da paleta azul/cinza geral.
- Botão "Download" verde (`DocumentPreview.tsx:392`, `DocumentoViewModal.tsx:101`) vs CTAs primários azuis no resto da app — cor de ação inconsistente.
- `DocumentPreview.tsx:13` — worker do PDF.js carregado de CDN externo (`cdnjs.cloudflare.com`), sem fallback se CDN cair.

---

## 8. Sistema de Toast / Notification

- **Ativo**: `ToastContext.tsx` + `Toast.tsx` + `ToastContainer.tsx` + `useToasts.ts` — `ToastProvider` montado em `app/layout.tsx:41`, `useToastContext` usado em 13+ ficheiros (login, dashboards, hooks CRUD, upload).
- **Morto**: `Notification.tsx` + `NotificationContainer.tsx` + `useNotification.ts` — `NotificationContainer` nunca montado em layout root; `useNotification` só usado em `app/demo/page.tsx`. Replica ~80% da lógica do sistema de Toast.
- `NotificationDemo.tsx` (usado só em `app/demo/page.tsx:226`) na verdade usa `useToastContext` (sistema Toast!), apesar do nome — confuso.
- `app/demo/page.tsx:144-174` — botões da secção "Sistema de Notificações" chamam `success/error/warning/info` de `useNotification`, que **nunca renderiza nada visível** (container não montado) — botões sem efeito visível.
- `src/components/ToastDemo.tsx` — não importado em lado nenhum, código morto.

---

## 9. Branding / Conteúdo

- "Contratuz Logo" em `alt=` de `<img>`: `components/layouts/AdminLayout.tsx:83`, `components/ui/UserSidebar.tsx:76,85` — nome antigo do projeto.
- Nomes de marca coexistindo: "eiDocs" (sidebars/login), "eiDocuments" (título da página, `layout.tsx:19`), "Rush Tech MZ / Soluções de Informática" (landing nav/footer), "Admin Panel" (AdminSidebar/ManageLayout), "Rush Tech Admin" (SuperadminLayout).
- Domínios mencionados: `rushtech.co.mz` (footer), `app.eidocuments.com` (ProblemsSection, não usado) — sem padronização.
- Mistura de registo formal/informal PT: "Não tens conta?" (PT-PT informal) vs "sua conta"/"você" (PT-BR) noutras páginas.

---

## 10. Código morto — lista para remoção (a confirmar caso a caso)

- `src/hooks/usePagination.ts`
- `src/hooks/useAuthForm.ts`
- `src/hooks/useStatsCache.ts` (`useStatsWithCache`)
- `src/hooks/useStats.ts` — `useStatsComparison`, `useAutoRefreshStats` (a confirmar)
- `src/components/ui/AuthInput.tsx`, `AuthButton.tsx`
- `src/components/ui/StatsOverview.tsx`
- `src/components/ui/pagination.tsx`, `table.tsx`, `avatar.tsx`, `separator.tsx` (shadcn não usados)
- `src/components/ui/Notification.tsx`, `NotificationContainer.tsx`, `src/hooks/useNotification.ts`
- `src/components/ToastDemo.tsx`
- `src/components/landing/ProblemsSection.tsx`, `FAQSection.tsx` (ou integrá-los, ver secção 4)
- `src/components/layouts/AdminLayout.tsx`, `src/components/layouts/UserLayout.tsx`, `src/components/ui/UserSidebar.tsx`
- `src/styles/colors.ts` (ou usar como fonte real do design system — ver secção 1)
- `src/app/demo/page.tsx` + `NotificationDemo.tsx` (avaliar remover/proteger rota `/demo`)

---

## 11. Sugestão de ordem de refinamento (para discutirmos)

1. **Fundação do design system**: decidir paleta/tokens definitivos (Rush Tech vs shadcn oklch), corrigir `tailwind.config.ts`/`@config` ou migrar tudo para tokens CSS do `globals.css`; resolver dark mode como requisito transversal.
2. **Unificar layouts/sidebars** num único componente parametrizado por role (resolve tabela da secção 2) — maior impacto visual/estrutural de uma vez.
3. **Unificar `FormModal`/`DetailModal`** num `<Modal>` base + `<StatusBadge>`, `formatDate()`, `<DetailHeader>`, `<SystemInfoFooter>` partilhados.
4. **Refatorar as 5 páginas `manage/*`** com hook `useManagePage<T>()` partilhado + corrigir filtros/exports placeholder.
5. **Páginas `user/*`**: dark mode em falta (`upload`, `DocumentPreview`, `DocumentoViewModal`), unificar `documentos`/`meus-documentos`/`buscar`.
6. **Autenticação**: unificar paleta entre login/register/forgot/reset, ligar `useAuthForm` (ou remover), revisar fluxo pós-registo.
7. **Landing page**: depois da fundação do design system, revisitar todas as secções (incluir/descartar `ProblemsSection`/`FAQSection`).
8. **Limpeza final** de código morto (secção 10) e resolução dos tipos duplicados em `types/index.ts`.

---

*Gerado a partir de leitura estática do código (sem servidor a correr — backend depende de MongoDB local indisponível neste ambiente). Itens marcados "a confirmar" devem ser revalidados antes de remover código.*
