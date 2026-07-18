# Golytics — Análise Preditiva do Brasileirão

Reconstrução completa do projeto exportado pelo Manus. O design visual foi
mantido (cards de jogos, modal de análise, calculadora, tabela de
classificação), mas a base técnica foi refeita do zero porque o export
original era só arquivos `.tsx` soltos, sem `package.json`, sem configuração
de build — por isso não subia no GitHub Pages.

## O que mudou em relação ao export original do Manus

1. **Projeto Vite completo** — `package.json`, `vite.config.ts`,
   `tsconfig.json`, GitHub Actions workflow (`.github/workflows/deploy.yml`)
   que builda e publica automaticamente a cada push.
2. **Dados reais, não fictícios.** O original usava `Math.random()` pra gerar
   a tabela de classificação e tinha um calendário de jogos inventado. Agora
   os dados (times, gols, pontos, classificação, próximos jogos) vêm do
   backend `placar-backend` (mesmo backend gratuito do Chute Certo, sem chave
   de API).
3. **Removido o script de "proteção de código"** que desativava botão direito,
   copiar texto, e mostrava um aviso falso de monitoramento. Isso não protege
   nada de verdade (o código do navegador é sempre visível) e prejudica
   acessibilidade e a experiência de quem visita o site legitimamente.
4. **Removida a dependência da infraestrutura do Manus** (imagem de fundo do
   Hero e script de analytics apontavam pra URLs que só existem dentro do
   ambiente deles).
5. **Sem roteamento (`wouter`)** — como a navegação é só por abas locais
   (não muda a URL), simplifiquei removendo essa dependência.

## Conectar ao backend de dados

Antes de publicar, troque a URL em `src/lib/config.ts`:

```ts
export const API_BASE = "https://SEU-BACKEND-DE-DADOS.onrender.com";
```

pela URL real do `placar-backend` já implantado no Render (o mesmo backend
usado pelo Chute Certo). Se ainda não fez esse deploy, veja o `README.md`
dentro do repositório `placar-backend`.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build       # gera em dist/
```

O GitHub Actions já builda e publica sozinho a cada push na branch `main` —
não precisa rodar build manual pra publicar.

## Ativar o GitHub Pages neste repositório (só precisa fazer uma vez)

1. No GitHub, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions** (não "Deploy from a branch")
3. Pronto — o workflow já configurado (`.github/workflows/deploy.yml`) cuida
   do resto a cada push

## Testes

```bash
node test/render-test.mjs
```

Testa a renderização real da aplicação (monta o app de verdade num DOM
simulado, com dados de API mockados) e confirma que os dados aparecem
corretamente na tela.
