-- Adicionar coordenadas das principais cidades agrícolas do Brasil

-- Minas Gerais
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('UBERABA', 'MG', -19.7472, -47.9382),
  ('UBERLÂNDIA', 'MG', -18.9186, -48.2772),
  ('BELO HORIZONTE', 'MG', -19.9167, -43.9345),
  ('PARACATU', 'MG', -17.2222, -46.8750),
  ('PATOS DE MINAS', 'MG', -18.5789, -46.5181)
ON CONFLICT (city, state) DO NOTHING;

-- São Paulo
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('BARUERI', 'SP', -23.5106, -46.8764),
  ('SÃO PAULO', 'SP', -23.5505, -46.6333),
  ('RIBEIRÃO PRETO', 'SP', -21.1704, -47.8103),
  ('PIRACICABA', 'SP', -22.7253, -47.6492),
  ('CAMPINAS', 'SP', -22.9099, -47.0626)
ON CONFLICT (city, state) DO NOTHING;

-- Rio Grande do Sul
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('PORTO ALEGRE', 'RS', -30.0346, -51.2177),
  ('CAXIAS DO SUL', 'RS', -29.1678, -51.1794),
  ('PASSO FUNDO', 'RS', -28.2625, -52.4083),
  ('CRUZ ALTA', 'RS', -28.6389, -53.6056),
  ('SANTA ROSA', 'RS', -27.8717, -54.4814)
ON CONFLICT (city, state) DO NOTHING;

-- Santa Catarina
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('FLORIANÓPOLIS', 'SC', -27.5954, -48.5480),
  ('CHAPECÓ', 'SC', -27.0964, -52.6146),
  ('BLUMENAU', 'SC', -26.9194, -49.0661),
  ('CAMPOS NOVOS', 'SC', -27.4008, -51.2264)
ON CONFLICT (city, state) DO NOTHING;

-- Bahia
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('LUÍS EDUARDO MAGALHÃES', 'BA', -12.0967, -45.7917),
  ('BARREIRAS', 'BA', -12.1520, -44.9900),
  ('SALVADOR', 'BA', -12.9714, -38.5014),
  ('FORMOSA DO RIO PRETO', 'BA', -11.0431, -45.1944)
ON CONFLICT (city, state) DO NOTHING;

-- Maranhão
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('BALSAS', 'MA', -7.5326, -46.0356),
  ('IMPERATRIZ', 'MA', -5.5264, -47.4791),
  ('SÃO LUÍS', 'MA', -2.5387, -44.2825),
  ('TASSO FRAGOSO', 'MA', -8.5000, -46.2333)
ON CONFLICT (city, state) DO NOTHING;

-- Piauí
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('URUÇUÍ', 'PI', -7.2394, -44.5494),
  ('BOM JESUS', 'PI', -9.0742, -44.3594),
  ('TERESINA', 'PI', -5.0892, -42.8019),
  ('BAIXA GRANDE DO RIBEIRO', 'PI', -7.8500, -45.2167)
ON CONFLICT (city, state) DO NOTHING;

-- Mato Grosso
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('SORRISO', 'MT', -12.5428, -55.7153),
  ('LUCAS DO RIO VERDE', 'MT', -13.0539, -55.9086),
  ('SINOP', 'MT', -11.8608, -55.5050),
  ('SAPEZAL', 'MT', -13.5406, -58.7656),
  ('CUIABÁ', 'MT', -15.6014, -56.0979)
ON CONFLICT (city, state) DO NOTHING;

-- Mato Grosso do Sul
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('DOURADOS', 'MS', -22.2211, -54.8056),
  ('CAMPO GRANDE', 'MS', -20.4697, -54.6201),
  ('MARACAJU', 'MS', -21.6114, -55.1681)
ON CONFLICT (city, state) DO NOTHING;

-- Goiás
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('RIO VERDE', 'GO', -17.7997, -50.9267),
  ('JATAÍ', 'GO', -17.8814, -51.7153),
  ('GOIÂNIA', 'GO', -16.6869, -49.2648),
  ('CRISTALINA', 'GO', -16.7681, -47.6136)
ON CONFLICT (city, state) DO NOTHING;

-- Tocantins
INSERT INTO public.city_coordinates (city, state, latitude, longitude)
VALUES 
  ('PALMAS', 'TO', -10.2128, -48.3603),
  ('PORTO NACIONAL', 'TO', -10.7083, -48.4167),
  ('GURUPI', 'TO', -11.7294, -49.0686)
ON CONFLICT (city, state) DO NOTHING;

-- Criar índice para melhorar performance de buscas (se não existir)
CREATE INDEX IF NOT EXISTS idx_city_coordinates_lookup 
ON public.city_coordinates (city, state);