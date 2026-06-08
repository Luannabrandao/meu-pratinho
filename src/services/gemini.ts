import { GoogleGenerativeAI } from '@google/generative-ai';

type GeminiPart = { inlineData: { data: string; mimeType: string } };

export type ResultadoAnalise = {
  veredito: 'PERIGO' | 'SEGURO';
  mensagem: string;
  ingredientes?: string;
  bruto: string;
};

const MODELO_GEMINI = 'gemini-2.5-flash';
const LIMITE_IMAGEM_INLINE_BYTES = 4 * 1024 * 1024;
const DIMENSAO_MAXIMA_IMAGEM = 1800;

const getGeminiModel = (systemInstruction: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chave API Gemini não encontrada.');

  const ai = new GoogleGenerativeAI(apiKey);
  return ai.getGenerativeModel(
    { model: MODELO_GEMINI, systemInstruction },
    { apiVersion: 'v1beta' },
  );
};

export const converterArquivoParaGeminiPart = async (
  arquivo: File,
): Promise<GeminiPart> => {
  if (
    arquivo.size > LIMITE_IMAGEM_INLINE_BYTES &&
    arquivo.type !== 'image/heic' &&
    arquivo.type !== 'image/heif'
  ) {
    return compactarImagemParaGeminiPart(arquivo);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      let tipoDetectado = arquivo.type;
      const tiposSuportados = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif',
      ];

      if (
        !tipoDetectado ||
        tipoDetectado.includes('*') ||
        !tiposSuportados.includes(tipoDetectado)
      ) {
        const extensao = arquivo.name.split('.').pop()?.toLowerCase();

        if (extensao === 'png') tipoDetectado = 'image/png';
        else if (extensao === 'webp') tipoDetectado = 'image/webp';
        else if (extensao === 'heic') tipoDetectado = 'image/heic';
        else if (extensao === 'heif') tipoDetectado = 'image/heif';
        else tipoDetectado = 'image/jpeg';
      }

      resolve({ inlineData: { data: base64Data, mimeType: tipoDetectado } });
    };

    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
};

const compactarImagemParaGeminiPart = async (
  arquivo: File,
): Promise<GeminiPart> => {
  const urlImagem = URL.createObjectURL(arquivo);

  try {
    const imagem = await carregarImagem(urlImagem);
    const escala = Math.min(
      1,
      DIMENSAO_MAXIMA_IMAGEM / Math.max(imagem.width, imagem.height),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(imagem.width * escala));
    canvas.height = Math.max(1, Math.round(imagem.height * escala));

    const contexto = canvas.getContext('2d');
    if (!contexto) {
      throw new Error('Nao foi possivel preparar a imagem para envio.');
    }

    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    const base64Data = dataUrl.split(',')[1];

    return { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
  } finally {
    URL.revokeObjectURL(urlImagem);
  }
};

const carregarImagem = (urlImagem: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () =>
      reject(new Error('Nao foi possivel carregar a foto selecionada.'));
    imagem.src = urlImagem;
  });
};

export const formatarErroGemini = (erro: unknown): string => {
  const mensagem =
    erro instanceof Error ? erro.message : typeof erro === 'string' ? erro : '';
  const mensagemMinuscula = mensagem.toLowerCase();

  if (mensagemMinuscula.includes('api key')) {
    return 'A chave da API Gemini nao foi aceita. Verifique o arquivo .env e reinicie o servidor do Vite.';
  }

  if (
    mensagemMinuscula.includes('not found') ||
    mensagemMinuscula.includes('model')
  ) {
    return 'O modelo Gemini configurado nao respondeu. Verifique se a chave tem acesso ao modelo de visao.';
  }

  if (
    mensagemMinuscula.includes('quota') ||
    mensagemMinuscula.includes('429') ||
    mensagemMinuscula.includes('resource_exhausted')
  ) {
    return 'A cota da API Gemini foi atingida. Tente novamente mais tarde ou verifique a cota no Google AI Studio.';
  }

  if (
    mensagemMinuscula.includes('400') ||
    mensagemMinuscula.includes('too large') ||
    mensagemMinuscula.includes('payload')
  ) {
    return 'A foto parece grande ou em formato dificil de processar. Tente uma foto mais proxima, bem iluminada e menor.';
  }

  return 'Nao foi possivel analisar a foto com Gemini agora. Verifique o console do navegador para o erro tecnico.';
};

const parseRespostaGemini = (respostaBruta: string): ResultadoAnalise => {
  const respostaLimpa = respostaBruta.replace(/```/g, '').trim();
  const linhas = respostaLimpa.split('\n');
  const primeiraLinha = linhas[0]?.toUpperCase().trim() ?? '';
  const conteudo = linhas.slice(1).join('\n').trim();
  const temPerigo =
    primeiraLinha.includes('PERIGO') ||
    respostaLimpa.toUpperCase().includes('PERIGO');

  return {
    veredito: temPerigo ? 'PERIGO' : 'SEGURO',
    mensagem: conteudo,
    ingredientes: conteudo,
    bruto: respostaLimpa,
  };
};

const instrucoesSeguranca = `
Você é um Analista de Segurança Alimentar Pediátrica especializado em alergias infantis.

Regras críticas para evitar falsos positivos:
1. Se a alergia a LEITE estiver ativa: bloqueie leite animal, soro de leite, lactose, caseína, whey, manteiga animal, creme de leite e queijo.
   Exceções seguras: manteiga de cacau, manteiga de karité, manteiga de cupuaçu e leites 100% vegetais, como leite de coco, amêndoas, aveia, arroz ou soja.
2. Se a alergia a OVO estiver ativa: bloqueie ovo, gema, clara de ovo, albumina, ovalbumina e lisozima.
3. Se a alergia a SOJA estiver ativa: bloqueie soja, lecitina de soja, tofu, shoyu e missô.
   Exceções seguras: lecitina de girassol, lecitina de canola e lecitina de algodão.
4. Se a alergia a GLÚTEN/TRIGO estiver ativa: bloqueie trigo, centeio, cevada, aveia, malte, sêmola e semolina.
`;

export const analisarImagemComGemini = async (
  arquivo: File,
  alergiasAtivas: string[],
): Promise<ResultadoAnalise> => {
  const modelo = getGeminiModel(`
${instrucoesSeguranca}

Sua tarefa é transcrever os ingredientes do rótulo da imagem e analisar se contém algum alérgeno proibido.

Responda estritamente neste formato:
Linha 1: PERIGO ou SEGURO
Linha 2: Transcreva os ingredientes identificados de forma legível.
`);

  const imagemPreparada = await converterArquivoParaGeminiPart(arquivo);
  const prompt = `Analise este rótulo de alimento considerando que as alergias ativas da criança são: [${alergiasAtivas.join(', ')}].`;
  const resultado = await modelo.generateContent([prompt, imagemPreparada]);

  return parseRespostaGemini(resultado.response.text());
};

export const analisarTextoComGemini = async (
  texto: string,
  alergiasAtivas: string[],
): Promise<ResultadoAnalise> => {
  const modelo = getGeminiModel(`
${instrucoesSeguranca}

Analise se o texto fornecido contém algum dos alérgenos ativos ou seus derivados.

Responda estritamente neste formato:
Linha 1: PERIGO ou SEGURO
Linha 2: Uma frase curta e muito clara em português explicando o motivo da decisão.
`);

  const prompt = `Analise o seguinte texto sob as alergias ativas: [${alergiasAtivas.join(', ')}].\nTexto: "${texto}"`;
  const resultado = await modelo.generateContent(prompt);

  return parseRespostaGemini(resultado.response.text());
};

export const executarAnaliseLocal = (
  textoParaVerificar: string,
  alergiasAtivas: string[],
): ResultadoAnalise => {
  const textoMinusculo = textoParaVerificar.toLowerCase();

  const encontrouAlergia = alergiasAtivas.some((alergia) => {
    const termo = alergia.toLowerCase().trim();

    if (termo === 'leite') {
      const textoLeite = textoMinusculo
        .replace(/manteiga\s+de\s+cacau/g, '')
        .replace(/manteiga\s+de\s+karit[eé]/g, '')
        .replace(/manteiga\s+de\s+coco/g, '')
        .replace(/manteiga\s+de\s+cupua[cç]u/g, '')
        .replace(/leite\s+de\s+coco/g, '')
        .replace(/leite\s+de\s+soja/g, '')
        .replace(/leite\s+de\s+aveia/g, '')
        .replace(/leite\s+de\s+arroz/g, '')
        .replace(/leite\s+de\s+am[eê]ndoas/g, '');

      return (
        textoLeite.includes('leite') ||
        textoLeite.includes('caseina') ||
        textoLeite.includes('caseína') ||
        textoLeite.includes('caseinato') ||
        textoLeite.includes('lactose') ||
        textoLeite.includes('soro de leite') ||
        textoLeite.includes('whey') ||
        textoLeite.includes('manteiga') ||
        textoLeite.includes('cream cheese') ||
        textoLeite.includes('requeijao') ||
        textoLeite.includes('requeijão') ||
        textoLeite.includes('queijo') ||
        textoLeite.includes('nata') ||
        textoLeite.includes('creme de leite') ||
        textoLeite.includes('iogurte') ||
        textoLeite.includes('coalhada') ||
        textoLeite.includes('lactofre') ||
        textoLeite.includes('lactalbumina') ||
        textoLeite.includes('lactoglobulina') ||
        textoLeite.includes('gordura anidra de leite')
      );
    }

    if (termo === 'ovo') {
      const temClaraOvo =
        textoMinusculo.includes('clara de ovo') ||
        textoMinusculo.includes('clara de ovos') ||
        textoMinusculo.includes('claras') ||
        textoMinusculo.includes('clara em pó') ||
        (textoMinusculo.includes('clara') &&
          !textoMinusculo.includes('clara victoria') &&
          !textoMinusculo.includes('clara vitória'));

      return (
        textoMinusculo.includes('ovo') ||
        textoMinusculo.includes('gema') ||
        temClaraOvo ||
        textoMinusculo.includes('albumina') ||
        textoMinusculo.includes('ovalbumina') ||
        textoMinusculo.includes('ovomucina') ||
        textoMinusculo.includes('ovomucoide') ||
        textoMinusculo.includes('ovomucóide') ||
        textoMinusculo.includes('lisozima') ||
        textoMinusculo.includes('maionese')
      );
    }

    if (termo === 'amendoim' || termo === 'amendoím') {
      return (
        textoMinusculo.includes('amendoim') ||
        textoMinusculo.includes('amendoím') ||
        textoMinusculo.includes('arachis') ||
        textoMinusculo.includes('paçoca') ||
        textoMinusculo.includes('pacoca') ||
        textoMinusculo.includes('praline') ||
        textoMinusculo.includes('praliné') ||
        textoMinusculo.includes('nougat')
      );
    }

    if (termo === 'glúten' || termo === 'gluten' || termo === 'trigo') {
      return (
        textoMinusculo.includes('gluten') ||
        textoMinusculo.includes('glúten') ||
        textoMinusculo.includes('trigo') ||
        textoMinusculo.includes('centeio') ||
        textoMinusculo.includes('cevada') ||
        textoMinusculo.includes('aveia') ||
        textoMinusculo.includes('malte') ||
        textoMinusculo.includes('sêmola') ||
        textoMinusculo.includes('semolina') ||
        textoMinusculo.includes('germe de trigo') ||
        textoMinusculo.includes('farelo de trigo')
      );
    }

    if (termo === 'soja') {
      return (
        textoMinusculo.includes('soja') ||
        textoMinusculo.includes('lecitina de soja') ||
        textoMinusculo.includes('tofu') ||
        textoMinusculo.includes('shoyu') ||
        textoMinusculo.includes('missô') ||
        textoMinusculo.includes('misso')
      );
    }

    return textoMinusculo.includes(termo);
  });

  return {
    veredito: encontrouAlergia ? 'PERIGO' : 'SEGURO',
    mensagem: encontrouAlergia
      ? 'Componente alérgico detetado para o perfil da criança!'
      : 'Nenhum componente perigoso foi detetado no texto.',
    bruto: textoParaVerificar,
  };
};
