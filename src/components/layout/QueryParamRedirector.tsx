import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QueryParamRedirector = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('p');
    
    if (page === 'video-boas-vindas') {
      // Clean redirect to the video page
      navigate('/video/boas-vindas', { replace: true });
    }
  }, [location.search, navigate]);

  return null;
};

export default QueryParamRedirector;