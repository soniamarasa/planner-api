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
      .send({
        message: 'An error occurred while searching for items.' + error,
      });
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
      res.send({ message: 'No items found' });
    } else {
      res.send(getItems);
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'An error occurred while searching for items' + error });
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
        .send({
          message: 'An error occurred while registering the item.' + error,
        });
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
        .send({ message: 'You do not have permission to edit this item.' });
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
        message: 'Item not found.',
      });
    } else {
      res.send(itemEdited);
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'An error occurred while editing the item.' + error });
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
        message:
          'You do not have permission to change the status of this item.',
      });
    }
    const classUpdate = await itemModel.findByIdAndUpdate(
      {
        _id: id,
      },
      itemClassUpdate,
      {
        new: true,
      }
    );

    if (!classUpdate) {
      res.send({
        message: 'Item not found.',
      });
    } else {
      res.send(classUpdate);
    }
  } catch (error) {
    res
      .status(500)
      .send({
        message: 'An error occurred while updating the status.' + error,
      });
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
        message: "You don't have permission to delete this item.",
      });
    }

    const dataId = await itemModel.findByIdAndRemove({
      _id: id,
    });
    if (!dataId) {
      res.send({
        message: 'Item not found.',
      });
    } else {
      res.send({ message: 'Successfully deleted item!' });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'An error occurred while deleting the item.' + error });
  }
};

const resetData = async (req, res) => {
  const userId = req.userId;
  console.log(req.userId);

  try {

    await itemModel.deleteMany({ userId: userId });
    res.send({ message: 'Items were successfully deleted' });
  } catch (error) {
    res
      .status(500)
      .send({ message: 'An error occurred while deleting the items' + error });
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
