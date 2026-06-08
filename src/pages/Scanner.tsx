import React, { useEffect, useRef, useState } from 'react';
import imagemPerigo from '../assets/perigo.png';
import imagemLiberado from '../assets/liberado.png';
import {
  analisarImagemComGemini,
  analisarTextoComGemini,
  executarAnaliseLocal,
  formatarErroGemini,
  type ResultadoAnalise,
} from '../services/gemini';

interface ScannerProps {
  alergiasAtivas: string[];
}

type EstadoResultado = ResultadoAnalise['veredito'] | 'INFO' | 'ERRO' | '';

export function Scanner({ alergiasAtivas }: Readonly<ScannerProps>) {
  const [textoIngredientes, setTextoIngredientes] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemResultado, setMensagemResultado] = useState('');
  const [estadoResultado, setEstadoResultado] = useState<EstadoResultado>('');
  const [modoInfantilAtivo, setModoInfantilAtivo] = useState(false);
  const timeoutLimpezaRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutLimpezaRef.current) {
        window.clearTimeout(timeoutLimpezaRef.current);
      }
    };
  }, []);

  const cancelarLimpezaAgendada = () => {
    if (timeoutLimpezaRef.current) {
      window.clearTimeout(timeoutLimpezaRef.current);
      timeoutLimpezaRef.current = undefined;
    }
  };

  const agendarLimpezaResultado = () => {
    cancelarLimpezaAgendada();
    timeoutLimpezaRef.current = window.setTimeout(() => {
      setTextoIngredientes('');
      setMensagemResultado('');
      setEstadoResultado('');
      setModoInfantilAtivo(false);
      timeoutLimpezaRef.current = undefined;
    }, 40000);
  };

  const alterarTextoIngredientes = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    cancelarLimpezaAgendada();
    setTextoIngredientes(e.target.value);
    setMensagemResultado('');
    setEstadoResultado('');
    setModoInfantilAtivo(false);
  };

  const aplicarResultado = (
    resultado: ResultadoAnalise,
    mensagemPerigoPadrao: string,
    mensagemSeguroPadrao: string,
  ) => {
    setEstadoResultado(resultado.veredito);
    setMensagemResultado(
      resultado.mensagem ||
        (resultado.veredito === 'PERIGO'
          ? mensagemPerigoPadrao
          : mensagemSeguroPadrao),
    );
  };

  const processarFotoComGemini = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    cancelarLimpezaAgendada();
    setCarregando(true);
    setModoInfantilAtivo(false);
    setEstadoResultado('INFO');
    setMensagemResultado('A analisar a imagem do rotulo...');

    try {
      console.log('=== INICIANDO DIGITALIZACAO DE IMAGEM COM GEMINI ===');
      const resultado = await analisarImagemComGemini(arquivo, alergiasAtivas);

      console.log('Resposta recebida da API:\n', resultado.bruto);
      setTextoIngredientes(resultado.ingredientes || resultado.bruto);
      setEstadoResultado(resultado.veredito);
      setMensagemResultado(
        resultado.veredito === 'PERIGO'
          ? 'Componente alergico detetado na imagem.'
          : 'Nenhum componente perigoso detetado.',
      );
      agendarLimpezaResultado();
    } catch (erro) {
      console.error('Erro na comunicacao com o Gemini API:', erro);
      setEstadoResultado('ERRO');
      setMensagemResultado(formatarErroGemini(erro));
      agendarLimpezaResultado();
    } finally {
      setCarregando(false);
      console.log('=== FIM DO PROCESSAMENTO DA IMAGEM ===');
      e.target.value = '';
    }
  };

  const analisarTextoDigitado = async (textoDoRotulo?: string) => {
    const textoParaUsar =
      typeof textoDoRotulo === 'string' ? textoDoRotulo : textoIngredientes;
    const textoLimpo = textoParaUsar.trim();
    if (!textoLimpo) return;

    cancelarLimpezaAgendada();
    const palavras = textoLimpo.split(/\s+/);
    const pareceNomeDeProduto =
      palavras.length <= 3 && !textoLimpo.toLowerCase().includes('ingrediente');

    if (pareceNomeDeProduto) {
      setModoInfantilAtivo(true);
      setEstadoResultado('INFO');
      setMensagemResultado('Chame um adulto para te ajudar a ler o rotulo.');
      agendarLimpezaResultado();
      return;
    }

    setModoInfantilAtivo(false);
    setCarregando(true);
    setEstadoResultado('INFO');
    setMensagemResultado('A analisar o texto...');

    try {
      console.log('=== INICIANDO ANALISE DE TEXTO COM GEMINI ===');
      const resultado = await analisarTextoComGemini(
        textoLimpo,
        alergiasAtivas,
      );

      console.log('Resposta recebida da API:\n', resultado.bruto);
      aplicarResultado(
        resultado,
        'Componente alergico detetado pela Inteligencia Artificial.',
        'Nenhum componente perigoso foi detetado.',
      );
      agendarLimpezaResultado();
    } catch (erro) {
      console.error(
        'Falha na chamada da API, acionando analise local de seguranca:',
        erro,
      );
      const resultadoLocal = executarAnaliseLocal(textoLimpo, alergiasAtivas);
      aplicarResultado(
        resultadoLocal,
        'Componente alergico detetado para o perfil da crianca!',
        'Nenhum componente perigoso foi detetado no texto.',
      );
      agendarLimpezaResultado();
    } finally {
      setCarregando(false);
      console.log('=== FIM DO PROCESSAMENTO DE TEXTO ===');
    }
  };

  let corBordaBalao = '2px solid #FFE082';
  if (!carregando) {
    if (estadoResultado === 'PERIGO') corBordaBalao = '2px solid #FFCDD2';
    else if (estadoResultado === 'SEGURO') corBordaBalao = '2px solid #E0F2F1';
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
        <span
          aria-hidden="true"
          style={{
            fontSize: '3rem',
            lineHeight: 1,
            marginBottom: '2px',
          }}
        >
          📷
        </span>
        <span
          style={{
            fontSize: '0.85rem',
            marginTop: '6px',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          {carregando ? 'Processando imagem...' : 'Envie uma foto de um rotulo'}
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
          onChange={alterarTextoIngredientes}
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
          {carregando ? 'Analisando...' : 'Validar ingredientes'}
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
            <span style={{ fontSize: '3rem', marginBottom: '4px' }}>
              Alerta
            </span>
          )}
          {!modoInfantilAtivo && estadoResultado === 'PERIGO' && (
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
          {!modoInfantilAtivo && estadoResultado === 'SEGURO' && (
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
            estadoResultado !== 'PERIGO' &&
            estadoResultado !== 'SEGURO' && (
              <span style={{ fontSize: '2rem', marginBottom: '4px' }}>
                {estadoResultado === 'ERRO' ? 'Atencao' : 'Analise'}
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
          {!modoInfantilAtivo && estadoResultado === 'PERIGO' && (
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
          {!modoInfantilAtivo && estadoResultado === 'SEGURO' && (
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
