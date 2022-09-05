import express from 'express';
import { renderItems, filterRenderItems, newItem, editItem, updateStatus, deleteItem, resetData } from '../services/itemService.js';
import { createAccount, login, recoverPassword, resetPassword, updateUser } from '../services/userService.js';


const router = express.Router() //-> Responsável por fazer o roteamento das rotas


router.post('/createAccount', createAccount); // -> Cadastro usuario
router.post('/login', login); // -> Login usuario
router.put('/updateUser/:id', updateUser); // -> Update user
router.post('/recoverPassword', recoverPassword); // -> Recover
router.post('/resetPassword', resetPassword); // -> Reset

router.get('/getItems/:idUser', renderItems); //-> (rota não usada(ver 2ª rota)) renderizando itens na pagina
router.get('/getItems/:idUser/:where', filterRenderItems); //-> Para renderizar os itens de acordo com a propriedade where ( segunda recebe itens com where = mon)
router.post('/postItem/:idUser', newItem); //-> Para criar um novo item
router.put('/editItem/:idUser/:id', editItem); //-> Para editar item
router.put('/updateStatus/:idUser/:id', updateStatus); //-> Para aplicar classes de status no item 
router.delete('/deleteItem/:idUser/:id', deleteItem); //-> Para deletar item clicado
router.delete('/:idUser/reset', resetData); //-> Para resetar todos dados e configurações

export default router;