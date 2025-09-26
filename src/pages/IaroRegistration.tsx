import { Helmet } from 'react-helmet-async';
import IaroClientRegistration from '@/components/representative/IaroClientRegistration';
import { useNavigate } from 'react-router-dom';

export default function IaroRegistration() {
  const navigate = useNavigate();
  const viniciusMotaId = "eca32c26-3658-4cd2-9b07-ea7e30b10dce";

  return (
    <>
      <Helmet>
        <title>Cadastro Iaro Marques Dib - AgroIkemba</title>
        <meta 
          name="description" 
          content="Cadastro completo do cliente Iaro Marques Dib com dados extraídos dos documentos oficiais."
        />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <IaroClientRegistration 
          representativeId={viniciusMotaId}
          onSuccess={() => {
            navigate('/representative');
          }}
        />
      </div>
    </>
  );
}