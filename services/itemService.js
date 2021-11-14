import mongoose from 'mongoose';
import itemModel from '../models/itemModel.js';

const renderItems = async (_, res) => {
  try {
    const getItems = await itemModel.find();
    res.send(getItems);
  } catch (error) {
    res.send(500).send('Ocorreu um erro na busca de itens' + error);
  }
};

const filterRenderItems = async (req, res) => {
  let filterWhere = req.params.where;
  filterWhere.toString();

  try {
    const getItems = await itemModel.find({
      where: filterWhere,
    });
    if (!getItems) {
      res.send('Nenhum item encontrado');
    } else {
      res.send(getItems);
    }
  } catch (error) {
    res.status(500).send('Ocorreu um erro na busca dos itens' + error);
  }
};

const newItem = async (req, res) => {
  const { description, type, where, obs } = req.body;
  for (let i = 0; i < where.length; i++) {
    let item = new itemModel({
      description,
      type,
      where: where[i],
      obs,
      started: false,
      finished: false,
      important: false,
      canceled: false,
    });

    try {
      await item.save();
    } catch (error) {
      res.status(500).send('Ocorreu um erro ao cadastrar o item' + error);
    }
  }
  res.send({message:'Item lançado com sucesso'});
};

const editItem = async (req, res) => {
  const id = req.params.id;
  const { description, type, where, obs } = req.body;

  const itemEdit = {
    description,
    type,
    where,
    obs,
  };

  try {
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
    res.status(500).send('Ocorreu um erro ao editar o item' + error);
  }
};

const updateStatus = async (req, res) => {
  const id = req.params.id;
  const { started, finished, important, canceled } = req.body;

  const itemClassUpdate = {
    started,
    finished,
    important,
    canceled,
  };

  try {
    const classUpdate = await itemModel.findByIdAndUpdate(
      {
        _id: id,
      },
      itemClassUpdate,
      {
        new: true, // -> mostra o item depois de editar
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
    res.status(500).send('Ocorreu um erro ao atualizar o status' + error);
  }
};

const deleteItem = async (req, res) => {
  const id = req.params.id;

  try {
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
    res.status(500).send('Ocorreu um erro em deletar o item' + error);
  }
};

const resetData = async (_, res) => {
  try {
    await itemModel.deleteMany();
    res.send({ message: 'Itens deletados com sucesso' });
  } catch (error) {
    res.status(500).send('Ocorreu um erro ao resetar' + error);
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
