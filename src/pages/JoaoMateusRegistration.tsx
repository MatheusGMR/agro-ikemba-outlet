import { Helmet } from 'react-helmet-async';
import JoaoMateusClientRegistration from '@/components/representative/JoaoMateusClientRegistration';
import { useNavigate } from 'react-router-dom';

export default function JoaoMateusRegistration() {
  const navigate = useNavigate();
  const viniciusMotaId = "eca32c26-3658-4cd2-9b07-ea7e30b10dce";

  return (
    <>
      <Helmet>
        <title>Cadastro João Mateus - AgroIkemba</title>
        <meta 
          name="description" 
          content="Cadastro completo do cliente João Mateus de Oliveira Macedo com dados extraídos dos documentos oficiais."
        />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <JoaoMateusClientRegistration 
          representativeId={viniciusMotaId}
          onSuccess={() => {
            navigate('/representative');
          }}
        />
      </div>
    </>
  );
}