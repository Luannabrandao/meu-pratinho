import './Mascote.css';

interface MascoteProps {
  status: 'inicial' | 'analisando' | 'sucesso' | 'perigo';
}

export function Mascote({ status }: MascoteProps) {
  const obterDadosMascote = () => {
    switch (status) {
      case 'inicial':
        return {
          emoji: '🧸',
          mensagem: 'Olá! Vamos escanear um papa hoje?',
          classeCss: 'mascote-inicial',
        };
      case 'analisando':
        return {
          emoji: '🕵️',
          mensagem: 'Deixa eu olhar esse rótulo... Detetive em ação!',
          classeCss: 'mascote-carregando',
        };
      case 'sucesso':
        return {
          emoji: '🎉',
          mensagem: 'EBA! Esse pratinho está liberado e seguro!',
          classeCss: 'mascote-sucesso',
        };
      case 'perigo':
        return {
          emoji:
            '🧸🔍 🛑' /* Ursinho detetive com a placa de alerta como no seu exemplo! */,
          mensagem: 'CUIDADO! Esse item contém componentes alérgicos!',
          classeCss: 'mascote-perigo',
        };
      default:
        return {
          emoji: '🧸',
          mensagem: 'Olá! Vamos escanear um papa hoje?',
          classeCss: '',
        };
    }
  };

  const { emoji, mensagem, classeCss } = obterDadosMascote();

  return (
    <div
      className={`mascote-container ${classeCss}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <div className="mascote-avatar">
        <span
          className="mascote-emoji"
          style={{ fontSize: status === 'perigo' ? '4rem' : '5rem' }}
        >
          {emoji}
        </span>
      </div>
      <p
        className="mascote-texto"
        style={{
          margin: 0,
          color: status === 'perigo' ? '#C62828' : 'var(--color-text-main)',
        }}
      >
        {mensagem}
      </p>
    </div>
  );
}
