-- Criar tabela de coordenadas de cidades
CREATE TABLE city_coordinates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, state)
);

-- Índice para busca rápida
CREATE INDEX idx_city_coordinates_location ON city_coordinates(city, state);

-- RLS Policy
ALTER TABLE city_coordinates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for city coordinates"
  ON city_coordinates FOR SELECT
  USING (true);

-- Popular com principais cidades do agro brasileiro
INSERT INTO city_coordinates (city, state, latitude, longitude) VALUES
  ('CUIABÁ', 'MT', -15.6014, -56.0979),
  ('UBERABA', 'MG', -19.7479, -47.9382),
  ('IBIPORÃ', 'PR', -23.2661, -51.0569),
  ('RONDONÓPOLIS', 'MT', -16.4708, -54.6353),
  ('SINOP', 'MT', -11.8641, -55.5022),
  ('CAMPO GRANDE', 'MS', -20.4428, -54.6464),
  ('DOURADOS', 'MS', -22.2209, -54.8055),
  ('UBERLÂNDIA', 'MG', -18.9186, -48.2772),
  ('RIO VERDE', 'GO', -17.7973, -50.9263),
  ('GOIÂNIA', 'GO', -16.6869, -49.2648),
  ('BRASÍLIA', 'DF', -15.8267, -47.9218),
  ('PALMAS', 'TO', -10.1840, -48.3336),
  ('SÃO PAULO', 'SP', -23.5505, -46.6333),
  ('CAMPINAS', 'SP', -22.9099, -47.0626),
  ('RIBEIRÃO PRETO', 'SP', -21.1767, -47.8108),
  ('LONDRINA', 'PR', -23.3045, -51.1696),
  ('CASCAVEL', 'PR', -24.9555, -53.4552),
  ('PASSO FUNDO', 'RS', -28.2630, -52.4067),
  ('SANTA MARIA', 'RS', -29.6842, -53.8069),
  ('PORTO ALEGRE', 'RS', -30.0346, -51.2177);

-- Criar função de cálculo de distância usando Haversine
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 numeric, lon1 numeric,
  lat2 numeric, lon2 numeric
) RETURNS numeric AS $$
DECLARE
  earth_radius numeric := 6371; -- Raio da Terra em km
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN ROUND(earth_radius * c);
END;
$$ LANGUAGE plpgsql IMMUTABLE;