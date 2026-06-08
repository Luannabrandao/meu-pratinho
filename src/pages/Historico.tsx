export function Historico() {
  const itensFicticios = [
    { id: 1, nome: 'Macarrão Bifum', status: 'liberado', icone: '🎉' },
    { id: 2, nome: 'Biscoito de Chocolate', status: 'perigo', icone: '✋' },
    { id: 3, nome: 'Papinha de Maçã', status: 'liberado', icone: '🎉' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        padding: '10px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#5C6BC0', fontSize: '1.4rem' }}>
          Análises Recentes
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Histórico do painel de controle
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {itensFicticios.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-button)',
              border: `2px solid ${item.status === 'liberado' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            }}
          >
            <span
              style={{ fontWeight: '600', color: 'var(--color-text-main)' }}
            >
              {item.nome}
            </span>
            <span style={{ fontSize: '1.2rem' }}>{item.icone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
