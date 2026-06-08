import { useState, useEffect } from 'react';
import { Alergias } from './pages/Alergias';
import { Scanner } from './pages/Scanner';
import { Cadastro } from './pages/Cadastro';
import logoMascote from './assets/image_ccef06.jpeg';
import imagemMorango from './assets/morango.jpeg';

export interface Crianca {
  id: string;
  nome: string;
  idade: string;
  alergias: string[];
}

type AbaAtiva = 'inicio' | 'escanear' | 'perfil' | 'cadastro';

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('inicio');
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [idCriancaAtiva, setIdCriancaAtiva] = useState<string>('');

  useEffect(() => {
    const dadosBanco = localStorage.getItem('mylittledish_criancas_v2');
    if (dadosBanco) {
      try {
        const lista = JSON.parse(dadosBanco) as Crianca[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCriancas(lista);
        if (lista.length > 0) setIdCriancaAtiva(lista[0].id);
      } catch (e) {
        console.error('Erro ao ler localStorage, reiniciando...', e);
        // eslint-disable-next-line react-hooks/immutability
        resetarPerfilPadrao();
      }
    } else {
      resetarPerfilPadrao();
    }
  }, []);

  const resetarPerfilPadrao = () => {
    const perfilPadrao: Crianca = {
      id: '1',
      nome: 'Clara Victoria',
      idade: '7 anos',
      alergias: ['leite', 'ovo'],
    };
    setCriancas([perfilPadrao]);
    setIdCriancaAtiva('1');
    localStorage.setItem(
      'mylittledish_criancas_v2',
      JSON.stringify([perfilPadrao]),
    );
  };

  const criancaAtiva = criancas.find((c) => c.id === idCriancaAtiva);

  const atualizarAlergiasCrianca = (alergiaId: string) => {
    const listaAtualizada = criancas.map((c) => {
      if (c.id === idCriancaAtiva) {
        const listaAlergiasAtual = c.alergias || [];
        const temAlergia = listaAlergiasAtual.includes(alergiaId);

        const novasAlergias = temAlergia
          ? listaAlergiasAtual.filter((a) => a !== alergiaId)
          : [...listaAlergiasAtual, alergiaId];

        return { ...c, alergias: novasAlergias };
      }
      return c;
    });

    setCriancas(listaAtualizada);
    localStorage.setItem(
      'mylittledish_criancas_v2',
      JSON.stringify(listaAtualizada),
    );
  };

  const salvarNovaCrianca = (nova: Crianca) => {
    const listaAtualizada = [...criancas, nova];
    setCriancas(listaAtualizada);
    setIdCriancaAtiva(nova.id);
    localStorage.setItem(
      'mylittledish_criancas_v2',
      JSON.stringify(listaAtualizada),
    );
    setAbaAtiva('perfil');
  };

  const hospitaisProximos = [
    {
      nome: 'Pronto-Socorro Infantil',
      distancia: '1.2 km',
      tempo: '4 min',
      status: 'Aberto 24h',
      cor: '#C8E6C9',
    },
    {
      nome: 'Hospital Sameb',
      distancia: '2.8 km',
      tempo: '8 min',
      status: 'Pouca Fila',
      cor: '#FFE082',
    },
    {
      nome: 'NotreDame Intermédica',
      distancia: '4.1 km',
      tempo: '11 min',
      status: 'Aberto 24h',
      cor: '#C8E6C9',
    },
  ];

  const renderizarTelaAtiva = () => {
    if (criancas.length === 0 || !criancaAtiva) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: '#7F8C8D',
            fontWeight: 'bold',
          }}
        >
          🔄 A carregar perfis em segurança...
        </div>
      );
    }

    switch (abaAtiva) {
      case 'inicio':
        return (
          <div
            className="responsive-container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '16px',
              paddingBottom: '10px',
            }}
          >
            {/* CARD PERFIL RESUMIDO DA CRIANÇA */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '20px',
                borderRadius: '24px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '2px solid #E1F5FE',
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  backgroundColor: '#F3E5F5',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                🐻
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    color: '#B39DDB',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                  }}
                >
                  {criancaAtiva.nome}
                </h3>
                <p
                  style={{
                    margin: '2px 0 6px 0',
                    fontSize: '0.85rem',
                    color: '#7F8C8D',
                    fontWeight: '600',
                  }}
                >
                  {criancaAtiva.idade}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(criancaAtiva.alergias || []).length === 0 ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        backgroundColor: '#C8E6C9',
                        borderRadius: '20px',
                        color: '#2E7D32',
                        fontWeight: 'bold',
                      }}
                    >
                      Nenhuma restrição ativa
                    </span>
                  ) : (
                    criancaAtiva.alergias.map((alg) => (
                      <span
                        key={alg}
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          backgroundColor: '#FFEBEE',
                          borderRadius: '20px',
                          color: '#D32F2F',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          border: '1px solid #FFCDD2',
                        }}
                      >
                        🛑 {alg}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* CARD DE ALERTA */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '20px',
                borderRadius: '24px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '2px solid #FFCDD2',
              }}
            >
              <img
                src={imagemMorango}
                alt="Morango Alerta"
                className="responsive-strawberry"
                style={{ objectFit: 'contain', flexShrink: 0 }}
              />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h4
                  style={{
                    margin: '0 0 2px 0',
                    color: '#D32F2F',
                    fontSize: '1.1rem',
                    fontWeight: '900',
                  }}
                >
                  CUIDADO!
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#546E7A',
                    fontWeight: 500,
                    lineHeight: '1.4',
                  }}
                >
                  Verifique sempre vestígios de contaminação cruzada.
                </p>
              </div>
            </div>

            {/* BOTÃO SOS */}
            <a
              href="tel:192"
              style={{
                textDecoration: 'none',
                backgroundColor: '#D32F2F',
                color: '#FFFFFF',
                padding: '16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(211, 47, 47, 0.2)',
                cursor: 'pointer',
              }}
            >
              <span>🚨</span> LIGAÇÃO DE EMERGÊNCIA (SAMU 192)
            </a>

            {/* LOCALIZADOR DE HOSPITAIS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '20px',
                borderRadius: '24px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    color: '#2C3E50',
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                  }}
                >
                  🏥 Prontos-Socorros Próximos
                </h4>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#4FC3F7',
                    fontWeight: 'bold',
                  }}
                >
                  📍 Barueri - SP
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {hospitaisProximos.map((hosp, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#FAFAFA',
                      borderRadius: '16px',
                      borderLeft: `5px solid ${hosp.cor}`,
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '6px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          color: '#34495E',
                          lineHeight: '1.2',
                        }}
                      >
                        {hosp.nome}
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '0.75rem',
                          color: '#7F8C8D',
                        }}
                      >
                        🚗 {hosp.distancia} • <b>{hosp.tempo}</b>
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {hosp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'escanear':
        return <Scanner alergiasAtivas={criancaAtiva.alergias || []} />;

      case 'perfil':
        return (
          <Alergias
            criancas={criancas}
            idCriancaAtiva={idCriancaAtiva}
            onMudarCrianca={setIdCriancaAtiva}
            onIrParaCadastro={() => setAbaAtiva('cadastro')}
            alergiasSelecionadas={criancaAtiva.alergias || []}
            onAlternarAlergia={atualizarAlergiasCrianca}
          />
        );

      case 'cadastro':
        return (
          <Cadastro
            onSalvar={salvarNovaCrianca}
            onCancelar={() => setAbaAtiva('perfil')}
          />
        );
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        gap: '14px',
        boxSizing: 'border-box',
        backgroundColor: '#FFFDE7',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .responsive-logo-box { width: 50px; height: 50px; }
        .responsive-title { font-size: 1.5rem; }
        .responsive-subtitle { font-size: 0.75rem; }
        .responsive-strawberry { width: 65px; height: 65px; }
        @media (min-width: 480px) {
          .responsive-logo-box { width: 70px; height: 70px; border-width: 3px !important; }
          .responsive-title { font-size: 2rem; }
          .responsive-subtitle { font-size: 0.85rem; }
          .responsive-strawberry { width: 80px; height: 80px; }
        }
      `}</style>

      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          gap: '16px',
          padding: '8px 0',
          flexShrink: 0,
          borderBottom: '1px solid rgba(79, 195, 247, 0.2)',
        }}
      >
        <div
          className="responsive-logo-box"
          style={{
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #4FC3F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFF',
            flexShrink: 0,
          }}
        >
          <img
            src={logoMascote}
            alt="Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const pai = (e.target as HTMLElement).parentElement;
              if (pai) {
                pai.innerText = '🍽️';
                pai.style.fontSize = '1.8rem';
              }
            }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1
            className="responsive-title"
            style={{
              margin: 0,
              fontWeight: '900',
              background: 'linear-gradient(135deg, #4FC3F7 0%, #B39DDB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              lineHeight: '1.1',
            }}
          >
            Meu pratinho
          </h1>
          <p
            className="responsive-subtitle"
            style={{ color: '#7F8C8D', margin: '4px 0 0 0', fontWeight: '600' }}
          >
            Comer com segurança 💛
          </p>
        </div>
      </header>

      <main
        className="no-scrollbar"
        style={{ flex: 1, width: '100%', overflowY: 'auto', display: 'block' }}
      >
        {renderizarTelaAtiva()}
      </main>

      <nav
        style={{
          display: 'flex',
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: '12px 6px',
          borderRadius: '24px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.02)',
          justifyContent: 'space-around',
          border: '1px solid #E1F5FE',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setAbaAtiva('inicio')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: abaAtiva === 'inicio' ? 'bold' : '500',
            color: abaAtiva === 'inicio' ? '#4FC3F7' : '#7F8C8D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🏠</span> Início
        </button>
        <button
          onClick={() => setAbaAtiva('escanear')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: abaAtiva === 'escanear' ? 'bold' : '500',
            color: abaAtiva === 'escanear' ? '#4FC3F7' : '#7F8C8D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🔍</span> Escanear
        </button>
        <button
          onClick={() => setAbaAtiva('perfil')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: abaAtiva === 'perfil' ? 'bold' : '500',
            color: abaAtiva === 'perfil' ? '#4FC3F7' : '#7F8C8D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>👤</span> Perfil
        </button>
      </nav>
    </div>
  );
}

export default App;
