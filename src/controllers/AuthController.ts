import type { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmails';
import { generateJWT, verifyJWT } from '../utils/jwt';

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (user) {
        const error = new Error('El email ya está registrado en el sistema');
        res.status(409).json({ error: error.message });
        return;
      }
      const newUser = await User.create(req.body);
      newUser.password = await hashPassword(password);
      const token = generateToken();
      newUser.token = token;

      if (process.env.NODE_ENV !== 'production') {
        globalThis.cashTrackrConfirmationToken = token;
      }

      await newUser.save();
      await AuthEmail.sendConfirmationEmail({
        name: newUser.name,
        email: newUser.email,
        token: newUser.token,
      });
      res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
      res.status(500).json({ error: error.message });
      return;
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const user = await User.findOne({ where: { token } });
      if (!user) {
        const error = new Error('El token es incorrecto');
        res.status(401).json({ error: error.message });
        return;
      }
      user.confirmed = true;
      user.token = null;
      await user.save();
      res
        .status(200)
        .json({ message: 'Usuario confirmado, ya puedes iniciar sesión' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error('Usuario no registrado en el sistema');
        res.status(404).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const error = new Error(
          'Necesitas confirmar tu cuenta para poder iniciar sesión'
        );
        res.status(403).json({ error: error.message });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        const error = new Error('La contraseña es incorrecta');
        res.status(401).json({ error: error.message });
        return;
      }

      const token = generateJWT(user.id);

      if (process.env.NODE_ENV !== 'production') {
        globalThis.cashTrackrJWT = token;
      }

      res.status(200).json({ message: 'Inicio de sesión correcto', token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error('El email no se encuentra en el sistema');
        res.status(404).json({ error: error.message });
        return;
      }
      user.token = generateToken();
      await user.save();
      await AuthEmail.sendPasswordResetToken({
        name: user.name,
        email: user.email,
        token: user.token,
      });
      res
        .status(200)
        .json({ message: 'Revisa tu email para reestablecer la contraseña' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await User.findOne({ where: { token } });
      if (!tokenExist) {
        const error = new Error('Token incorrecto, verificalo');
        res.status(403).json({ error: error.message });
        return;
      }
      res
        .status(200)
        .json({
          message: 'Token correcto, ahora puedes cambiar tu contraseña',
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
      const user = await User.findOne({ where: { token } });
      if (!user) {
        const error = new Error('Token invalido, verificalo');
        res.status(404).json({ error: error.message });
        return;
      }

      user.password = await hashPassword(password);
      user.token = null;
      await user.save();
      res.status(200).json({ message: 'Contraseña restaurada con éxito' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    try {
      const { current_password, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);
      const isPasswordCorrect = await comparePassword(
        current_password,
        user.password
      );
      if (!isPasswordCorrect) {
        const error = new Error('La contraseña es incorrecta');
        res.status(404).json({ error: error.message });
        return;
      }
      user.password = await hashPassword(newPassword);
      await user.save();
      res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const user = await User.findByPk(req.user.id);
      const isPasswordCorrect = await comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error('La contraseña es incorrecta');
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(200).json({ message: 'Password Correcto' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
