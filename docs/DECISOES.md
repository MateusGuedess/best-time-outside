# Registro de Decisões

Documento vivo com as decisões técnicas e de produto do app "Melhor horário para sair".
Cada decisão traz contexto, alternativas avaliadas, prós e contras, e o motivo da escolha.

**Status possíveis:** `Proposta` (aguardando validação) · `Aceita` · `Substituída` (aponta para a nova decisão)

---

## Sumário

| #   | Decisão                              | Escolha                                                  | Status |
| --- | ------------------------------------ | -------------------------------------------------------- | ------ |
| 001 | Plataforma base                      | Expo (managed workflow)                                  | Aceita |
| 002 | Linguagem                            | TypeScript (strict)                                      | Aceita |
| 003 | Navegação                            | Expo Router                                              | Aceita |
| 004 | Estado de servidor e de cliente      | TanStack Query, sem lib de estado global                 | Aceita |
| 005 | Validação das respostas da API       | Zod                                                      | Aceita |
| 006 | Cliente HTTP                         | `fetch` nativo + wrapper fino                            | Aceita |
| 007 | Estilização                          | NativeWind v4 + tema semântico                           | Aceita |
| 008 | Organização de pastas                | Por tipo + algoritmo isolado                             | Aceita |
| 009 | Algoritmo de recomendação            | Score × chuva + janela, dia e noite                      | Aceita |
| 010 | Horizonte da recomendação            | Dia + noite (até 02h), fallback amanhã                   | Aceita |
| 011 | UX da busca                          | Debounce 350 ms, mínimo 2 caracteres                     | Aceita |
| 012 | Persistência local (buscas recentes) | AsyncStorage + validação Zod                             | Aceita |
| 013 | Idioma, unidades e fuso              | pt/en/es (i18next), unidades do aparelho, fuso da cidade | Aceita |
| 014 | Estratégia de testes                 | Jest + RNTL, foco no domínio                             | Aceita |
| 015 | Qualidade de código                  | ESLint + Prettier + `tsc` no CI                          | Aceita |

---

## 001 — Plataforma base: Expo (managed workflow)

**Status:** Aceita

**Contexto:** o avaliador precisa rodar o projeto com o mínimo de atrito. O app não usa nenhum módulo nativo exótico.

| Alternativa        | Prós                                                                                                                                                                                                                                 | Contras                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Expo (managed)** | Roda com `npx expo start` + Expo Go, sem Android Studio/Xcode. É a recomendação oficial da documentação do React Native para novos projetos. Inclui SDKs prontos (location, storage, fonts). Builds na nuvem via EAS, se necessário. | Menos controle sobre o código nativo (mitigado por _prebuild_ / dev client, caso precise). Bundle um pouco maior.    |
| React Native CLI   | Controle total sobre o nativo.                                                                                                                                                                                                       | Setup pesado para o avaliador (JDK, Android SDK, CocoaPods). Mais tempo gasto com infraestrutura do que com produto. |

**Decisão:** Expo. O teste avalia UX e produto, não configuração de nativo, e a facilidade de rodar faz parte da experiência de quem avalia. O app é simples e não justifica o custo de manter Gradle e Xcode build system.

**Observações:**

- Expo não é uma alternativa _ao_ React Native: é um framework sobre ele, recomendado pela documentação oficial do RN para novos projetos.
- **Necessidade nativa futura não reabre a decisão:** com Continuous Native Generation (`expo prebuild`) e _config plugins_, customizações nativas são declaradas no `app.json`. As pastas `android/` e `ios/` são geradas, não versionadas nem editadas à mão.

**Riscos e mitigações:**

| Risco                                                                                          | Mitigação                                                                                                 |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| O Expo Go da loja só suporta o SDK mais recente. O avaliador pode ter uma versão incompatível. | Versão do SDK travada e explícita no README. Alternativa documentada: `npx expo run:android` / `run:ios`. |
| O avaliador pode não querer configurar nada.                                                   | (Opcional) APK gerado via EAS Build com link no README.                                                   |

**Versão do SDK: 57, não 58 (revisado em 2026-10-17).** O projeto foi criado no SDK 58 (estável desde 15/10), mas o Expo Go das lojas ainda roda só o SDK 57: o aparelho mostra _"Project is incompatible with this version of Expo Go"_. A versão de loja do SDK 58 chega "em algumas semanas", sem data garantida antes da entrega. No iPhone, rodar o SDK 58 exigiria gerar um Expo Go próprio (`eas go`) com conta Apple Developer paga. Voltar para o 57 custou pouco (só havia o scaffold) e garante que o avaliador abra o app com o Expo Go que já tem instalado. Critério: **o SDK que o avaliador consegue rodar, não o mais novo.**

---

## 002 — Linguagem: TypeScript em modo strict

**Status:** Aceita

| Alternativa    | Prós                                                                                                           | Contras                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **TypeScript** | Tipos documentam os contratos da API e do domínio. Refatoração segura. É o padrão de mercado para vaga sênior. | Um pouco mais de verbosidade.                                                             |
| JavaScript     | Mais rápido de escrever.                                                                                       | Sem garantia de contrato. Passa uma impressão pior em avaliação de organização de código. |

**Decisão:** TypeScript com `strict: true`. Os tipos das respostas da API são **inferidos dos schemas Zod** (ver 005), para não duplicar definições.

**Por que `strict`:** liga `strictNullChecks` (obriga a tratar `null`/`undefined`, a principal fonte de crashes), `noImplicitAny`, `useUnknownInCatchVariables`, entre outras. Sem ele, o TS oferece pouca garantia real.

**Limite do TypeScript e papel do Zod:** tipos são apagados no build e não verificam dados externos. `res.json() as T` é uma afirmação não verificada. Exemplo concreto: a Geocoding API **omite** a chave `results` quando não há resultados. Regra adotada: **todo dado externo é `unknown` até passar por um schema**, e os tipos vêm de `z.infer`.

**`tsconfig.json`:**

| Opção                        | Valor                | Motivo                                                                                                                                                                                                                  |
| ---------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extends`                    | `expo/tsconfig.base` | JSX, `moduleResolution` e `target` corretos para o Metro, mantidos pelo Expo.                                                                                                                                           |
| `strict`                     | `true`               | Ver acima.                                                                                                                                                                                                              |
| `noUncheckedIndexedAccess`   | `true`               | Não faz parte do `strict`. A Forecast API retorna arrays paralelos (`hourly.time[i]`, `hourly.temperature_2m[i]`), e a flag tipa `arr[i]` como `T \| undefined`, protegendo o algoritmo, que é todo baseado em índices. |
| `exactOptionalPropertyTypes` | desligado            | Correto na teoria, mas gera atrito com tipos de bibliotecas com pouco ganho neste projeto.                                                                                                                              |
| `paths`                      | `@/*` → `src/*`      | Imports legíveis, sem `../../../`.                                                                                                                                                                                      |

**Atenção:** o Metro/Babel remove tipos **sem checá-los**, então o app roda mesmo com erro de tipo. A verificação real acontece com `tsc --noEmit` no script `check` e no CI (ver 015).

---

## 003 — Navegação: Expo Router

**Status:** Aceita

**Contexto:** o app tem duas telas em fluxo linear: busca → recomendação da cidade.

**Observação:** o Expo Router é construído **sobre** o React Navigation (o `Stack` dele é o `native-stack`). A escolha real é _como declarar rotas_: por arquivos ou por código.

| Alternativa                  | Prós                                                                                                                                                              | Contras                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Expo Router**              | Rotas por arquivos: a estrutura de pastas é o mapa do app. Deep links automáticos (`/city/[id]`), rotas tipadas, padrão do `create-expo-app`, coerente com a 001. | Convenções a conhecer (`_layout`, `[param]`, grupos). Acoplado ao Expo. A pasta `app/` mistura rotas e telas, se não houver disciplina. |
| React Navigation (v7)        | Explícito, sem "mágica", funciona fora do Expo, padrão histórico do mercado. A API estática da v7 reduziu o boilerplate e infere tipos.                           | Deep linking e tipagem exigem mais configuração. Sem ganho real para duas telas dentro do Expo.                                         |
| Sem navegação (estado local) | Mínimo absoluto.                                                                                                                                                  | Sem gesto/botão de voltar nativo e sem deep link. Não escala.                                                                           |

**Decisão:** Expo Router.

```
src/app/
  _layout.tsx      → Stack + providers (QueryClient, tema)
  index.tsx        → busca
  city/[id].tsx    → recomendação
```

Arquivos em `src/app/` são as telas e compõem componentes de `src/components` (ver 008).

### Subdecisão: o que trafega como parâmetro de rota

**Princípio:** params de rota carregam **identidade** (quem: o `id`), não **dados** (como: nome, coordenadas, fuso). Os dados vêm de uma fonte de verdade: a API, com o cache do TanStack Query na frente.

| Opção                                    | Prós                                                   | Contras                                                                             |
| ---------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Objeto da cidade nos params              | Nenhuma requisição extra.                              | Params precisam ser serializáveis e viram URL. O deep link quebra. Anti-pattern.    |
| `lat`/`lon`/`name`/`timezone` nos params | Sem requisição extra. O deep link funciona.            | URL vira transporte de dados, feia e manipulável. Cópia que pode divergir da fonte. |
| **Só `id` + busca por id**               | URL limpa, deep link funciona, fonte única de verdade. | Uma requisição extra, **eliminada pelo cache semeado** (abaixo).                    |

**Como evitamos a requisição duplicada:** ao tocar num resultado da busca, a cidade já está em mãos. Ela é gravada no cache antes de navegar:

```ts
queryClient.setQueryData(cityKeys.detail(city.id, language), city);
router.push(`/city/${city.id}`);
```

A tela chama `useCity(id)`. Vindo da busca, o dado já está no cache (render instantâneo). Vindo de deep link, faz `GET /v1/get?id=…` (endpoint de busca por id, verificado na API).

### Query keys

Centralizadas numa **query key factory**, em ordem hierárquica `[domínio, tipo, parâmetros]`, do mais genérico para o mais específico. Isso evita colisões e permite invalidar grupos por prefixo (`["city"]` invalida tudo de cidade, `["city", "search"]` só as buscas).

```ts
export const cityKeys = {
  all: ["city"] as const,
  search: (term: string, language: Language) => ["city", "search", { term, language }] as const,
  detail: (id: number, language: Language) => ["city", "detail", { id, language }] as const,
};

export const forecastKeys = {
  all: ["forecast"] as const,
  byCoords: (coords: { lat: number; lon: number }) => ["forecast", coords] as const,
};
```

A comparação é posicional nos itens do array, mas **ignora a ordem das propriedades dentro de objetos**. Por isso a previsão usa um objeto `{ lat, lon }` no último nível.

**O idioma faz parte da key de cidade:** a Geocoding API devolve nomes traduzidos ("Lisboa" em `pt`, "Lisbon" em `en`, ver 013). Sem o idioma na key, trocar o idioma do aparelho serviria do cache nomes no idioma antigo.

### UX de navegação

- `Stack` nativo: gesto de voltar e animações da plataforma (UINavigationController / Fragments).
- Nome da cidade no header, com o botão voltar nativo.
- Sem tabs ou drawer: com duas telas em fluxo linear, seriam navegação sem propósito.

---

## 004 — Estado de servidor: TanStack Query

**Status:** Aceita

**Contexto:** todo o estado relevante vem da API. Precisamos de loading, erro, retry, cache e cancelamento de buscas obsoletas.

| Alternativa               | Prós                                                                                                                                                                                                     | Contras                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **TanStack Query**        | Cache por chave: voltar para uma cidade já vista é instantâneo. `retry`, `staleTime`, cancelamento via `AbortSignal`, `placeholderData` para a busca não "piscar". Estados de loading/erro padronizados. | Dependência extra (~13 kB gzip). Exige entender as chaves de query.                                          |
| `useEffect` + `fetch`     | Zero dependências.                                                                                                                                                                                       | Race conditions na busca digitada, sem cache, e acabamos reimplementando metade do TanStack Query, com bugs. |
| Redux Toolkit / RTK Query | Robusto.                                                                                                                                                                                                 | Excessivo para um app sem estado global de cliente.                                                          |
| SWR                       | Leve e simples.                                                                                                                                                                                          | Menos controle sobre mutations e cancelamento. Menor adoção em RN.                                           |

**Decisão:** TanStack Query. Não haverá biblioteca de estado global: o pouco estado de cliente (buscas recentes, preferência de atividade) fica em hooks (ver "Estado de cliente" abaixo).

### Estado de cliente

O estado é separado pela **origem**, e cada tipo fica onde já tem dono:

| Tipo                 | Exemplos no app                           | Onde fica                                   |
| -------------------- | ----------------------------------------- | ------------------------------------------- |
| Estado de servidor   | Busca de cidades, cidade por id, previsão | TanStack Query (cache, retry, cancelamento) |
| Estado local de tela | Texto do campo de busca                   | `useState` na própria tela                  |
| Estado da URL        | Cidade selecionada                        | Parâmetro de rota (`/city/[id]`, ver 003)   |
| Estado persistido    | Buscas recentes                           | Hook `useRecentCities` + AsyncStorage (012) |

Quase tudo que um Redux/Zustand guardaria aqui é estado de servidor, que já é do TanStack Query. Uma lib de estado global seria ferramenta sem problema para resolver.

**Buscas recentes: `useState` dentro do hook, por enquanto.** Cada chamada de um hook com `useState` tem sua própria cópia do estado. Isso só é problema se duas telas lerem/gravarem a lista ao mesmo tempo. Hoje, só a tela de busca usa a lista, e ela continua montada na pilha enquanto a cidade está aberta: ao voltar, a lista já está atualizada.

- **Gatilho para mudar:** uma segunda tela usando a lista (ex.: um perfil com "limpar histórico"). Aí o hook passa a usar `useQuery(["recentCities"])` para ler o storage e `useMutation` + invalidação para gravar, sincronizando as telas sem provider extra e no mesmo padrão do resto do app.
- **Custo da mudança:** um arquivo. A interface do hook (`{ cities, add, … }`) não muda, e as telas não sabem onde a lista é guardada.

### Arquitetura da camada de dados (004 + 005 + 006)

```
SearchScreen                             ← só UI: { cities, isIdle, isSearching, error }
  ↓ useCitySearch(term)                  ← hook da feature: debounce, enabled, placeholder
  ↓ useQuery(key, queryFn)               ← cache, retry, cancelamento        [004]
  ↓ searchCities(term, language, signal) ← client: monta a URL
  ↓ httpGet(url, schema, signal)         ← fetch + erros tipados             [006]
  ↓ schema.parse(json)                   ← valida e normaliza                [005]
City[]                                   ← objeto de domínio
```

Cada camada só conhece a de baixo: a tela não sabe que existe `fetch`, e o `httpGet` não sabe que existe React.

### Configuração por tipo de dado

| Query                                | `staleTime` | `gcTime` | Motivo                                                                                                                                                                                                            |
| ------------------------------------ | ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Busca de cidades (`cityKeys.search`) | 24 h        | 24 h     | Cidades não mudam. Poucos KB em memória.                                                                                                                                                                          |
| Cidade por id (`cityKeys.detail`)    | 24 h        | 24 h     | Idem.                                                                                                                                                                                                             |
| Previsão (`forecastKeys.byCoords`)   | 15 min      | 30 min   | Muda, mas não a cada segundo. Até 30 min, a previsão antiga aparece na hora e é atualizada em segundo plano. Depois disso, o loading é mais honesto que uma recomendação de horas atrás que muda sozinha na tela. |

**`gcTime` ≥ `staleTime`:** o `gcTime` só conta quando nenhuma tela usa a query e, ao expirar, apaga o dado. Se fosse menor que o `staleTime`, o dado sumiria antes de deixar de ser fresco, e o `staleTime` não valeria depois que a pessoa sai da tela.

**O cache é em memória:** fechar o app (ou o sistema matar o processo) zera tudo. O que precisa sobreviver ao fechamento, as buscas recentes, vai para o AsyncStorage (012). Tocar numa cidade recente semeia o cache, como um resultado de busca. Um _persister_ do TanStack Query não se paga aqui.

**Foco do app (`useAppStateFocus`):** no navegador, o TanStack Query refaz queries stale quando a aba volta ao foco. No RN esse evento não existe, então o `focusManager` é ligado ao `AppState`. Ao voltar do segundo plano, a previsão stale é atualizada sem a pessoa sair da tela. Dado ainda fresco não gera requisição.

**Retry seletivo:** `retry: (count, error) => isRetryable(error) && count < 2`. Só falhas transitórias (`NetworkError`, `HttpError` 5xx) são repetidas. Repetir erro de contrato (4xx, `ParseError`) só atrasa a mensagem ao usuário.

### Busca: debounce + cancelamento

```ts
const debouncedTerm = useDebouncedValue(term.trim(), 350);

useQuery({
  queryKey: cityKeys.search(debouncedTerm),
  queryFn: ({ signal }) => searchCities(debouncedTerm, signal),
  enabled: debouncedTerm.length >= 2,
  placeholderData: keepPreviousData,
});
```

| Mecanismo                  | Problema que resolve                                                                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Debounce** (350 ms)      | Não dispara requisição a cada tecla, só depois que a pessoa **para** de digitar. _Debounce_, não _throttle_: throttle executa periodicamente durante a digitação, e para busca só o termo final importa. |
| `trim()`                   | `"santa "` e `"santa"` são a mesma key. Evita requisição duplicada.                                                                                                                                      |
| `enabled: length >= 2`     | Termos curtos demais não disparam.                                                                                                                                                                       |
| **`signal` até o `fetch`** | Se a pessoa pausa (requisição sai) e volta a digitar, a requisição antiga é abortada, e uma resposta velha nunca sobrescreve a nova (race condition). Complementa o debounce, não o substitui.           |
| `keepPreviousData`         | Mantém os resultados anteriores na tela durante a nova busca, sem a lista sumir/piscar.                                                                                                                  |

`useDebouncedValue` é implementado no projeto (≈10 linhas com `setTimeout` + cleanup do `useEffect`), sem dependência externa.

**Previsão:** `forecast_days=2` + `timezone=auto` + `daily=sunrise,sunset`. Cobre dia, noite até 02h e o fallback "amanhã" (010) numa única requisição.

---

## 005 — Validação das respostas: Zod

**Status:** Aceita

**Contexto:** a Geocoding API **omite** campos opcionais (ex.: `admin1`, `population`) e retorna **sem a chave `results`** quando não há resultados. Confiar apenas em tipos TS levaria a crashes em runtime.

| Alternativa        | Prós                                                                                                        | Contras                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Zod**            | Valida em runtime e infere os tipos TS (fonte única de verdade). Falhas viram erros tratáveis, não crashes. | ~12 kB. Pequeno custo de parsing (irrelevante para esse volume).               |
| Só tipos TS (`as`) | Zero custo.                                                                                                 | É uma mentira para o compilador: o app quebra se a API mudar ou omitir campos. |
| Valibot            | Bundle menor.                                                                                               | Menos familiar para avaliadores e com ecossistema menor.                       |

**Decisão:** Zod na fronteira de rede. O resto do app consome objetos de domínio já validados e normalizados.

**Validar e normalizar:** o schema não só confere, ele **transforma** a forma da API na forma do domínio. A forma da API não vaza para o app.

| API (Open-Meteo)                                                      | Domínio (app)                                                                |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Arrays paralelos: `hourly.time[i]`, `hourly.apparent_temperature[i]`… | Lista de objetos: `HourlyForecast[]`                                         |
| `snake_case`                                                          | `camelCase`                                                                  |
| `is_day: 0 \| 1`                                                      | `isDay: boolean`                                                             |
| `time: "2026-10-17T14:00"` (local da cidade, sem offset)              | `{ date, hour }` na hora local da cidade, nunca `Date` do aparelho (ver 9.1) |
| Chave `results` ausente                                               | `results: []`                                                                |

Consequências:

- O algoritmo (009) trabalha com `hours.map(score)`, sem índices.
- O acesso por índice (e o `T | undefined` do `noUncheckedIndexedAccess`) fica confinado a **uma única função** de "zip".
- O schema valida que **todos os arrays horários têm o mesmo tamanho**. Divergência vira `ParseError`, nunca dado deslocado em silêncio.

**Valores ausentes na previsão:** o Open-Meteo devolve `null` numa hora sem dado (fim do horizonte, alguns modelos) e `sunrise/sunset` podem faltar em regiões polares. Isso é comportamento documentado, não quebra de contrato: o schema aceita `null` e **descarta só a hora (ou o dia) incompleta**. Os outros campos seguem estritos.

**Lista estrita:** se um item da lista de cidades for inválido, a resposta inteira vira `ParseError`. É uma escolha consciente: a API é estável, e uma quebra de contrato deve aparecer, não ser escondida. A alternativa tolerante (descartar só o item, ou só o campo opcional inválido) fica registrada caso a API se mostre instável.

**Dois schemas por entidade, quando o dado tem mais de uma origem:** a `City` chega da API e também do AsyncStorage (012). `city.schema.ts` descreve a cidade **no formato do app** e é a fonte do tipo `City` (`z.output`). `geocoding.schema.ts` descreve o formato da API e o transforma em `City`. O storage valida direto com o schema de domínio, porque grava o formato do app, não o da API.

---

## 006 — Cliente HTTP: `fetch` nativo + wrapper fino

**Status:** Aceita

| Alternativa           | Prós                                                                                                                                                            | Contras                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **`fetch` + wrapper** | Sem dependência. Suporta `AbortSignal` (integra com o TanStack Query). O wrapper centraliza a base URL, o timeout e a conversão de erros HTTP em erros tipados. | Precisa escrever ~30 linhas.                                    |
| Axios                 | Interceptors e defaults prontos.                                                                                                                                | Dependência sem ganho real aqui: são 2 endpoints GET, sem auth. |

**Decisão:** `fetch` com um `httpGet(url, schema, signal)` que já valida com Zod.

**Erros tipados:** cada tipo pede uma reação diferente, por isso não existe um "erro genérico".

| Erro            | Origem                                                  | Mensagem ao usuário                                  | Retry? |
| --------------- | ------------------------------------------------------- | ---------------------------------------------------- | ------ |
| `NetworkError`  | `fetch` rejeitou (sem internet, DNS, abort por timeout) | "Sem conexão. Verifique sua internet."               | Sim    |
| `HttpError` 5xx | Servidor instável                                       | "O serviço de clima está instável. Tente novamente." | Sim    |
| `HttpError` 4xx | Requisição inválida                                     | "Não foi possível carregar."                         | Não    |
| `ParseError`    | Resposta fora do contrato (Zod)                         | "Não foi possível carregar."                         | Não    |

Cancelamentos disparados pelo TanStack Query (via `signal`) **não** são exibidos como erro.

---

## 007 — Estilização: NativeWind com tema semântico

**Status:** Aceita

**Contexto:** o critério de avaliação pede uma interface simples e elegante. A consistência visual vem dos **tokens semânticos**, não da biblioteca. Em RN não há cascata nem seletores, então a consistência precisa vir de valores compartilhados.

| Alternativa                     | Prós                                                                                                                                    | Contras                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **NativeWind v4 (Tailwind v3)** | Produtividade e **domínio prévio da ferramenta** (relevante com prazo de 5 dias). Tema centralizado via variáveis CSS. Roda no Expo Go. | Setup em Babel/Metro/Tailwind. Risco de compatibilidade com o SDK do Expo. Strings de classe longas, se não houver disciplina. |
| `StyleSheet` + tokens próprios  | Zero dependências, API nativa, todo dev RN lê.                                                                                          | Mais verboso. O tema dinâmico exige um padrão próprio (`useStyles` + `useMemo`).                                               |
| Unistyles                       | Troca de tema sem re-render, ótima performance.                                                                                         | Exige dev build, não roda no Expo Go (conflita com 001).                                                                       |
| Tamagui / Gluestack (UI kits)   | Componentes prontos.                                                                                                                    | Setup pesado, visual genérico, esconde as decisões de UI avaliadas.                                                            |
| styled-components / Emotion     | Familiar para quem vem da web.                                                                                                          | Custo de runtime, pouco usado em RN moderno.                                                                                   |

**Decisão:** NativeWind **4.x estável** (4.2.7 na data da decisão). A 5.0 (Tailwind v4) está em RC, e um release candidate com prazo curto é risco sem ganho.

**Histórico:** a proposta inicial era `StyleSheet` + tokens. A mudança foi motivada pela familiaridade com Tailwind (produtividade sob prazo), mantendo a mesma disciplina de tokens semânticos.

### Regras de uso

1. **Tokens semânticos, nunca valores crus:** `bg-surface`, `text-muted`, `bg-score-good`, e não `bg-white` ou `text-slate-500`. O nome descreve o **papel**, não a cor.
2. **Dark mode num único lugar:** cores definidas como variáveis CSS (`:root` / `.dark`) em `global.css` e referenciadas no `tailwind.config.js`. Componentes **não usam o prefixo `dark:`**.
3. **Variantes com `tailwind-variants`:** componentes com variação (`Badge`, `Button`, `Card`) expõem uma API tipada (`score: "good" | "ok" | "bad"`) em vez de concatenar strings com `if`.
4. **`className` só acrescenta, nunca sobrescreve a variante:** sem `tailwind-merge`, duas classes conflitantes (`text-text` + `text-background`) não se resolvem pela ordem na string, e sim pela ordem no CSS gerado. Na revisão, isso deixou o texto do botão "Tentar novamente" ilegível e a bandeira pequena. Cor, tamanho e peso de texto mudam por variante (`onAccent`, `emoji`). A `className` fica para layout (margem, alinhamento).
5. **Classes sempre escritas por inteiro:** `bg-${cor}` não funciona, porque o Tailwind só gera classes que encontra literalmente no código. A variação é feita via `tv()`.
6. **Componentes base** (`Text`, `Card`, `Badge`, `Screen`) para evitar strings longas repetidas.

### Princípios de design (independentes da lib)

- **Interface neutra com um único acento.** As cores de score (`good` / `ok` / `bad`) são **semânticas**: indicam a qualidade da hora, não decoram.
- **Cor nunca é a única informação:** o score sempre vem com texto ou ícone ("Ótimo", "Bom", "Evite"), por acessibilidade (daltonismo).
- **Identidade visual própria:** não reproduz a marca do PicPay.
- **Fonte do sistema** (SF / Roboto): aparência nativa, sem custo de carregamento.
- **Escala de fonte do sistema respeitada** (`allowFontScaling` padrão). `maxFontSizeMultiplier` só onde o layout quebraria.
- **Área de toque mínima de 44×44 pt** (Apple HIG; Android recomenda 48 dp).

### Pendência: paleta de cores

**Os valores das cores ainda não foram definidos.** Está decidida apenas a estrutura: os tokens `background`, `surface`, `text`, `muted`, `accent`, `score-good`, `score-ok`, `score-bad`, cada um com versão clara e escura. A paleta será escolhida durante a construção da UI, com as telas reais, para validar contraste (WCAG AA: 4.5:1 para texto) e harmonia.

### Riscos e mitigações

| Risco                                                                                | Mitigação                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incompatibilidade entre o NativeWind 4.x e o SDK do Expo (dependência do Reanimated) | **Spike de até ~1 h** na criação do projeto: uma tela com `className` + troca claro/escuro funcionando no Expo Go. Se falhar, volta para `StyleSheet` + tokens, com os mesmos tokens e princípios. |
| Avaliador sem familiaridade com Tailwind                                             | Nomes semânticos legíveis por si (`bg-surface`). O README explica o tema.                                                                                                                          |
| Strings de classe longas                                                             | Componentes base + `tailwind-variants`.                                                                                                                                                            |

---

## 008 — Organização de pastas: por tipo + algoritmo isolado

**Status:** Aceita

**Contexto:** app de 2 telas, avaliado por desenvolvedores React Native. A estrutura precisa ser reconhecível de imediato e deixar evidente onde está a regra de negócio.

| Alternativa                                                | Prós                                                                                                                                           | Contras                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Por tipo + algoritmo isolado**                           | Convenção do template `create-expo-app` e a mais comum na comunidade RN: o avaliador se orienta na hora. O algoritmo fica separado e testável. | Em apps grandes, uma funcionalidade se espalha por várias pastas (não é o caso aqui).   |
| Por feature (_Bulletproof React_, _Feature-Sliced Design_) | Escala bem em codebases grandes, com muitos times.                                                                                             | Estrutura para um problema inexistente em 2 telas. Menos familiar no ecossistema Expo.  |
| Clean Architecture (use cases, repositories, adapters)     | Separação máxima.                                                                                                                              | Herança de backend/nativo. Cerimônia que não se paga com 2 endpoints: over-engineering. |

**Decisão:**

```
src/
  app/                        # rotas = telas (Expo Router; convenção src/app do template atual)
    _layout.tsx               #   Stack + providers
    index.tsx                 #   busca
    city/[id].tsx             #   recomendação
  components/
    ui/                       # genéricos, sem domínio: Text, Card, Badge, Input, Screen, EmptyState, ErrorState
    CityListItem.tsx          # de domínio: conhecem City / Recommendation
    RecentCities.tsx
    RecommendationCard.tsx
    HourlyTimeline.tsx
  hooks/                      # useCitySearch, useCity, useForecast, useDebouncedValue, useRecentCities, useLanguage
  services/                   # comunicação: http.ts, queryKeys.ts, geocoding.ts, forecast.ts
  schemas/                    # Zod: city.schema.ts (domínio), geocoding.schema.ts e forecast.schema.ts (API)
  types/                      # tipos do app: city.ts, forecast.ts, recommendation.ts
  recommendation/             # algoritmo: funções PURAS, sem React (score, window, describe, suggestions, config)
  i18n/                       # configuração do i18next + locales/{pt,en,es}.json (013)
  test/                       # helpers de teste (QueryClient de teste)
  __tests__/                  # testes de tela (fora de app/, ver regra 1)
global.css                    # variáveis de tema claro/escuro (007)
tailwind.config.js
```

### Regras

1. **Telas moram em `src/app/`** (convenção do template atual do Expo). Com Expo Router, o arquivo de rota é a tela. Uma pasta `screens/` seria duplicação.
   - **Nada além de rotas em `src/app/`:** o Expo Router transforma todo arquivo da pasta em rota, inclusive `*.test.tsx`, e quebra o bundle. Testes de tela ficam em `src/__tests__/`.
2. **Componentes separados por reuso, não por assunto.** Critério: "o componente conhece o domínio (cidade, clima)?" Não → `ui/`. Sim → `components/`. Com poucos componentes de domínio, sem subpastas.
3. **Sem wrapper sem ganho.** Não existe `SearchInput` (é o `Input` com ícone via prop) nem `CityList` (é um `FlatList` direto).
4. **O formato da API não sai de `schemas/`.** Cada schema tem tipo de entrada (`z.input`, formato Open-Meteo) e de saída (`z.output`, formato do app). Componentes, hooks e algoritmo importam só de `types/`. Trocar de API afeta apenas `schemas/` e `services/`.
5. **`src/recommendation/` não importa React, Zod nem services.** Recebe `HourlyForecast[]` e devolve `Recommendation`. Testável sem renderização e sem mock de rede.

---

## 009 — Algoritmo de recomendação

**Status:** Aceita

**Contexto:** é o critério "transformar dados brutos em uma experiência útil". A lógica precisa ser explicável em uma frase para o usuário e em um parágrafo no README.

| Alternativa                                                   | Prós                                                                                                           | Contras                                                                                                             |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Score 0–100 por hora (faixas graduais) + janela expandida** | Gradual (25°C > 28°C > 30°C). Fácil de calibrar e testar. Gera os motivos ("vento leve") a partir dos fatores. | Parâmetros arbitrários (mitigado: constantes nomeadas e documentadas em `config.ts`).                               |
| Regras booleanas ("temp entre X e Y E chuva < Z")             | Simplíssimo.                                                                                                   | 17,9°C e 18°C viram opostos, 28°C e 33°C viram iguais. Muitas vezes retorna "nenhum" ou "todos". Não ordena opções. |
| `weather_code` como critério principal                        | Semântico.                                                                                                     | Grosseiro demais para diferenciar horas parecidas.                                                                  |

### 9.1 Fuso horário da cidade

A Forecast API (`timezone=auto`) devolve horários **locais da cidade sem offset** (`"2026-10-17T14:00"`) e informa `utc_offset_seconds`. `new Date("2026-10-17T14:00")` seria interpretado no fuso **do aparelho**, deslocando tudo ao buscar uma cidade em outro fuso. Por isso:

- O "agora" é calculado **no fuso da cidade** a partir de `utc_offset_seconds`.
- O domínio trabalha com hora local da cidade (`{ date: "2026-10-17", hour: 14 }`), nunca com `Date` do aparelho.

### 9.2 Períodos e horas candidatas

A recomendação é dividida em **dois períodos**, porque são usos diferentes (correr de manhã ≠ sair para um bar).

| Período   | Horas candidatas                          | Fatores                            |
| --------- | ----------------------------------------- | ---------------------------------- |
| **Dia**   | Da hora atual até o pôr do sol            | Temperatura, vento, UV, chuva      |
| **Noite** | Do pôr do sol até **02h** do dia seguinte | Temperatura, vento, chuva (sem UV) |

- Horas que já passaram nunca entram. A hora atual entra (às 14h10, "14h" ainda é útil).
- O pôr e o nascer do sol vêm de `daily=sunrise,sunset` (mesma requisição), com precisão de minutos.

### 9.3 Nota de cada fator: funções em trapézio

Cada fator vira uma nota de 0 a 1: é 1 na faixa ideal e cai **linearmente** até 0 nos limites.

| Fator       | Variável                                  | Ideal (nota 1) | Nota 0 em         |
| ----------- | ----------------------------------------- | -------------- | ----------------- |
| Temperatura | `apparent_temperature` (sensação térmica) | **18–26 °C**   | ≤ 8 °C ou ≥ 34 °C |
| Chuva       | `precipitation_probability`               | 0–10%          | ≥ 70%             |
| Vento       | `wind_speed_10m`                          | 0–15 km/h      | ≥ 40 km/h         |
| UV          | `uv_index`                                | 0–5            | ≥ 11              |

Exemplo (temperatura): 22°C → 1.0 · 28°C → 0.75 · 30°C → 0.5 · 34°C → 0.

**Sensação térmica, não temperatura:** já considera umidade e vento, ou seja, o que a pessoa sente.

### 9.4 Combinação: conforto × chuva + veto

```
conforto = 0.55 × temperatura + 0.25 × vento + 0.20 × UV
score    = conforto × nota_chuva × nota_ventania × 100
veto     : weather_code 95–99 (tempestade) → score = 0
```

`nota_ventania` é um trapézio à parte: 1 até 30 km/h, cai até 0 em 50 km/h. Abaixo de 30 km/h só o vento de conforto atua.

À noite, sem UV, os pesos de conforto são redistribuídos: **0.70 temperatura + 0.30 vento**.

**Motivo:** uma média ponderada simples deixa um fator ruim ser compensado pelos bons. Temperatura perfeita, sem vento e com 90% de chuva daria 65 ("Bom"), recomendando sair na chuva. Os fatores de **conforto** se compensam entre si (um pouco de vento num dia perfeito é tolerável). A **chuva** é eliminatória e **multiplica**. Tempestade é questão de segurança: veto explícito.

**Revisão (19/10/2026): vento forte também é eliminatório.** Com a fórmula original, 22°C, sem chuva e vento de 45 km/h davam 75 ("Ótimo"): o vento zerava só os seus 25% de conforto. "Um pouco de vento" se compensa; ventania, não. Em vez de veto (corte brusco), o vento acima de 30 km/h passa a **multiplicar** como a chuva: 35 km/h → 60 ("Bom"), 45 km/h → 19 ("Evite"). UV extremo segue compensável, porque o card já mostra o alerta de UV.

| Alternativa             | Por que não                                     |
| ----------------------- | ----------------------------------------------- |
| Média ponderada simples | Recomendaria sair na chuva (exemplo acima).     |
| Mínimo dos fatores      | Rígido demais: um UV 6 limitaria o dia inteiro. |
| Só vetos + média        | Cortes bruscos e regras espalhadas.             |

### 9.5 Janela

1. Encontra a **melhor hora** do período.
2. **Expande** para as horas vizinhas enquanto elas estiverem **a até 10 pontos da melhor e com score ≥ 60**.
3. Tamanho máximo: **4 horas**.

Resultado: "entre 16h e 20h" quando o fim de tarde todo está bom, e "às 17h" quando só uma hora se destaca.

**Janela que cruza o pôr do sol:**

| Opção                           | Por que não / por que sim                           |
| ------------------------------- | --------------------------------------------------- |
| Corte rígido no pôr do sol      | Parte em dois um fim de tarde contínuo e agradável. |
| Unir dia e noite numa janela só | Passa das 4h e a mensagem fica vaga.                |
| **Cruzar sem repetir horas** ✅ | Natural e sem informação duplicada.                 |

Regras:

- **O período de uma janela é o da sua melhor hora.** Melhor hora às 18h (dia) → janela do dia, mesmo que avance pela noite.
- **O dia tem prioridade** (é a pergunta do enunciado): calcula-se primeiro, e sua janela pode avançar pela noite.
- **A noite usa só as horas que sobraram.** Os cards nunca repetem horas.
- Quando a janela inclui o pôr do sol, a UI destaca: "🌅 inclui o pôr do sol (18h40)".

### 9.6 Classificação e mensagens

| Score da janela | Rótulo |
| --------------- | ------ |
| ≥ 75            | Ótimo  |
| 50–74           | Bom    |
| < 50            | Evite  |

**Motivos** derivados dos fatores da janela:

| Fator       | Faixas → frase                                                                           |
| ----------- | ---------------------------------------------------------------------------------------- |
| Temperatura | `< 12` frio · `12–18` fresco · `18–26` agradável · `26–30` quente · `> 30` muito quente  |
| Chuva       | `< 20%` baixa chance de chuva · `20–50%` possibilidade de chuva · `> 50%` chuva provável |
| Vento       | `< 15` vento leve · `15–30` ventando · `> 30` vento forte                                |
| UV          | `≥ 8` → **alerta**: "UV muito alto, use protetor solar"                                  |

Fatores favoráveis compõem a frase principal ("Temperatura agradável, baixa chance de chuva e vento leve"). Desfavoráveis viram avisos. O algoritmo devolve **níveis** (`temperature: "pleasant"`), não frases. A tradução é feita na UI (ver 013).

### 9.7 Sugestões de atividade

Cada card traz **2–3 sugestões** (como chaves de tradução, ver 013) escolhidas por uma **tabela fixa** (período × condição dominante da janela), em `src/recommendation/suggestions.ts`. São **dados, não lógica**: adicionar uma sugestão é adicionar uma linha. A escolha é **determinística**, para manter os testes previsíveis.

**Condição dominante:** janela com rótulo **"Evite" → atividades em ambiente fechado** (`indoor`). Senão, decide a temperatura: frio → frio, quente ou muito quente → quente, o resto → agradável. A versão inicial olhava só os fatores ("chuva provável → chuva") e falhava nos dois sentidos: 45% de chuva dá "Evite" mas sugeria parque, e uma noite fria com rótulo "Bom" sugeria ficar em casa. Ligar a sugestão ao rótulo garante a regra abaixo por construção. Chuva provável ou tempestade já levam qualquer janela a "Evite", então nenhum caso de chuva se perde.

| Condição  | Dia                                          | Noite                                              |
| --------- | -------------------------------------------- | -------------------------------------------------- |
| Agradável | caminhada no parque, corrida, piquenique     | barzinho com mesa na calçada, jantar ao ar livre   |
| Quente    | praia ou piscina, sorvete, passeio na sombra | barzinho, açaí, caminhada na orla                  |
| Frio      | caminhada ao sol, café com vista             | restaurante de sopa, fondue, chocolate quente fora |
| Evite     | cinema, museu, café                          | filme em casa, restaurante aconchegante            |

**Motivo:** transforma o estado negativo ("Evite") em algo útil, e o pior cenário do app vira uma recomendação. Sugestões de "ficar em casa" só aparecem quando sair não é uma boa ideia, mantendo o foco do enunciado (atividade ao ar livre).

### 9.8 Apresentação (estrutura da informação)

Padrão de **divulgação progressiva**: primeiro a resposta curta, depois o detalhe.

| Parte                       | Papel                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| **Título**                  | Responde "qual o melhor momento de hoje?" numa frase. É o formato do exemplo do enunciado. |
| **Card "Durante o dia"**    | Janela, rótulo, motivos e sugestões do dia.                                                |
| **Card "À noite"**          | Janela, rótulo, motivos e sugestões da noite.                                              |
| **Selo "⭐ Melhor do dia"** | Marca o card vencedor em vez de repetir seu conteúdo.                                      |

Casos especiais:

- **Os dois períodos com rótulo "Evite":** o título vira "Hoje não está um bom dia para sair. Veja algumas ideias abaixo.", e os cards destacam as sugestões.
- **O dia já acabou:** o card do dia mostra **amanhã**, sinalizado na UI (ver 010).

**O layout visual não está decidido:** esta seção define só a **estrutura da informação**. O desenho das telas será feito combinando esta estrutura com o esboço do autor.

### 9.9 Testabilidade

A função principal recebe o "agora" como parâmetro e nunca chama `Date.now()`:

```ts
recommend(forecast: Forecast, now: CityLocalTime): Recommendation
```

Isso deixa os testes **determinísticos** ("às 15h, com estes dados, a resposta é X"), independentes do relógio de quando rodam. Todos os parâmetros (faixas, pesos, limiares, tamanho da janela) ficam em `src/recommendation/config.ts`.

### 9.10 Regras de borda adotadas na implementação

A 009 não especificava estes casos. Cada regra tem um teste em `src/recommendation/`.

| Caso                                   | Regra                                                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Hora que contém o pôr do sol           | É **dia** se começa antes do pôr do sol (pôr às 18:06 → a hora das 18h é dia, a noite começa às 19h).                                         |
| Madrugada antes do nascer do sol       | O dia começa na hora que contém o nascer do sol (nascer às 05:24 → 5h). Às 3h, o card do dia não recomenda 3h ou 4h, que ainda estão escuras. |
| Fim da noite                           | Horas que **começam** antes das 02h: a última é a das 01h.                                                                                    |
| Empate de score                        | Vence a hora mais cedo. Na expansão da janela, cresce primeiro para o vizinho de score maior.                                                 |
| Resumo dos fatores da janela           | Temperatura pela **média**. Chuva, vento e UV pelo **pior valor**: uma hora com 60% de chuva na janela precisa aparecer no motivo.            |
| Score da janela                        | Média dos scores das horas, arredondada.                                                                                                      |
| Condição dominante (para as sugestões) | Rótulo "Evite" → ambiente fechado. Senão: frio → frio, quente ou muito quente → quente, o resto → agradável (ver 9.7).                        |
| Data de hoje ausente da previsão       | Nenhum período (cache antigo ao voltar do segundo plano no dia seguinte). Nunca trata um dia passado como "amanhã".                           |
| "Melhor do dia"                        | O período de maior score. Empate → dia (a pergunta do enunciado).                                                                             |

**Validação com dados reais:** com a previsão de Ubatuba para 19/10/2026 (manhã com 47–71% de chuva, tarde seca), às 9h o algoritmo recomenda "12h–16h, Ótimo" e evita a manhã chuvosa.

### Valores adotados por padrão (ajustáveis)

- Limite da noite: **02h**.
- Conteúdo da tabela de sugestões: a versão inicial está acima e pode ser refinada.

---

## 010 — Horizonte: períodos de hoje, com fallback para amanhã

**Status:** Aceita

| Alternativa                                                                      | Prós                                                                                       | Contras                                             |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| **Horas futuras de hoje (dia + noite até 02h) → amanhã quando o período acabou** | Responde à pergunta do enunciado, nunca recomenda horário passado e continua útil à noite. | Exige tratar o fuso da cidade (9.1).                |
| Dia inteiro de hoje                                                              | Mais simples.                                                                              | Pode recomendar "entre 9h e 11h" às 15h: inútil.    |
| Próximos 7 dias                                                                  | Mais informação.                                                                           | Dilui a resposta e foge do "melhor horário do dia". |

**Decisão:**

- **Card do dia:** horas futuras até o pôr do sol. Se o dia já acabou, mostra o **dia de amanhã**, sinalizado na UI ("Amanhã").
- **Card da noite:** do pôr do sol até 02h. Entre 00h e 02h, ainda vale a noite em curso.
- `forecast_days=2` + `daily=sunrise,sunset` cobrem todos os casos **numa única requisição**.

---

## 011 — UX da busca

**Status:** Aceita

- **Debounce de 350 ms** e **mínimo de 2 caracteres**: evita uma requisição por tecla sem parecer lento.
- `placeholderData` mantém os resultados anteriores enquanto digita, sem flicker.
- Cada resultado mostra **cidade, estado/região e país** (+ bandeira via `country_code`) para desambiguar homônimos (ex.: "Santa Maria", RS vs DF).
  - **Evidência real:** a busca por "Santa Maria" (`language=pt`) retornou **Oaxaca de Juárez (México) como 1º resultado**, por correspondência em nome alternativo. O nome retornado pode nem ser o que o usuário digitou, então estado e país são indispensáveis.
- Estados explícitos: vazio (sugestões + recentes), carregando, sem resultados, erro com "tentar novamente".
- `language` da Geocoding API segue o idioma do app (`pt`, `en` ou `es`, ver 013).
- **Teclado:** `returnKeyType="search"` e `keyboardShouldPersistTaps="handled"` na lista. Sem este último, o primeiro toque num resultado só fecha o teclado e não seleciona a cidade (bug clássico de RN).
- **Botão ✕** para limpar o campo.
- **Estado vazio:** buscas recentes, se houver. Senão, uma frase curta explicando o app, com o campo já focado.

**Contra considerado:** o debounce adiciona latência percebida. 350 ms é o meio-termo usual. Abaixo de 250 ms, as requisições aumentam sem ganho perceptível.

---

## 012 — Persistência local: AsyncStorage

**Status:** Aceita

| Alternativa      | Prós                                                                                 | Contras                                                                  |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **AsyncStorage** | Funciona no Expo Go sem dev client. API simples. Suficiente para 5 cidades recentes. | Assíncrono e mais lento (irrelevante nesse volume).                      |
| MMKV             | Muito mais rápido e síncrono.                                                        | Exige dev client ou prebuild: quebra o "rode com Expo Go" (decisão 001). |

**Decisão:** AsyncStorage, encapsulado em um hook `useRecentCities`. Trocar por MMKV no futuro afeta um único arquivo.

**Regras das buscas recentes:**

- Até **5 cidades**, a mais recente primeiro.
- **Sem duplicatas** (por `id`): selecionar uma cidade que já está na lista a move para o topo.
- **O storage também é uma fronteira:** o conteúdo lido passa por um schema Zod, como as respostas da API (002/005). Dado inválido ou de uma versão antiga do app é descartado, sem crash.

---

## 013 — Idioma, unidades e fuso

**Status:** Aceita

### Idioma

**Regra:** o app segue o idioma do aparelho. Idiomas suportados: **português, inglês e espanhol**. Qualquer outro → **inglês** (o mais amplamente compreendido). Considera-se apenas o idioma, não a região: `pt-BR`/`pt-PT` → português, `es-MX`/`es-AR` → espanhol.

| Alternativa                                           | Prós                                                        | Contras                                       |
| ----------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------- |
| **`expo-localization` + `i18next` / `react-i18next`** | Padrão de mercado. Interpolação, plural e fallback prontos. | Um pouco mais pesado.                         |
| `expo-localization` + `i18n-js`                       | Mais leve, exemplo da documentação do Expo.                 | Menos recursos e menos adotado.               |
| Implementação própria (objeto + `t`)                  | Zero dependências.                                          | Reimplementa plural, interpolação e fallback. |

**Decisão:** `i18next` + `react-i18next`, com `expo-localization` para ler o idioma do aparelho. Traduções em `src/i18n/locales/{pt,en,es}.json`. O idioma é resolvido na abertura e acompanha mudanças do aparelho com o app aberto (`useLocales` + `useDeviceLanguageSync`). O iOS reinicia o app ao trocar o idioma, mas o Android nem sempre.

**Consequências na arquitetura:**

1. **O algoritmo não devolve texto.** `src/recommendation/` devolve **dados estruturados** (`{ temperature: "pleasant", rain: "low", wind: "light" }`, chaves de sugestão), e a UI traduz com `t()`. O domínio não conhece idioma, assim como não conhece React, e os testes do algoritmo não dependem de texto.
2. **Sugestões são chaves** (`suggestions.night.pleasant.bar`), traduzidas nos 3 idiomas.
3. **A Geocoding API recebe o idioma do app** (`language=pt|en|es`): "Lisboa" em pt, "Lisbon" em en.
4. **Horários formatados com `Intl.DateTimeFormat`** no idioma do app: "17h" (pt/es), "5 PM" (en).

### Unidades

| Alternativa                           | Prós                                                        | Contras                                                |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| Sempre °C e km/h                      | Mais simples.                                               | Usuários de °F/mph (ex.: EUA) veem unidades estranhas. |
| **Seguir a configuração do aparelho** | Coerente com "respeitar o aparelho da pessoa". Custo baixo. | Uma camada de formatação a mais.                       |

**Decisão:** seguir o aparelho, via `expo-localization`: temperatura em °C ou °F conforme a preferência de temperatura do aparelho, e vento em km/h ou mph conforme o sistema de medidas.

- **O algoritmo sempre calcula em °C e km/h** (unidades da API). A conversão acontece **só na exibição**, em funções de formatação. As faixas e limiares da 009 têm uma única definição.

### Fuso horário

- **`timezone=auto`** na Forecast API: os horários vêm no fuso **da cidade**.
- **Todos os horários exibidos são os da cidade buscada**, não os do aparelho. O clima, o pôr do sol e a pessoa que vai sair estão lá. Ver 9.1 para o cálculo do "agora" da cidade.
- **Exemplo:** usuário em São Paulo (14h) busca Lisboa (18h). Sem esse cuidado, o app compararia os horários de Lisboa com o relógio de SP e recomendaria "entre 15h e 17h", horas que em Lisboa **já passaram**.
- Quando o fuso da cidade difere do aparelho, a UI mostra um aviso discreto: "Horários de Lisboa (agora 18h10)". Para a cidade no mesmo fuso, nada é exibido.

---

## 014 — Testes: Jest + React Native Testing Library, foco no domínio

**Status:** Aceita

**Ferramentas:** Jest (preset `jest-expo`) + React Native Testing Library.

**Princípio:** o esforço vai onde está o risco, não atrás de uma porcentagem de cobertura.

| Camada                           | Casos                                                                                                                                                                                                                                                                                                    | Por quê                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **`src/recommendation/`** (foco) | Trapézio nas bordas (18°C, 26°C, 34°C). Chuva eliminatória (temperatura perfeita + 90% de chuva → "Evite"). Veto de tempestade. Janela crescendo até 4h e parando. Janela cruzando o pôr do sol sem repetir horas na noite. Dia encerrado → amanhã. Madrugada (00h–02h). Tudo ruim → título e sugestões. | É a regra de negócio. Funções puras, sem mock, com o "agora" passado como parâmetro (9.9). |
| **`schemas/`**                   | Fixtures de **respostas reais** (Santa Maria, busca vazia sem `results`). Arrays horários de tamanhos diferentes → `ParseError`. Storage corrompido descartado.                                                                                                                                          | Robustez da fronteira com o mundo externo.                                                 |
| **Formatação**                   | Lisboa vista de São Paulo, °F/mph, "17h" vs "5 PM".                                                                                                                                                                                                                                                      | Os bugs sutis de fuso e locale moram aqui.                                                 |
| **i18n**                         | `pt`, `en` e `es` têm exatamente as mesmas chaves.                                                                                                                                                                                                                                                       | Barato e evita tradução esquecida.                                                         |
| **Fluxo** (1–2 testes)           | Buscar → selecionar → ver recomendação, com `fetch` mockado.                                                                                                                                                                                                                                             | Confiança de que as peças se encaixam, sem o custo de E2E.                                 |

**Fora do escopo:** E2E (Detox/Maestro), pelo custo de configuração. Citado no README como próximo passo.

---

## 015 — Qualidade de código

**Status:** Aceita

- **ESLint** (`eslint-config-expo`) + **Prettier** com `prettier-plugin-tailwindcss`, que ordena as classes automaticamente e dá consistência às `className` (007).
- **`npm run check`** = `tsc --noEmit` + lint + testes. O Metro não checa tipos (002).
- **GitHub Actions** rodando `check` em todo push.
- **Commits pequenos e descritivos** no padrão _Conventional Commits_ (`feat:`, `fix:`, `test:`, `docs:`). O histórico conta como o projeto foi construído, e avaliadores costumam olhar o `git log`.
- **Sem Husky/pre-commit:** o CI já cobre isso, e hooks locais adicionam configuração sem ganho num projeto solo.

---

## Questões em aberto

| Tema                                               | Situação                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Dark mode                                          | ✅ Incorporado: tema por variáveis CSS (007).                                                   |
| Linha do tempo horária                             | ✅ Incorporada à tela de recomendação. O formato visual será definido junto com o layout (9.8). |
| Paleta de cores                                    | ⏳ Definir na construção da UI, validando contraste WCAG AA (007).                              |
| Layout das telas                                   | ⏳ Combinar a estrutura da 9.8 com o esboço do autor.                                           |
| Seleção de atividade (correr / caminhar / pedalar) | 💤 Extensão, só se o cronograma permitir. Mudaria apenas os pesos em `config.ts`.               |
| "Usar minha localização"                           | 💤 Extensão, só se o cronograma permitir. `expo-location`, com tratamento de permissão negada.  |
| APK via EAS Build                                  | ⏳ Gerar ao final e linkar no README (001).                                                     |
