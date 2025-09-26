import { Helmet } from 'react-helmet-async';
import MariaValentinaClientRegistration from '@/components/representative/MariaValentinaClientRegistration';
import { useNavigate } from 'react-router-dom';

export default function MariaValentinaRegistration() {
  const navigate = useNavigate();
  const viniciusMotaId = "eca32c26-3658-4cd2-9b07-ea7e30b10dce";

  return (
    <>
      <Helmet>
        <title>Cadastro Maria Valentina dos Santos - AgroIkemba</title>
        <meta 
          name="description" 
          content="Cadastro completo da cliente Maria Valentina dos Santos com dados rurais e comerciais."
        />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <MariaValentinaClientRegistration 
          representativeId={viniciusMotaId}
          onSuccess={() => {
            navigate('/representative');
          }}
        />
      </div>
    </>
  );
}