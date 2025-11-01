# Task List Application

Uma aplicação completa de lista de tarefas (To-Do List) construída com Node.js, Express, LevelDB e Jest.

## Funcionalidades

- ✅ CRUD completo de tarefas (Criar, Ler, Atualizar, Deletar)
- 💾 Persistência local com LevelDB
- 🎨 Interface web responsiva em HTML/CSS/JavaScript
- ✅ Testes automatizados com Jest
- 🚀 API RESTful

## Tecnologias

- **Backend**: Node.js, Express.js
- **Banco de Dados**: LevelDB (persistência local)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Testes**: Jest, Supertest

## Instalação

```bash
cd server
npm install
```

## Executando a Aplicação

```bash
cd server
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Executando os Testes

```bash
cd server
npm test
```

## Estrutura do Projeto

```
helloworld/
├── README.md            # Este arquivo
└── server/              # Pasta do servidor
    ├── index.js              # Servidor Express e rotas da API
    ├── taskManager.js        # Gerenciador de tarefas com LevelDB
    ├── public/
    │   ├── index.html        # Interface do usuário
    │   └── app.js           # Lógica frontend
    ├── taskManager.test.js   # Testes do TaskManager
    ├── api.test.js          # Testes da API
    └── jest.config.js       # Configuração do Jest
```

## API Endpoints

### Criar Tarefa
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Título da tarefa",
  "description": "Descrição opcional"
}
```

### Listar Todas as Tarefas
```
GET /api/tasks
```

### Obter Tarefa Específica
```
GET /api/tasks/:id
```

### Atualizar Tarefa
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Novo título",
  "description": "Nova descrição",
  "completed": true
}
```

### Deletar Tarefa
```
DELETE /api/tasks/:id
```

### Health Check
```
GET /health
```

## Uso da Interface Web

1. Acesse `http://localhost:3000` no navegador
2. Digite o título da tarefa (obrigatório) e descrição (opcional)
3. Clique em "Adicionar Tarefa"
4. Use os botões para:
   - ✓ Concluir / ↩ Reabrir: Marcar tarefa como concluída ou reabrir
   - 🗑 Excluir: Remover a tarefa

## Exemplos de Uso da API

### Criar uma nova tarefa
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Comprar leite", "description": "No supermercado"}'
```

### Listar todas as tarefas
```bash
curl http://localhost:3000/api/tasks
```

### Marcar tarefa como concluída
```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Deletar uma tarefa
```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## Persistência de Dados

Os dados são armazenados localmente no diretório `./db` usando LevelDB. As tarefas são mantidas mesmo após reiniciar a aplicação.

## Testes

A aplicação inclui testes completos para:
- ✅ Todas as operações CRUD do TaskManager
- ✅ Todos os endpoints da API
- ✅ Validações e tratamento de erros

Total de testes: 31 casos de teste

## Licença

ISC
