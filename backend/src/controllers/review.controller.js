import prisma from '../utils/prisma.client.js';

// GET /api/reviews/anuncio/:anuncioId
export const getReviewsForAnuncio = async (req, res, next) => {
  try {
    const { anuncioId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { anuncioId: parseInt(anuncioId) },
      include: {
        user: { select: { cliente: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews/anuncio/:anuncioId
export const createReview = async (req, res, next) => {
  try {
    const { anuncioId } = req.params;
    const { userId } = req.user; //gracias al middleware, solo un cliente podria llegar aqui
    const { rating, comment } = req.body;

    const newReview = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        userId,
        anuncioId: parseInt(anuncioId),
      },
    });

    //Logica del rating
    await updateProveedorRating(parseInt(anuncioId));

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

//rating de un proveedor
async function updateProveedorRating(anuncioId) {
  //Encontrar al proveedor dueño de este anuncio
  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { proveedorId: true },
  });

  if (!anuncio) return;
  const { proveedorId } = anuncio;

  //Calcular el rating promedio de TODAS las reviews de TODOS los anuncios de ESE proveedor
  const result = await prisma.review.aggregate({
    where: {
      anuncio: {
        proveedorId: proveedorId,
      },
    },
    _avg: {
      rating: true,
    },
  });

  const newAverageRating = result._avg.rating || 0;

  // Actualizar el campo rating en el modelo Proveedor
  await prisma.proveedor.update({
    where: { id: proveedorId },
    data: {
      rating: newAverageRating,
    },
  });
}