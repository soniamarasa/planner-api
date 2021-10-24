import express from 'express';
import { renderItems, filterRenderItems, newItem, editItem, updateStatus, deleteItem, resetData } from '../services/itemService.js';

const router = express.Router() //-> Responsável por fazer o roteamento das rotas

router.get('/getItems', renderItems); //-> (rota não usada(ver 2ª rota)) renderizando itens na pagina
router.get('/getItems/:where', filterRenderItems); //-> Para renderizar os itens de acordo com a propriedade where ( segunda recebe itens com where = mon)
router.post('/postItem', newItem); //-> Para criar um novo item
router.put('/editItem/:id', editItem); //-> Para editar item
router.put('/updateStatus/:id', updateStatus); //-> Para aplicar classes de status no item 
router.delete('/deleteItem/:id', deleteItem); //-> Para deletar item clicado
router.delete('/reset', resetData); //-> Para resetar todos dados e configurações

export default router;