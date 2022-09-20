import express from 'express';
import {
  renderItems,
  filterRenderItems,
  newItem,
  editItem,
  updateStatus,
  deleteItem,
  resetData,
} from '../services/itemService.js';
import {
  createAccount,
  login,
  logout,
  recoverPassword,
  resetPassword,
  getUser,
  updateUser,
  authorization,
} from '../services/userService.js';

const router = express.Router(); //-> Responsável por fazer o roteamento das rotas

router.post('/createAccount', createAccount);
router.post('/login', login);
router.post('/logout', logout);

router.post('/retrievePassword', recoverPassword);
router.post('/resetPassword', resetPassword);

router.get('/user/:userId', authorization, getUser);
router.put('/updateUser/:id', authorization, updateUser);

router.get('/getItems/:userId', authorization, renderItems); //-> (rota não usada(ver 2ª rota)) renderizando itens na pagina
router.get('/getItems/:userId/:where', authorization, filterRenderItems); //-> Para renderizar os itens de acordo com a propriedade where ( segunda recebe itens com where = mon)
router.post('/postItem/:userId', authorization, newItem);
router.put('/editItem/:userId/:id', authorization, editItem);
router.put('/updateStatus/:userId/:id', authorization, updateStatus);
router.delete('/deleteItem/:userId/:id', authorization, deleteItem);
router.delete('/:userId/reset', authorization, resetData);

export default router;
