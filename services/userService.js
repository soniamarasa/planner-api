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
    password: Yup.string().required().min(8),
    name: Yup.string().required(),
    birthdate: Yup.date().required(),
    gender: Yup.string().required(),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Validation failed.' });

  const userExists = await userModel.findOne({
    email,
  });

  if (userExists)
    return res.status(400).json({ error: 'User already exists.' });

  req.body.password = await bcrypt.hash(password, 8);

  try {
    const { id, name, email, gender, birthdate } = await userModel.create(
      req.body
    );
    return res.json({ id, name, email, gender, birthdate });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Unable to create your account.' });
  }
};

const login = async (req, res) => {
  let { email, password } = req.body;

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Validation failed.' });

  const userExists = await userModel.findOne({
    email,
  });

  if (!userExists)
    return res.status(400).json({ error: 'User does not exist.' });
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
      return res.status(400).json({ error: 'Incorrect password.' });
    }
  }
};

const logout = async (req, res) => {
  let { id } = req.body;

  const userExists = await userModel.findById({
    _id: id,
  });

  if (!userExists)
    return res.status(400).json({ error: 'User does not exist.' });
  else {
    return res.json({
      user: null,
    });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    let user = await userModel.findOne({
      _id: userId,
    });

    delete user['password'];

    res.send(user);
  } catch (error) {
    res.send(500).send({ message: 'User not found' + error });
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

  if (!id) return res.status(400).json({ error: 'Invalid id field' });

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
    return res.status(400).json({ error: 'Validation failed.' });

  const userExists = await userModel.findById({
    _id: id,
  });

  if (!userExists)
    return res.status(400).json({ error: 'User does not exist.' });
  else {
    if (email !== userExists.email) {
      const emailExists = await userModel.findOne({
        email,
      });

      if (emailExists)
        return res.status(400).json({ error: 'E-mail already registered!' });
    }

    if (oldPassword) {
      const checkPassword = await bcrypt.compare(
        oldPassword,
        userExists.password
      );
      if (!checkPassword)
        return res.status(400).json({ error: 'Incorrect password.' });
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
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
  let { email, host } = req.body;

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Validation failed.' });

  const userExists = await userModel.findOne({
    email,
  });

  if (!userExists)
    return res.status(400).json({ error: 'User does not exist.' });
  else {
    let token = jwt.sign({ _id: userExists._id }, process.env.SECRET, {
      expiresIn: '2h',
    });

    const link = `${host}/password-reset/${token}`;
    await sendEmail(userExists.email, 'Reset your password', link);

    return res.json({
      message: 'The link to reset a new password has been sent to your email.',
    });
  }
};

const resetPassword = async (req, res) => {
  let { password } = req.body;
  const userId = req.userId;

  const schema = Yup.object().shape({
    password: Yup.string().required().min(8),
  });

  if (!(await schema.isValid(req.body)))
    return res.status(400).json({ error: 'Validation failed.' });

  const userExists = await userModel.findById({
    _id: userId,
  });

  if (!userExists)
    return res.status(400).json({ error: 'User does not exist.' });
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
    return res.json({ message: 'Password changed successfully!' });
  }
};

const authorization = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(401).json({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err)
      return res
        .status(401)
        .json({ auth: false, message: 'Failed to authenticate token.' });

    req.userId = decoded._id;
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
