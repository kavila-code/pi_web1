import { RestaurantModel } from '../models/restaurant.model.js';

// Obtener todos los restaurantes
export const getAllRestaurants = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      order_by: req.query.order_by || 'name',
      order_dir: req.query.order_dir || 'ASC',
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    };

    const restaurants = await RestaurantModel.getAll(filters);

    return res.status(200).json({
      ok: true,
      data: restaurants,
      count: restaurants.length,
    });
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener restaurantes',
      error: error.message,
    });
  }
};

// Obtener restaurantes recomendados
export const getRecommended = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;
    const restaurants = await RestaurantModel.getRecommended(limit);
    return res.status(200).json({ ok: true, data: restaurants, count: restaurants.length });
  } catch (error) {
    console.error('Error al obtener recomendados:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener recomendados', error: error.message });
  }
};

// Obtener un restaurante por ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    // Evita pasar valores no numéricos a la consulta (sintaxis integer inválida)
    if (!/^[0-9]+$/.test(String(id))) {
      return res.status(400).json({ ok: false, message: 'ID de restaurante inválido' });
    }
    const nId = Number(id);
    if (!Number.isSafeInteger(nId) || nId > 2147483647) {
      return res.status(400).json({ ok: false, message: 'ID de restaurante fuera de rango' });
    }

    const restaurant = await RestaurantModel.getById(id);

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error al obtener restaurante:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener restaurante',
      error: error.message,
    });
  }
};

// Crear un nuevo restaurante (admin)
export const createRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      logo_url: req.body.logo_url,
      cover_image_url: req.body.cover_image_url,
      opening_hours: req.body.opening_hours,
      delivery_time: req.body.delivery_time || '30-45 min',
      minimum_order: req.body.minimum_order || 0,
      delivery_fee: req.body.delivery_fee || 0,
      rating: req.body.rating || 0,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    };

    // Validaciones
    if (!restaurantData.name || !restaurantData.address || !restaurantData.phone) {
      return res.status(400).json({
        ok: false,
        message: 'Nombre, dirección y teléfono son requeridos',
      });
    }

    const newRestaurant = await RestaurantModel.create(restaurantData);

    return res.status(201).json({
      ok: true,
      message: 'Restaurante creado exitosamente',
      data: newRestaurant,
    });
  } catch (error) {
    console.error('Error al crear restaurante:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al crear restaurante',
      error: error.message,
    });
  }
};

// Aplicación pública para registrar un restaurante (se deja inactivo para revisión)
export const applyRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      name: req.body.name,
      description: req.body.description || req.body.notes || null,
      category: req.body.category,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      // Si se sube archivo usar path público /uploads/restaurant-logos/<file>
      logo_url: req.file ? `/uploads/restaurant-logos/${req.file.filename}` : (req.body.logo_url || null),
      cover_image_url: req.body.cover_image_url || null,
      opening_hours: req.body.opening_hours || null,
      delivery_time: req.body.delivery_time || '30-45 min',
      minimum_order: req.body.minimum_order || 0,
      delivery_fee: req.body.delivery_fee || 0,
      rating: req.body.rating || 0,
      is_active: false, // dejar inactivo hasta revisión
      status: 'pending',
      owner_user_id: req.user?.uid || null, // Vincular con usuario autenticado
    };

    if (!restaurantData.name || !restaurantData.address || !restaurantData.phone) {
      return res.status(400).json({ ok: false, message: 'Nombre, dirección y teléfono son requeridos' });
    }

    const newRestaurant = await RestaurantModel.create(restaurantData);

    return res.status(201).json({ ok: true, message: 'Solicitud recibida. Su restaurante será revisado por el equipo.', data: newRestaurant });
  } catch (error) {
    console.error('Error al solicitar registro de restaurante:', error);
    return res.status(500).json({ ok: false, message: 'Error al procesar la solicitud', error: error.message });
  }
};

// Actualizar restaurante (admin)
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      logo_url: req.body.logo_url,
      cover_image_url: req.body.cover_image_url,
      opening_hours: req.body.opening_hours,
      delivery_time: req.body.delivery_time,
      minimum_order: req.body.minimum_order,
      delivery_fee: req.body.delivery_fee,
      rating: req.body.rating,
      is_active: req.body.is_active,
      status: req.body.status,
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'No hay datos para actualizar',
      });
    }

    const updatedRestaurant = await RestaurantModel.update(id, updateData);

    if (!updatedRestaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Restaurante actualizado exitosamente',
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error('Error al actualizar restaurante:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar restaurante',
      error: error.message,
    });
  }
};

// Eliminar restaurante (admin)
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const hard = String(req.query.hard || '').toLowerCase() === 'true';

    if (hard) {
      try {
        const removed = await RestaurantModel.removeHard(id);
        if (removed) {
          return res.status(200).json({ ok: true, message: 'Restaurante eliminado permanentemente', hard: true });
        }
        // Si no retornó fila, continuar a soft-delete
      } catch (err) {
        // Si falla por restricciones, hacemos soft-delete como respaldo
        console.warn('Hard delete falló, aplicando soft-delete:', err?.message || err);
      }
    }

    const deleted = await RestaurantModel.remove(id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    }
    return res.status(200).json({ ok: true, message: 'Restaurante eliminado exitosamente', hard: false });
  } catch (error) {
    console.error('Error al eliminar restaurante:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar restaurante',
      error: error.message,
    });
  }
};

// Obtener categorías de restaurantes
export const getCategories = async (req, res) => {
  try {
    const categories = await RestaurantModel.getCategories();

    return res.status(200).json({
      ok: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener categorías',
      error: error.message,
    });
  }
};

// Obtener restaurantes del usuario autenticado (propietario)
export const getMyRestaurants = async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    const restaurants = await RestaurantModel.getByOwner(userId);

    return res.status(200).json({
      ok: true,
      data: restaurants,
      count: restaurants.length,
    });
  } catch (error) {
    console.error('Error al obtener mis restaurantes:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener restaurantes',
      error: error.message,
    });
  }
};

// Actualizar restaurante del usuario (solo propietario)
export const updateMyRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    // Verificar que el usuario es propietario
    const restaurant = await RestaurantModel.getByIdRaw(id);
    if (!restaurant || restaurant.owner_user_id !== userId) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para editar este restaurante' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      logo_url: req.file ? `/uploads/restaurant-logos/${req.file.filename}` : req.body.logo_url,
      cover_image_url: req.body.cover_image_url,
      opening_hours: req.body.opening_hours,
      delivery_time_min: req.body.delivery_time_min,
      delivery_time_max: req.body.delivery_time_max,
      delivery_cost: req.body.delivery_cost,
      minimum_order: req.body.minimum_order,
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ ok: false, message: 'No hay datos para actualizar' });
    }

    const updatedRestaurant = await RestaurantModel.update(id, updateData);

    return res.status(200).json({
      ok: true,
      message: 'Restaurante actualizado exitosamente',
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error('Error al actualizar mi restaurante:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar restaurante',
      error: error.message,
    });
  }
};
