import prisma from '../utils/prisma.client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Registro de un nuevo usuario (Cliente o Proveedor)
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, role, nombre, telefono, direccion, lat, lng, descripcion, servicios } = req.body;

    //Validar que el email no exista
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    //Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.$transaction(async (tx) => {
      // Crear el usuario base
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role, // 'CLIENTE' o 'PROVEEDOR'
        },
      });

      // Crear el perfil asociado
      if (role === 'CLIENTE') {
        await tx.cliente.create({
          data: {
            userId: user.id,
            nombre,
            telefono,
            direccion,
            lat,
            lng,
          },
        });
      } else if (role === 'PROVEEDOR') {
        await tx.proveedor.create({
          data: {
            userId: user.id,
            nombre,
            descripcion,
            servicios: servicios || [], // servicios es un array de strings
            telefono,
            direccion,
            lat,
            lng,
          },
        });
      } else {
        // Si el rol no es ni CLIENTE ni PROVEEDOR, lanzamos un error para cancelar la transaccion
        throw new Error('Rol de usuario inválido');
      }

      return user;
    });

    // 4. Crear el Token JWT
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1d', // El token expira en 1 dia
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: tokenPayload,
    });
  } catch (error) {
    next(error); // Pasa el error al middleware de errores
  }
};

// Inicio de sesión de un usuario
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas (email)' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas (password)' });
    }

    // Crear el Token JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: tokenPayload,
    });
  } catch (error) {
    next(error);
  }
};