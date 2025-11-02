import prisma from '../utils/prisma.client.js';

//obtener cliente logueado
export const getClienteProfile = async (req, res, next) => {
  try {
    const { userId } = req.user; // Viene del middleware verifyToken

    const profile = await prisma.cliente.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil de cliente no encontrado' });
    }
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

//actualizar cliente logueado
export const updateClienteProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const dataToUpdate = req.body;

    delete dataToUpdate.userId;
    delete dataToUpdate.id;

    const updatedProfile = await prisma.cliente.update({
      where: { userId },
      data: dataToUpdate,
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};