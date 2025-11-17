import { ProductModel } from '../models/product.model.js';
import { RestaurantModel } from '../models/restaurant.model.js';

// Obtener productos de un restaurante
export const getProductsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const filters = {
      category: req.query.category,
      is_vegetarian: req.query.is_vegetarian === 'true',
      is_vegan: req.query.is_vegan === 'true',
      search: req.query.search,
      is_available: req.query.is_available !== undefined ? req.query.is_available === 'true' : true,
    };

    const products = await ProductModel.getByRestaurant(restaurantId, filters);

    return res.status(200).json({
      ok: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener productos',
      error: error.message,
    });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      data: product,
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener producto',
      error: error.message,
    });
  }
};

// Obtener múltiples productos por IDs (para carrito)
export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Se requiere un array de IDs',
      });
    }

    const products = await ProductModel.getByIds(ids);

    return res.status(200).json({
      ok: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener productos',
      error: error.message,
    });
  }
};

// Crear un nuevo producto (admin)
export const createProduct = async (req, res) => {
  try {
    const productData = {
      restaurant_id: req.body.restaurant_id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      image_url: req.body.image_url,
      is_vegetarian: req.body.is_vegetarian || false,
      is_vegan: req.body.is_vegan || false,
      is_available: req.body.is_available !== undefined ? req.body.is_available : true,
    };

    // Validaciones
    if (!productData.restaurant_id || !productData.name || !productData.price) {
      return res.status(400).json({
        ok: false,
        message: 'Restaurante, nombre y precio son requeridos',
      });
    }

    if (productData.price < 0) {
      return res.status(400).json({
        ok: false,
        message: 'El precio no puede ser negativo',
      });
    }

    const newProduct = await ProductModel.create(productData);

    return res.status(201).json({
      ok: true,
      message: 'Producto creado exitosamente',
      data: newProduct,
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al crear producto',
      error: error.message,
    });
  }
};

// Actualizar producto (admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      image_url: req.body.image_url,
      is_vegetarian: req.body.is_vegetarian,
      is_vegan: req.body.is_vegan,
      is_available: req.body.is_available,
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

    // Validar precio si se envía
    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json({
        ok: false,
        message: 'El precio no puede ser negativo',
      });
    }

    const updatedProduct = await ProductModel.update(id, updateData);

    if (!updatedProduct) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar producto',
      error: error.message,
    });
  }
};

// Eliminar producto (admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ProductModel.remove(id);

    if (!deleted) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar producto',
      error: error.message,
    });
  }
};

// Obtener categorías de productos de un restaurante
export const getCategoriesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await ProductModel.getCategoriesByRestaurant(restaurantId);

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

// ===== ENDPOINTS PARA PROPIETARIOS DE RESTAURANTES =====

// Crear producto en restaurante propio
export const createMyProduct = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    // Verificar que el usuario es propietario del restaurante
    const restaurants = await RestaurantModel.getByOwner(userId);
    const ownsRestaurant = restaurants.some(r => r.id === parseInt(restaurantId));

    if (!ownsRestaurant) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para agregar productos a este restaurante' });
    }

    const productData = {
      restaurant_id: restaurantId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      image_url: req.file ? `/uploads/products/${req.file.filename}` : req.body.image_url,
      is_vegetarian: req.body.is_vegetarian || false,
      is_vegan: req.body.is_vegan || false,
      preparation_time: req.body.preparation_time || 15,
      calories: req.body.calories || null,
      allergens: req.body.allergens || null,
    };

    if (!productData.name || !productData.price) {
      return res.status(400).json({ ok: false, message: 'Nombre y precio son requeridos' });
    }

    const newProduct = await ProductModel.create(productData);

    return res.status(201).json({
      ok: true,
      message: 'Producto creado exitosamente',
      data: newProduct,
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al crear producto',
      error: error.message,
    });
  }
};

// Actualizar producto en restaurante propio
export const updateMyProduct = async (req, res) => {
  try {
    const { restaurantId, productId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    // Verificar que el usuario es propietario del restaurante
    const restaurants = await RestaurantModel.getByOwner(userId);
    const ownsRestaurant = restaurants.some(r => r.id === parseInt(restaurantId));

    if (!ownsRestaurant) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para editar este producto' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      image_url: req.file ? `/uploads/products/${req.file.filename}` : req.body.image_url,
      is_available: req.body.is_available,
      is_vegetarian: req.body.is_vegetarian,
      is_vegan: req.body.is_vegan,
      preparation_time: req.body.preparation_time,
      calories: req.body.calories,
      allergens: req.body.allergens,
      discount_percentage: req.body.discount_percentage,
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

    const updatedProduct = await ProductModel.update(productId, updateData);

    if (!updatedProduct) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar producto',
      error: error.message,
    });
  }
};

// Eliminar producto de restaurante propio
export const deleteMyProduct = async (req, res) => {
  try {
    const { restaurantId, productId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    // Verificar que el usuario es propietario del restaurante
    const restaurants = await RestaurantModel.getByOwner(userId);
    const ownsRestaurant = restaurants.some(r => r.id === parseInt(restaurantId));

    if (!ownsRestaurant) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para eliminar este producto' });
    }

    const deleted = await ProductModel.remove(productId);

    if (!deleted) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar producto',
      error: error.message,
    });
  }
};

// Obtener productos destacados (global)
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '12');
    const featured = await ProductModel.getFeatured(isNaN(limit) ? 12 : limit);
    return res.status(200).json({ ok: true, data: featured, count: featured.length });
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener productos destacados', error: error.message });
  }
};
