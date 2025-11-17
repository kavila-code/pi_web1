import { db } from './connection.database.js';

function norm(str) {
  return (str || '').toString().trim().toLowerCase();
}

// Mapear categorías de producto -> patrones de categoría de restaurante
const PRODUCT_TO_RESTAURANT_CATEGORY = {
  pizza: [/ital/i, /pizza/i],
  burger: [/hamburg/i, /burger/i],
  sushi: [/sushi/i, /jap/i],
  drink: [/bebida/i, /cafe/i, /bar/i, /hamburg/i],
  dessert: [/postre/i, /pastel/i, /dulce/i, /ital/i],
};

// Inferir categoría de producto por nombre si falta
function inferProductCategoryByName(name) {
  const n = norm(name);
  if (/pizza|pepperoni|margherita|napo/i.test(n)) return 'pizza';
  if (/burger|hamburg|tocin|queso|nuggets|aros|papas/i.test(n)) return 'burger';
  if (/sushi|sashimi|roll|philadelphia|tempura|edamame/i.test(n)) return 'sushi';
  if (/malteada|jugo|gaseosa|té|cafe|smoothie|bebida/i.test(n)) return 'drink';
  if (/tiramisu|cheesecake|postre|pastel|helado/i.test(n)) return 'dessert';
  return null;
}

async function main() {
  const doCommit = process.argv.includes('--commit');

  console.log(`\nAsignación de restaurantes a productos huérfanos (${doCommit ? 'COMMIT' : 'DRY-RUN'})`);

  // 1) Restaurantes activos
  const { rows: restaurants } = await db.query(`
    SELECT id, name, category
    FROM restaurants
    WHERE is_active = true AND COALESCE(status,'active') = 'active'
  `);

  if (restaurants.length === 0) {
    console.log('No hay restaurantes activos. Abortando.');
    return;
  }

  // 2) Conteo de productos por restaurante
  const { rows: counts } = await db.query(`
    SELECT restaurant_id, COUNT(*)::int AS cnt
    FROM products
    WHERE restaurant_id IS NOT NULL AND restaurant_id <> 0
    GROUP BY restaurant_id
  `);
  const countMap = new Map(counts.map(r => [r.restaurant_id, r.cnt]));

  // 3) Ranking por categoría de restaurante
  const byCategory = new Map(); // cat -> [{id,name,category,count}]
  for (const r of restaurants) {
    const cat = norm(r.category);
    const entry = { id: r.id, name: r.name, category: r.category, count: countMap.get(r.id) || 0 };
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(entry);
  }
  // ordenar por count desc, luego nombre
  for (const arr of byCategory.values()) {
    arr.sort((a,b) => (b.count - a.count) || a.name.localeCompare(b.name));
  }

  // 4) Productos huérfanos
  const { rows: orphanProducts } = await db.query(`
    SELECT id, name, category
    FROM products
    WHERE restaurant_id IS NULL OR restaurant_id = 0
    ORDER BY category NULLS FIRST, name
  `);

  if (orphanProducts.length === 0) {
    console.log('No hay productos sin restaurante. Nada por hacer.');
    return;
  }

  console.log(`\nProductos sin restaurante: ${orphanProducts.length}`);

  const assignments = []; // {product_id, product_name, product_category, restaurant_id, restaurant_name}

  for (const p of orphanProducts) {
    let pcat = norm(p.category);
    if (!pcat) {
      pcat = inferProductCategoryByName(p.name) || null;
    }

    let candidates = [];
    if (pcat && PRODUCT_TO_RESTAURANT_CATEGORY[pcat]) {
      // buscar categorías de restaurantes que hagan match con patrones
      const patterns = PRODUCT_TO_RESTAURANT_CATEGORY[pcat];
      for (const [rcatRaw, arr] of byCategory.entries()) {
        if (patterns.some(rx => rx.test(rcatRaw))) {
          candidates = candidates.concat(arr);
        }
      }
    }

    // Si aún no hay candidatos, intentar por nombre del producto
    if (!candidates.length) {
      const inferred = inferProductCategoryByName(p.name);
      if (inferred && PRODUCT_TO_RESTAURANT_CATEGORY[inferred]) {
        const patterns = PRODUCT_TO_RESTAURANT_CATEGORY[inferred];
        for (const [rcatRaw, arr] of byCategory.entries()) {
          if (patterns.some(rx => rx.test(rcatRaw))) {
            candidates = candidates.concat(arr);
          }
        }
      }
    }

    // como fallback final, elegir cualquier restaurante con mayor número de productos
    if (!candidates.length) {
      const all = Array.from(byCategory.values()).flat();
      candidates = all.sort((a,b) => (b.count - a.count) || a.name.localeCompare(b.name));
    }

    const chosen = candidates[0];
    if (chosen) {
      assignments.push({
        product_id: p.id,
        product_name: p.name,
        product_category: p.category || null,
        restaurant_id: chosen.id,
        restaurant_name: chosen.name,
      });
    } else {
      console.log(`No se encontró candidato para producto ID ${p.id} - ${p.name}`);
    }
  }

  if (!assignments.length) {
    console.log('No se generaron asignaciones.');
    return;
  }

  console.log('\nPlan de asignación (primeros 20):');
  assignments.slice(0,20).forEach(a => {
    console.log(`- [${a.product_id}] ${a.product_name} (${a.product_category || 's/cat'}) -> ${a.restaurant_name} (#${a.restaurant_id})`);
  });
  if (assignments.length > 20) {
    console.log(`... y ${assignments.length - 20} más`);
  }

  if (!doCommit) {
    console.log('\nDRY-RUN completo. Ejecuta con --commit para aplicar cambios.');
    await db.end();
    return;
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const a of assignments) {
      await client.query(
        'UPDATE products SET restaurant_id = $1 WHERE id = $2',
        [a.restaurant_id, a.product_id]
      );
    }
    await client.query('COMMIT');
    console.log(`\nAsignaciones aplicadas: ${assignments.length}`);
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Error aplicando asignaciones:', err);
  } finally {
    client.release();
    await db.end();
  }
}

main().catch(async (e) => {
  console.error(e);
  try { await db.end(); } catch {}
  process.exit(1);
});
