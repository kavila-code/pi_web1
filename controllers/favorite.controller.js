import { FavoriteModel } from '../models/favorite.model.js';

// Obtener favoritos del usuario
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user?.uid || req.uid;
    const favorites = await FavoriteModel.getFavoritesByUserId(userId);

    return res.status(200).json({
      ok: true,
      data: favorites
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener favoritos',
      error: error.message
    });
  }
};

// Obtener IDs de restaurantes favoritos
export const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user?.uid || req.uid;
    const ids = await FavoriteModel.getFavoriteRestaurantIds(userId);

    return res.status(200).json({
      ok: true,
      data: ids
    });
  } catch (error) {
    console.error('Error al obtener IDs de favoritos:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener IDs de favoritos',
      error: error.message
    });
  }
};

// Agregar restaurante a favoritos
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user?.uid || req.uid;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de restaurante requerido'
      });
    }

    const favorite = await FavoriteModel.addFavorite(userId, restaurantId);

    return res.status(201).json({
      ok: true,
      message: 'Restaurante agregado a favoritos',
      data: favorite
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al agregar favorito',
      error: error.message
    });
  }
};

// Eliminar restaurante de favoritos
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user?.uid || req.uid;
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de restaurante requerido'
      });
    }

    const removed = await FavoriteModel.removeFavorite(userId, restaurantId);

    if (!removed) {
      return res.status(404).json({
        ok: false,
        message: 'Favorito no encontrado'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Restaurante eliminado de favoritos'
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar favorito',
      error: error.message
    });
  }
};

// Toggle favorito (agregar si no existe, eliminar si existe)
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user?.uid || req.uid;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de restaurante requerido'
      });
    }

    const isFav = await FavoriteModel.isFavorite(userId, restaurantId);

    if (isFav) {
      await FavoriteModel.removeFavorite(userId, restaurantId);
      return res.status(200).json({
        ok: true,
        message: 'Restaurante eliminado de favoritos',
        isFavorite: false
      });
    } else {
      await FavoriteModel.addFavorite(userId, restaurantId);
      return res.status(200).json({
        ok: true,
        message: 'Restaurante agregado a favoritos',
        isFavorite: true
      });
    }
  } catch (error) {
    console.error('Error al alternar favorito:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al alternar favorito',
      error: error.message
    });
  }
};
