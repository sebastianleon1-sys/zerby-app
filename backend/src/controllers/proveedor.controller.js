import prisma from '../utils/prisma.client.js';
import { getDistanceInKm } from '../services/proximity.service.js';

export const findNearbyProveedores = async (req, res, next) => {
  try {
    // Coordenadas del cliente
    const { lat, lng, radius = 10 } = req.query; // radio en km, 10km por defecto

    if (!lat || !lng) {
      return res.status(400).json({
        message: 'Se requieren los parámetros "lat" (latitud) y "lng" (longitud)',
      });
    }

    const clientLat = parseFloat(lat);
    const clientLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Obtenemos TODOS los proveedores de la BD, no es eficiente pero a nuestra escala funcionara xd
    const allProveedores = await prisma.proveedor.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
      },
    });

    //Filtramos en el servidor
    const nearbyProveedores = allProveedores
      .map((proveedor) => {
        const distance = getDistanceInKm(
          clientLat,
          clientLng,
          proveedor.lat,
          proveedor.lng
        );
        return { ...proveedor, distance }; // se  añade la distancia al objeto
      })
      .filter((proveedor) => proveedor.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance); // Ordenamos por cercania

    res.status(200).json(nearbyProveedores);
  } catch (error) {
    next(error);
  }
};

// Obtener el perfil del PROVEEDOR que está logueado
export const getProveedorProfile = async (req, res, next) => {
  try {
    const { userId } = req.user; // Viene del middleware verifyToken

    const profile = await prisma.proveedor.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } }, // Incluir el email
        anuncios: true, // Incluir sus anuncios
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil de proveedor no encontrado' });
    }
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// Actualizar el perfil del PROVEEDOR logueado

export const updateProveedorProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const dataToUpdate = req.body;

    // Quitar campos que no deberían actualizarse desde aqui
    delete dataToUpdate.userId;
    delete dataToUpdate.id;
    delete dataToUpdate.rating; // El rating se actualiza por las reviews

    const updatedProfile = await prisma.proveedor.update({
      where: { userId },
      data: dataToUpdate,
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};