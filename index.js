import express from 'express'; 
import mongoose from 'mongoose';
import cors from 'cors'; //-> Cors dribla a politica da mesma origem --> permite responder requisições de outro dominio
import dotenv from 'dotenv';
import routes from './routes/routes.js';

dotenv.config();

const app = express(); //-> iniciando o express na const app

const corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));


app.use(express.json()); //-> diz para o express para retornar os dados em formato json

const { DB_CONNECTION } = process.env;

mongoose.connect(
  DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true, },
  (error) => {
    if (error) {
      console.error('Erro na conexão MongoDB' + error);
    }
  }
)

mongoose.connection.once('open',() => {
    console.log('Conectado ao MongoDB');
    const APP_PORT = process.env.PORT;
    app.listen(APP_PORT, () => {
        console.log('Servidor foi iniciado na porta:' + APP_PORT);
    })
})

app.use('/api', routes);
