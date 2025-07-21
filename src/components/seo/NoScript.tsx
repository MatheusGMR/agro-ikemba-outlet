
const NoScript = () => {
  return (
    <noscript>
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        margin: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>AgroIkemba - Insumos Agrícolas Genéricos</h1>
        <p>
          Plataforma B2B líder em insumos agrícolas genéricos. 
          Fertilizantes e defensivos com mesma qualidade, preços 25% menores.
        </p>
        <p>
          <strong>Para uma melhor experiência, ative o JavaScript em seu navegador.</strong>
        </p>
        <div style={{ marginTop: '20px' }}>
          <h2>Nossos Serviços:</h2>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Fertilizantes genéricos com economia de até 25%</li>
            <li>Defensivos agrícolas de alta qualidade</li>
            <li>Comparação de fornecedores</li>
            <li>Plataforma B2B especializada</li>
          </ul>
        </div>
        <p>
          <strong>Contato:</strong> +55 43 98406-4141
        </p>
      </div>
    </noscript>
  );
};

export default NoScript;
