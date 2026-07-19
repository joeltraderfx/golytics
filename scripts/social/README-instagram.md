# Publicação automática no Instagram — Golytics

Todo dia, o GitHub Actions gera uma imagem com as previsões do dia e (se
configurado) publica automaticamente no Instagram.

## 1. Pré-requisitos (uma vez só)

1. Conta Instagram **Business ou Creator** (Configurações → Conta → "Mudar
   para conta profissional")
2. Uma **Página do Facebook** vinculada a essa conta (Configurações →
   Contas vinculadas)
3. Um App em **https://developers.facebook.com/apps** → "Criar App" → tipo
   "Business" → adicione o produto **"Instagram Graph API"**
4. Em **Funções do App → Testadores do Instagram**, adicione sua própria
   conta como testadora e aceite o convite (chega uma notificação no app do
   Instagram). Isso permite postar sem esperar aprovação (App Review) da Meta.

## 2. Pegar o Access Token

1. No painel do seu App → **Ferramentas → Explorador da API Graph**
2. Selecione seu App no canto superior direito
3. Em "Usuário ou Página", escolha a Página do Facebook vinculada
4. Em permissões, adicione: `instagram_basic`, `instagram_content_publish`,
   `pages_show_list`, `pages_read_engagement`
5. Clique em **"Gerar Token de Acesso"** e autorize
6. Esse token dura ~1h. Pra virar um token de **longa duração** (60 dias,
   renovável), rode:

```bash
curl -i -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=SEU_TOKEN_CURTO"
```

(App ID e App Secret ficam em **Configurações do App → Básico**)

## 3. Pegar o ID da conta Instagram Business

```bash
curl -i -X GET "https://graph.facebook.com/v21.0/me/accounts?access_token=SEU_TOKEN"
```

Isso lista suas Páginas. Pegue o `id` da página certa, depois:

```bash
curl -i -X GET "https://graph.facebook.com/v21.0/ID_DA_PAGINA?fields=instagram_business_account&access_token=SEU_TOKEN"
```

O `instagram_business_account.id` retornado é o `IG_BUSINESS_ACCOUNT_ID`.

## 4. Cadastrar os Secrets no GitHub

No repositório `golytics` → **Settings → Secrets and variables → Actions**
→ **New repository secret**:

| Nome | Valor |
|---|---|
| `IG_ACCESS_TOKEN` | O token de longa duração do passo 2 |
| `IG_BUSINESS_ACCOUNT_ID` | O ID do passo 3 |

## 5. Pronto — funciona sozinho a partir daqui

Todo dia às 9h (horário de Brasília), o workflow:
1. Busca os jogos do dia no `placar-backend`
2. Gera a imagem com as previsões (modelo de Poisson, dados reais)
3. Publica o site (a imagem fica pública em
   `https://joeltraderfx.github.io/golytics/posts/golytics-AAAA-MM-DD.png`)
4. Publica automaticamente no Instagram, com legenda incluindo as
   probabilidades e hashtags

## Renovando o token (a cada ~60 dias)

Tokens de longa duração expiram. Repita o passo 2 e atualize o Secret
`IG_ACCESS_TOKEN` no GitHub quando o token estiver perto de expirar (a Meta
avisa por e-mail).

## Testando manualmente antes do primeiro dia real

Vá em **Actions → Deploy to GitHub Pages → Run workflow** (botão
"workflow_dispatch") pra disparar manualmente e conferir se tudo funciona,
sem esperar o agendamento das 9h.
