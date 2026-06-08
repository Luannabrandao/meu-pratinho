import type { Crianca } from '../App';

interface AlergiasProps {
  criancas: Crianca[];
  idCriancaAtiva: string;
  onMudarCrianca: (id: string) => void;
  onIrParaCadastro: () => void;
  alergiasSelecionadas: string[];
  onAlternarAlergia: (id: string) => void;
}

export function Alergias({
  criancas,
  idCriancaAtiva,
  onMudarCrianca,
  onIrParaCadastro,
  alergiasSelecionadas,
  onAlternarAlergia,
}: Readonly<AlergiasProps>) {
  const listaOpcoesAlergias = [
    { id: 'leite', nome: 'Leite e Derivados', icone: '🥛' },
    { id: 'ovo', nome: 'Ovo', icone: '🥚' },
    { id: 'amendoim', nome: 'Amendoim', icone: '🥜' },
    { id: 'gluten', nome: 'Glúten / Trigo', icone: '🌾' },
    { id: 'soja', nome: 'Soja e Derivados', icone: '🫘' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: '24px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
          border: '2px solid #E1F5FE',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: '#2C3E50',
            fontSize: '1.05rem',
            fontWeight: '800',
          }}
        >
          👤 Perfil Selecionado
        </h3>

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <select
            value={idCriancaAtiva}
            onChange={(e) => onMudarCrianca(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '16px',
              border: '2px solid #B2EBF2',
              backgroundColor: '#FFF',
              fontWeight: 'bold',
              color: '#34495E',
              outline: 'none',
              fontSize: '0.9rem',
            }}
          >
            {criancas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <button
            onClick={onIrParaCadastro}
            style={{
              padding: '12px 16px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#B39DDB',
              color: '#FFF',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0px 4px 10px rgba(179, 157, 219, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            ➕ Novo
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '20px 16px',
          borderRadius: '24px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
          border: '1px solid #E1F5FE',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3
            style={{
              margin: 0,
              color: '#2C3E50',
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            Marcar Alergias Ativas
          </h3>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.8rem',
              color: '#7F8C8D',
              fontWeight: '500',
            }}
          >
            Selecione quais componentes o app deve barrar nos testes.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listaOpcoesAlergias.map((alergia) => {
            const estaMarcada = alergiasSelecionadas.includes(alergia.id);

            return (
              <div
                key={alergia.id}
                onClick={() => onAlternarAlergia(alergia.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  backgroundColor: estaMarcada ? '#FFEBEE' : '#FAFAFA',
                  border: estaMarcada
                    ? '2px solid #FFCDD2'
                    : '2px solid #EEEEEE',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{alergia.icone}</span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: estaMarcada ? '#C62828' : '#34495E',
                      fontSize: '0.95rem',
                    }}
                  >
                    {alergia.nome}
                  </span>
                </div>

                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: estaMarcada
                      ? '2px solid #D32F2F'
                      : '2px solid #BDBDBD',
                    backgroundColor: estaMarcada ? '#D32F2F' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {estaMarcada && '✓'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
