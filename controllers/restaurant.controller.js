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

// Obtener un restaurante por ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

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
      logo_url: req.body.logo_url || null,
      cover_image_url: req.body.cover_image_url || null,
      opening_hours: req.body.opening_hours || null,
      delivery_time: req.body.delivery_time || '30-45 min',
      minimum_order: req.body.minimum_order || 0,
      delivery_fee: req.body.delivery_fee || 0,
      rating: req.body.rating || 0,
      is_active: false, // dejar inactivo hasta revisión
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

    const deleted = await RestaurantModel.remove(id);

    if (!deleted) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Restaurante eliminado exitosamente',
    });
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
