API simples que serve dados GeoJSON de reclamações/ouvidoria municipal de Belo Horizonte (dados fictícios).

Instalação

```bash
npm install
npm start
```

Endpoints principais

- `GET /map` - retorna um `FeatureCollection` com todos os registros.
- `GET /complaints` - lista com filtros `type`, `status`, `bbox` (minLon,minLat,maxLon,maxLat) e `limit`.
- `GET /complaints/:id` - obtém uma reclamação por id.
- `POST /complaints` - cadastra uma nova reclamação (envie `geometry` e `properties` no body em JSON).

Exemplo de uso

```bash
 Listar todos
curl http://localhost:3000/map

 Filtrar por tipo
curl "http://localhost:3000/complaints?type=Iluminação"

 Criar nova reclamação
curl -X POST http://localhost:3000/complaints \
  -H "Content-Type: application/json" \
  -d '{"geometry": {"type":"Point","coordinates":[-43.94,-19.92]}, "properties": {"title":"Teste","description":"Descrição","type":"Iluminação","status":"Aberto","address":"Endereço de teste"}}'
```

Observações

- Dados são fictícios e servem apenas para demonstração baseada em um wireframe.

Rodando com Docker

```bash
 build
docker build -t bh-ouvidoria-api .

 run
docker run -p 3000:3000 bh-ouvidoria-api
```

Testes

```bash
* instalar dependências de desenvolvimento
npm install
npm test
```
