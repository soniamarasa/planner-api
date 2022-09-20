import mongoose from 'mongoose';
import itemModel from '../models/itemModel.js';

const renderItems = async (req, res) => {
  const userId = req.params.userId;
  try {
    const getItems = await itemModel.find({
      userId: userId,
    });
    res.send(getItems);
  } catch (error) {
    res
      .send(500)
      .send({ message: 'Ocorreu um erro na busca de itens' + error });
  }
};

const filterRenderItems = async (req, res) => {
  let filterWhere = req.params.where;
  const userId = req.params.userId;
  filterWhere.toString();

  try {
    const getItems = await itemModel.find({
      userId: userId,
      where: filterWhere,
    });
    if (!getItems) {
      res.send({ message: 'Nenhum item encontrado' });
    } else {
      res.send(getItems);
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Ocorreu um erro na busca dos itens' + error });
  }
};

const newItem = async (req, res) => {
  const { description, type, where, obs } = req.body;
  const userId = req.params.userId;
  let item;
  let itemsArray = [];
  for (let i = 0; i < where.length; i++) {
    item = new itemModel({
      userId,
      description,
      type,
      where: where[i],
      obs,
      started: false,
      finished: false,
      important: false,
      canceled: false,
    });
    itemsArray.push(item);

    try {
      await item.save();
    } catch (error) {
      res
        .status(500)
        .send({ message: 'Ocorreu um erro ao cadastrar o item' + error });
    }
  }
  res.send(itemsArray);
};

const editItem = async (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const { description, type, where, obs } = req.body;

  const itemEdit = {
    description,
    type,
    where,
    obs,
    userId,
  };

  try {
    const item = await itemModel.findById({
      _id: id,
    });
    if (item.userId !== userId) {
      return res
        .status(500)
        .send({ message: 'Você não tem permissão para editar esse item.' });
    }

    const itemEdited = await itemModel.findByIdAndUpdate(
      {
        _id: id,
      },
      itemEdit,
      {
        new: true, //->mostra o item depois de editar
      }
    );

    if (!itemEdited) {
      res.send({
        message: 'Item nao encontrado',
      });
    } else {
      res.send(itemEdited);
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Ocorreu um erro ao editar o item' + error });
  }
};

const updateStatus = async (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const { started, finished, important, canceled } = req.body;

  const itemClassUpdate = {
    started,
    finished,
    important,
    canceled,
  };

  try {
    const item = await itemModel.findById({
      _id: id,
    });
    if (item.userId !== userId) {
      return res.status(500).send({
        message: 'Você não tem permissão para alterar o status desse item.',
      });
    }
    const classUpdate = await itemModel.findByIdAndUpdate(
      {
        _id: id,
      },
      itemClassUpdate,
      {
        new: true
      }
    );

    if (!classUpdate) {
      res.send({
        message: 'Item nao encontrado',
      });
    } else {
      res.send(classUpdate);
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Ocorreu um erro ao atualizar o status' + error });
  }
};

const deleteItem = async (req, res) => {
  const id = req.params.id;
  const userId = req.params.userId;

  try {
    const item = await itemModel.findById({
      _id: id,
    });
    if (item.userId !== userId) {
      return res.status(500).send({
        message: 'Você não tem permissão para alterar o status desse item.',
      });
    }

    const dataId = await itemModel.findByIdAndRemove({
      _id: id,
    });
    if (!dataId) {
      res.send({
        message: 'Item nao encontrado',
      });
    } else {
      res.send({ message: 'Item excluido com sucesso!' });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Ocorreu um erro em deletar o item' + error });
  }
};

const resetData = async (req, res) => {
  const userId = req.params.userId;

  try {
    const item = await itemModel.findById({
      _id: id,
    });
    if (item.userId !== userId) {
      return res.status(500).send({
        message: 'Você não tem permissão para alterar o status desse item.',
      });
    }

    await itemModel.deleteMany();
    res.send({ message: 'Itens deletados com sucesso' });
  } catch (error) {
    res.status(500).send({ message: 'Ocorreu um erro ao resetar' + error });
  }
};

export {
  renderItems,
  filterRenderItems,
  newItem,
  editItem,
  updateStatus,
  deleteItem,
  resetData,
};
