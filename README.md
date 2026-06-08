# 🍽️ Meu Pratinho - Comer com Segurança 💛

O **Meu Pratinho** é um aplicativo web voltado para a Segurança Alimentar Pediátrica. Ele foi desenvolvido para auxiliar pais e responsáveis no controle de alérgenos alimentares de crianças de forma rápida e intuitiva, combinando validação em tempo real e o poder da Inteligência Artificial.

---

## 🚀 Funcionalidades

- **Gerenciamento de Perfis:** Cadastro de crianças e seleção dinâmica de restrições alimentares ativas (Leite, Ovo, Glúten/Trigo, Soja e Amendoim).
- **Scanner Inteligente com IA:** Upload ou captura de fotos de rótulos de ingredientes para detecção automática de alérgenos.
- **Validação Manual:** Campo de texto estruturado para colagem ou digitação de ingredientes com dupla checagem.
- **Motor de Segurança Local:** Fallback automatizado que garante o funcionamento e análise do texto mesmo se houver instabilidade na rede.
- **Localizador de Emergência:** Acesso rápido ao discador de emergência (SAMU 192) e listagem de prontos-socorros próximos.

---

## 🛠️ Tecnologias Utilizadas

- **React** (com TypeScript para tipagem estática e segurança de código)
- **Vite** (Ambiente de desenvolvimento ultra-rápido)
- **Google Generative AI SDK** (Integração com o modelo Gemini 1.5 Flash)
- **LocalStorage** (Persistência local de dados dos perfis)
- **CSS Inline / Flexbox** (Layout responsivo mobile-first)

---

## 🧠 Desafios Técnicos e Aprendizados (Destaque do Portfólio)

O desenvolvimento deste aplicativo trouxe desafios reais de engenharia de software e integração de IA. Abaixo estão os principais marcos e como foram solucionados:

### 1. A Migração: De OCR Tradicional para Inteligência Artificial
Originalmente, a leitura dos rótulos foi planejada utilizando bibliotecas tradicionais de OCR (reconhecimento óptico de caracteres). No entanto, abordagens antigas baseadas em processamento puramente textual apresentavam severas limitações:
* Dificuldade crônica em ler textos curvados, amassados ou com sombras em embalagens reais.
* Incapacidade de entender o contexto (ex: uma leitura por palavras soltas bloqueava o produto ao ler *"manteiga de cacau"*, que é um ingrediente vegetal seguro, confundindo-o com a manteiga animal derivada do leite).

**Solução:** Migrei a arquitetura para o **Google Generative AI SDK (Gemini 1.5 Flash)**. Com isso, o app passou não apenas a "ler" o texto, mas a **compreendê-lo contextualmente** através de visão computacional, separando derivados químicos perigosos (como *albumina* e *caseína*) de falsos positivos vegetais seguros.

### 2. Engenharia de Prompt e Contorno de Restrições Regionais
Durante o consumo da API do Gemini em ambiente de desenvolvimento baseado no Brasil, enfrentei restrições padrão de geolocalização e tipagens rígidas no TypeScript ao tentar forçar versões alternativas de endpoints.
* **Solução:** Implementei uma instanciação limpa utilizando a rota estável `v1beta` diretamente nos parâmetros de inicialização de modelos do SDK (`{ model: 'gemini-1.5-flash-latest', systemInstruction }`). Separei as regras de negócio em `systemInstruction`, garantindo respostas da IA no formato exato esperado pela interface do React.

### 3. Eliminação de Falsos Positivos e Fallback de Segurança
IA pode sofrer variações em suas respostas. Para garantir a segurança máxima da criança, criei um sistema híbrido:
* Desenvolvi um **Motor de Análise Local** via expressões regulares baseado nos derivados de alérgenos mais comuns da Anvisa.
* Refinei o algoritmo local e os prompts da IA para ignorar falsos positivos críticos.

---

## ⚙️ Como Executar o Projeto Localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/seu-usuario/meu-pratinho.git](https://github.com/seu-usuario/meu-pratinho.git)

2. Instale as dependências:
   ```Snippet de código
   npm install
   
3. Crie um arquivo .env na raiz do projeto com a sua chave de API do Google AI Studio:
   ```bash
   VITE_GEMINI_API_KEY=sua_chave_aqui
   
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev


📝 #Licença
Este projeto é para fins acadêmicos e de portfólio profissional.
