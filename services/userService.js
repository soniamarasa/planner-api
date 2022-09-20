import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as Yup from 'yup';

import userModel from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

const createAccount = async (req, res) => {
  let { email, password } = req.body;

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required().min(6),
    name: Yup.string().required(),
    birthdate: Yup.date().required(),
    gender: Yup.string().required(),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Falha na validação.' });

  const userExists = await userModel.findOne({
    email,
  });

  if (userExists) return res.status(400).json({ error: 'Usuário já existe.' });

  req.body.password = await bcrypt.hash(password, 8);

  try {
    const { id, name, email, gender, birthdate } = await userModel.create(
      req.body
    );
    return res.json({ id, name, email, gender, birthdate });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: 'Não foi possível criar a sua conta' });
  }
};

const login = async (req, res) => {
  let { email, password } = req.body;

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required().min(6),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Falha na validação.' });

  const userExists = await userModel.findOne({
    email,
  });

  if (!userExists)
    return res.status(400).json({ error: 'Usuário não existe.' });
  else {
    const checkPassword = await bcrypt.compare(password, userExists.password);

    if (checkPassword) {
      const { _id, email, name, gender, birthdate, password } = userExists;
      return res.json({
        user: {
          id: _id,
          name,
          email,
          gender,
          birthdate,
          token: jwt.sign({ _id }, process.env.SECRET, {
            expiresIn: process.env.EXPIRESIN,
          }),
        },
      });
    } else {
      return res.status(400).json({ error: 'Senha incorreta' });
    }
  }
};

const logout = async (req, res) => {
  let { id } = req.body;

  const userExists = await userModel.findById({
    _id: id,
  });

  if (!userExists)
    return res.status(400).json({ error: 'Usuário não existe.' });
  else {
    return res.json({
      user: null,
    });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.idUser;
  try {
    let user = await userModel.find({
      _id: userId,
    });

    delete user['password'];

    res.send(user);
  } catch (error) {
    res.send(500).send({ message: 'Usuário não encontrado' + error });
  }
};

const updateUser = async (req, res) => {
  let {
    email,
    password,
    name,
    gender,
    birthdate,
    oldPassword,
    confirmPassword,
  } = req.body;
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: 'campo id inválido' });

  const schema = Yup.object().shape({
    name: Yup.string(),
    email: Yup.string().email(),
    birthdate: Yup.date(),
    gender: Yup.string(),
    oldPassword: Yup.string().min(6),
    password: Yup.string()
      .min(6)
      .when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
    confirmPassword: Yup.string().when('password', (password, field) =>
      password ? field.required().oneOf([Yup.ref('password')]) : field
    ),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Falha na validação.' });

  const userExists = await userModel.findById({
    _id: id,
  });

  if (!userExists)
    return res.status(400).json({ error: 'Usuário não existe.' });
  else {
    if (email !== userExists.email) {
      const emailExists = await userModel.findOne({
        email,
      });

      if (emailExists)
        return res.status(400).json({ error: 'Email já cadastrado!' });
    }

    if (oldPassword) {
      const checkPassword = await bcrypt.compare(
        oldPassword,
        userExists.password
      );
      if (!checkPassword)
        return res.status(401).json({ error: 'Senha incorreta.' });
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return res.status(401).json({ error: 'Senhas não conferem.' });
    }

    if (password) req.body.password = await bcrypt.hash(password, 8);

    const userUpdated = {
      email,
      name,
      gender,
      birthdate,
      ...(oldPassword && { password: req.body.password }),
    };

    const userEdited = await userModel.findByIdAndUpdate(
      {
        _id: id,
      },
      userUpdated,
      {
        new: true,
      }
    );
    return res.json(userEdited);
  }
};

const recoverPassword = async (req, res) => {
  let { email } = req.body;

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Falha na validação.' });

  const userExists = await userModel.findOne({
    email,
  });

  if (!userExists)
    return res.status(400).json({ error: 'Usuário não existe.' });
  else {
    const link = `${process.env.BASE_URL}/password-reset/${userExists._id}`;
    await sendEmail(userExists.email, 'Redefinir nova senha', link);

    return res.json({
      message:
        'O link para redefinir uma nova senha foi enviado para o seu email',
    });
  }
};

const resetPassword = async (req, res) => {
  let { password, userId } = req.body;

  const schema = Yup.object().shape({
    userId: Yup.string().required(),
    password: Yup.string().required().min(6),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Falha na validação.' });

  const userExists = await userModel.findById({
    _id: userId,
  });

  if (!userExists)
    return res.status(400).json({ error: 'Usuário não existe.' });
  else {
    req.body.password = await bcrypt.hash(password, 8);

    const userUpdated = {
      email: userExists.email,
      name: userExists.name,
      gender: userExists.gender,
      birthdate: userExists.birthdate,
      password: req.body.password,
    };

    await userModel.findByIdAndUpdate(
      {
        _id: userId,
      },
      userUpdated
    );
    return res.json({ message: 'Senha alterada com sucesso!' });
  }
};

const authorization = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(401).json({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: 'Failed to authenticate token.' });

    req.userId = decoded.id;
    next();
  });
};

export {
  login,
  logout,
  authorization,
  createAccount,
  updateUser,
  recoverPassword,
  resetPassword,
  getUser,
};
