import { useState } from 'react';
import type { Crianca } from '../App';

interface CadastroProps {
  onSalvar: (nova: Crianca) => void;
  onCancelar: () => void;
}

const OPCOES_ALERGIAS = [
  { id: 'leite', nome: '🥛 Leite' },
  { id: 'ovo', nome: '🥚 Ovo' },
  { id: 'soja', nome: '🫘 Soja' },
  { id: 'gluten', nome: '🌾 Glúten' },
  { id: 'amendoim', nome: '🥜 Amendoim' },
];

export function Cadastro({ onSalvar, onCancelar }: CadastroProps) {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [alergiasMarcadas, setAlergiasMarcadas] = useState<string[]>([]);

  const alternarSelecaoAlergia = (id: string) => {
    setAlergiasMarcadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const executarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !idade.trim())
      return alert('Por favor, preencha o nome e a idade!');

    const novaCrianca: Crianca = {
      id: Date.now().toString(),
      nome,
      idade: idade.includes('ano') ? idade : `${idade} anos`,
      alergias: alergiasMarcadas,
    };

    onSalvar(novaCrianca);
  };

  return (
    <form
      onSubmit={executarEnvio}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        padding: '10px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#5C6BC0', fontSize: '1.3rem' }}>
          Cadastrar Nova Criança
        </h2>
        <p style={{ color: '#7F8C8D', fontSize: '0.8rem' }}>
          Adicione um novo perfil ao banco
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#34495E' }}
        >
          Nome da Criança
        </label>
        <input
          type="text"
          placeholder="Ex: Clara Victoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '2px solid #B2EBF2',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#34495E' }}
        >
          Idade
        </label>
        <input
          type="text"
          placeholder="Ex: 7 anos"
          value={idade}
          onChange={(e) => setIdade(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '2px solid #B2EBF2',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#34495E' }}
        >
          Selecione as Alergias Prévias
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {OPCOES_ALERGIAS.map((item) => {
            const selecionado = alergiasMarcadas.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => alternarSelecaoAlergia(item.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: selecionado
                    ? '2px solid #5C6BC0'
                    : '1px solid #B2EBF2',
                  backgroundColor: selecionado ? '#E8EAF6' : '#FFF',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                }}
              >
                <span>{item.nome}</span>
                {selecionado && <span>✅</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={onCancelar}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#E0E0E0',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#5C6BC0',
            color: '#FFF',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          💾 Salvar no Banco
        </button>
      </div>
    </form>
  );
}
