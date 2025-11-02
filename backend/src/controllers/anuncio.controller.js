import prisma from '../utils/prisma.client.js';

// POST /api/anuncios
export const createAnuncio = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { titulo, descripcion, precio, categoria, lat, lng } = req.body;

    // Encontrar el perfil de Proveedor del usuario logueado
    const proveedor = await prisma.proveedor.findUnique({
      where: { userId },
    });

    if (!proveedor) {
      return res.status(403).json({ message: 'Perfil de proveedor no encontrado' });
    }

    //  Crear el anuncio asociado a ese proveedor
    const newAnuncio = await prisma.anuncio.create({
      data: {
        titulo,
        descripcion,
        precio: parseFloat(precio),
        categoria,
        lat: lat ? parseFloat(lat) : proveedor.lat, 
        lng: lng ? parseFloat(lng) : proveedor.lng,
        proveedorId: proveedor.id,
      },
    });

    res.status(201).json(newAnuncio);
  } catch (error) {
    next(error);
  }
};

// GET /api/anuncios
export const getAnuncios = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    
    const whereClause = {};
    if (categoria) {
      whereClause.categoria = categoria;
    }

    const anuncios = await prisma.anuncio.findMany({
      where: whereClause,
      include: {
        proveedor: { select: { nombre: true, rating: true } }, 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(anuncios);
  } catch (error) {
    next(error);
  }
};

// GET /api/anuncios/:id
export const getAnuncioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: parseInt(id) },
      include: {
        proveedor: true, // Toda la info del proveedor
        reviews: { // Incluir las reseñas
          include: {
            user: { // Y quién escribio la reseña
              include: {
                cliente: {select: {nombre: true}}
              }
            }
          }
        }, 
      },
    });

    if (!anuncio) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }
    res.status(200).json(anuncio);
  } catch (error) {
    next(error);
  }
};

// PUT /api/anuncios/:id
export const updateAnuncio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;
    const { userId } = req.user;

    //Verificar que el anuncio pertenece al proveedor logueado
    const proveedor = await prisma.proveedor.findUnique({ where: { userId } });
    const anuncio = await prisma.anuncio.findUnique({ where: { id: parseInt(id) } });

    if (!anuncio) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }
    
    if (anuncio.proveedorId !== proveedor.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio' });
    }

    //Actualizar
    const updatedAnuncio = await prisma.anuncio.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json(updatedAnuncio);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/anuncios/:id
export const deleteAnuncio = async (req, res, next) => {
    try {
    const { id } = req.params;
    const { userId } = req.user;

    //Verificar propiedad (similar a update)
    const proveedor = await prisma.proveedor.findUnique({ where: { userId } });
    const anuncio = await prisma.anuncio.findUnique({ where: { id: parseInt(id) } });

    if (!anuncio) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }
    
    if (anuncio.proveedorId !== proveedor.id) {
      return res.status(403).json({ message: 'No tienes permiso para borrar este anuncio' });
    }

    // borrar
    await prisma.$transaction(async (tx) => {
        await tx.review.deleteMany({
            where: { anuncioId: parseInt(id) }
        });
        
        //
        await tx.file.deleteMany({
             where: { anuncioId: parseInt(id) }
        });

        await tx.anuncio.delete({
            where: { id: parseInt(id) }
        });
    });

    res.status(204).send(); // 204 No Content, se borro exitosamente
  } catch (error) {
    next(error);
  }
};