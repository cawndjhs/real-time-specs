# Virtual Frame Fit

Crie uma aplicação web moderna para a primeira ótica 100% online do Brasil, focada em uma experiência interativa e com provador virtual em tempo real. O estilo visual deve ser limpo, profissional e confiável, inspirado em grandes e-commerces óticos (como a Óticas Carol), mas com foco total na jornada do usuário.

### Estrutura e Design Geral:

- Palette de cores moderna, tipografia legível e design responsivo (mobile-first).

- Cabeçalho fixo com logo, barra de busca e carrinho de compras.

- Banner Principal na Home: Destaque com frase do conceito ("A primeira ótica 100% online do Brasil onde você escolhe armação, lente e prova em tempo real") e um botão de Ação (CTA) principal: "Começar a escolher meu óculos".

---

### Fluxo do Usuário (Etapa por Etapa):

Ao clicar no botão do banner, o usuário deve ser guiado por um assistente/wizard passo a passo:

Etapa 1: Finalidade do Óculos

- O usuário escolhe entre duas opções principais:

  [ Óculos Solar ] ou [ Óculos de Grau ]

Etapa 2: Seleção de Armação & Provador Virtual

- Catálogo de armações com filtros por estilo, cor e formato.

- Cada card de armação deve ter o botão "Provar Armação".

- Modulo do Provador Virtual:

  - Ao clicar em provar, abre a tela de simulação com a câmera do usuário ou um modelo 3D/foto padrão.

  - Para óculos de grau, exibir campos/ferramentas para medição técnica:

    * Medição de DP (Distância Pupilar - Visão Simples).

    * Medição de DP + Centro Óptico (medida da pupila até o fim da armação).

Etapa 3: Seleção do Tipo de Lente

O usuário escolhe a categoria de lente e depois a marca/modelo específico:

Opção A: Visão Simples

- Marcas e opções disponíveis:

  * Kodak (4 opções de lentes)

  * Eyezen (3 opções de lentes)

Opção B: Multifocal

- Marcas e opções disponíveis:

  * Kodak (4 opções de lentes)

  * Varilux (2 opções de lentes)

Etapa 4: Confirmação e Prova Final

- Tela de resumo do pedido com a armação escolhida, as especificações da lente selecionada e o valor total.

- Botão final em destaque: "Provar em Tempo Real com Lentes Escolhidas" para visualizar o resultado final no rosto antes de adicionar ao carrinho e ir para o checkout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1d75604c-52f0-46d9-9dfa-83028645c59b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
