import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import imagemPerigo from '../assets/perigo.png';
import imagemLiberado from '../assets/liberado.png';

interface ScannerProps {
  alergiasAtivas: string[];
}

export function Scanner({ alergiasAtivas }: ScannerProps) {
  const [textoIngredientes, setTextoIngredientes] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemResultado, setMensagemResultado] = useState('');
  const [iconeResultado, setIconeResultado] = useState('');
  const [modoInfantilAtivo, setModoInfantilAtivo] = useState(false);

  const converterArquivoParaGaiPart = async (
    arquivo: File,
  ): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({ inlineData: { data: base64Data, mimeType: arquivo.type } });
      };
      reader.onerror = reject;
      reader.readAsDataURL(arquivo);
    });
  };

  const processarFotoComGemini = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setCarregando(true);
    setModoInfantilAtivo(false);
    setMensagemResultado('Analisando imagem do rótulo...');
    setIconeResultado('🕵️');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Chave API não encontrada.');

      const ai = new GoogleGenerativeAI(apiKey);
      const modelo = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imagemPreparada = await converterArquivoParaGaiPart(arquivo);

      const comandoPrompt = `
        Você é um Analista de Segurança Alimentar Pediátrica especializado em alergias.
        Transcreva a lista de ingredientes da imagem e analise se contém os alérgenos ativos da criança ou derivados.
        ALERGIAS ATIVAS DA CRIANÇA: [${alergiasAtivas.join(', ')}]
        Responda na primeira linha apenas: PERIGO ou SEGURO. Nas linhas seguintes, transcreva os ingredientes.
      `;

      const resultadoInstancia = await modelo.generateContent([
        comandoPrompt,
        imagemPreparada,
      ]);
      const respostaBruta = resultadoInstancia.response.text();

      const linhas = respostaBruta.split('\n');
      const veredito = linhas[0].toUpperCase().trim();
      const textoTranscrevido = linhas.slice(1).join('\n').trim();

      setTextoIngredientes(textoTranscrevido || 'Texto extraído com sucesso.');

      if (veredito.includes('PERIGO')) {
        setIconeResultado('🛑');
        setMensagemResultado('Componente alérgico detectado na imagem.');
      } else {
        setIconeResultado('🎉');
        setMensagemResultado('Nenhum componente perigoso detectado.');
      }
    } catch (erro) {
      console.error(erro);
      setIconeResultado('⚠️');
      setMensagemResultado(
        'Insira os ingredientes na caixa abaixo para validação manual.',
      );
    } finally {
      setCarregando(false);
    }
  };

  const analisarTextoDigitado = async (textoDoRotulo: string) => {
    const textoLimpo = textoDoRotulo.trim();
    if (!textoLimpo) return;

    const palavras = textoLimpo.split(/\s+/);
    const pareceNomeDeProduto =
      palavras.length <= 3 && !textoLimpo.toLowerCase().includes('ingrediente');

    if (pareceNomeDeProduto) {
      setModoInfantilAtivo(true);
      setIconeResultado('🔍');
      setMensagemResultado(
        'Chame um adulto para te ajudar a ler o rótulo! 🕵️‍♂️✨',
      );
      return;
    }

    setModoInfantilAtivo(false);
    setCarregando(true);
    setMensagemResultado('Analisando the text...');
    setIconeResultado('🧠');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const ai = new GoogleGenerativeAI(apiKey);
      const modelo = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const comandoPrompt = `
        Você é um Analista de Segurança Alimentar Pediátrica especializado em alergias. Analise se o texto contém algum dos alérgenos ativos ou seus derivados químicos.
        ALERGIAS ATIVAS: [${alergiasAtivas.join(', ')}]
        Responda estritamente: PERIGO ou SEGURO.
        Texto: "${textoLimpo}"
      `;

      const resultadoInstancia = await modelo.generateContent(comandoPrompt);
      const respostaIA = resultadoInstancia.response
        .text()
        .toUpperCase()
        .trim();

      if (respostaIA.includes('PERIGO')) {
        setIconeResultado('🛑');
        setMensagemResultado(
          'Componente alérgico detectado pela Inteligência Artificial.',
        );
      } else {
        setIconeResultado('🎉');
        setMensagemResultado('Nenhum componente perigoso foi detectado.');
      }
    } catch (erro) {
      console.error(erro);
      executarAnaliseLocal(textoLimpo);
    } finally {
      setCarregando(false);
    }
  };


  const executarAnaliseLocal = (textoParaVerificar: string) => {
    const textoMinusculo = textoParaVerificar.toLowerCase();

    const encontrouAlergia = alergiasAtivas.some((alergia) => {
      const termo = alergia.toLowerCase().trim();

      if (termo === 'leite') {
        return (
          textoMinusculo.includes('leite') ||
          textoMinusculo.includes('caseina') ||
          textoMinusculo.includes('caseína') ||
          textoMinusculo.includes('caseinato') ||
          textoMinusculo.includes('lactose') ||
          textoMinusculo.includes('soro de leite') ||
          textoMinusculo.includes('whey') ||
          textoMinusculo.includes('manteiga') ||
          textoMinusculo.includes('cream cheese') ||
          textoMinusculo.includes('requeijao') ||
          textoMinusculo.includes('requeijão') ||
          textoMinusculo.includes('queijo') ||
          textoMinusculo.includes('nata') ||
          textoMinusculo.includes('creme de leite') ||
          textoMinusculo.includes('iogurte') ||
          textoMinusculo.includes('coalhada') ||
          textoMinusculo.includes('lactofre') ||
          textoMinusculo.includes('lactalbumina') ||
          textoMinusculo.includes('lactoglobulina') ||
          textoMinusculo.includes('gordura anidra de leite')
        );
      }

      if (termo === 'ovo') {
        return (
          textoMinusculo.includes('ovo') ||
          textoMinusculo.includes('gema') ||
          textoMinusculo.includes('clara') ||
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

    if (encontrouAlergia) {
      setIconeResultado('🛑');
      setMensagemResultado(
        'Componente alérgico detectado para o perfil da criança!',
      );
    } else {
      setIconeResultado('🎉');
      setMensagemResultado(
        'Nenhum componente perigoso foi detectado no texto.',
      );
    }
  };


  let corBordaBalao = '2px solid #FFE082'; 
  if (!carregando) {
    if (modoInfantilAtivo) corBordaBalao = '2px solid #FFE082';
    else if (iconeResultado === '🛑') corBordaBalao = '2px solid #FFCDD2';
    else if (iconeResultado === '🎉') corBordaBalao = '2px solid #E0F2F1';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        alignItems: 'center',
        padding: '10px 0',
      }}
    >
     
      <div
        style={{
          width: '100%',
          height: '180px',
          backgroundColor: '#ffecce',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#353535',
          border: '4px solid #f76300',
          padding: '16px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>📷</span>
        <span
          style={{
            fontSize: '0.85rem',
            marginTop: '6px',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          {carregando
            ? 'Processando Imagem...'
            : 'Envie uma foto real de um rótulo'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={processarFotoComGemini}
          disabled={carregando}
          style={{
            marginTop: '16px',
            fontSize: '0.75rem',
            color: '#363636',
            cursor: 'pointer',
            maxWidth: '220px',
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <textarea
          placeholder="Digite ou cole os ingredientes aqui..."
          value={textoIngredientes}
          onChange={(e) => setTextoIngredientes(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '18px',
            border: '2px solid #B2EBF2',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'none',
            backgroundColor: '#FFF',
          }}
        />

        <button
          onClick={() => analisarTextoDigitado(textoIngredientes)}
          disabled={carregando || !textoIngredientes.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '18px',
            border: 'none',
            background: !textoIngredientes.trim()
              ? '#CBD5E1'
              : 'linear-gradient(135deg, #4DD0E1 0%, #26A69A 100%)',
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: !textoIngredientes.trim() ? 'not-allowed' : 'pointer',
            boxShadow: !textoIngredientes.trim()
              ? 'none'
              : '0px 4px 12px rgba(38, 166, 154, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          🔍 Validar Ingredientes
        </button>
      </div>


      {mensagemResultado && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'center',
            padding: '24px 16px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.06)',
            border: corBordaBalao,
          }}
        >

          {modoInfantilAtivo && (
            <span style={{ fontSize: '4.5rem', marginBottom: '4px' }}>
              🕵️‍♂️🧭
            </span>
          )}
          {!modoInfantilAtivo && iconeResultado === '🛑' && (
            <img
              src={imagemPerigo}
              alt="Perigo"
              style={{
                width: '85px',
                height: '85px',
                marginBottom: '4px',
                objectFit: 'contain',
              }}
            />
          )}
          {!modoInfantilAtivo && iconeResultado === '🎉' && (
            <img
              src={imagemLiberado}
              alt="Liberado"
              style={{
                width: '85px',
                height: '85px',
                marginBottom: '4px',
                objectFit: 'contain',
              }}
            />
          )}
          {!modoInfantilAtivo &&
            iconeResultado !== '🛑' &&
            iconeResultado !== '🎉' && (
              <span style={{ fontSize: '3rem', marginBottom: '4px' }}>
                {iconeResultado}
              </span>
            )}


          {modoInfantilAtivo && (
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '900',
                color: '#F57C00',
                margin: '4px 0',
              }}
            >
              EI, DETETIVE!
            </h2>
          )}
          {!modoInfantilAtivo && iconeResultado === '🛑' && (
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#C62828',
                margin: '4px 0',
              }}
            >
              PERIGO!
            </h2>
          )}
          {!modoInfantilAtivo && iconeResultado === '🎉' && (
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#2E7D32',
                margin: '4px 0',
              }}
            >
              EBA!
            </h2>
          )}

          <p
            style={{
              fontWeight: '600',
              color: '#34495E',
              fontSize: '0.95rem',
              margin: 0,
              lineHeight: '1.4',
            }}
          >
            {mensagemResultado}
          </p>
        </div>
      )}
    </div>
  );
}
