export const CATALOGO_I18N = {
  'Cafetería': { en: 'Coffee Shop', zh: '精品咖啡馆' },
  'Un ritual para todos los días.': { en: 'An everyday ritual.', zh: '每一天的日常仪式。' },
  'Cafés': { en: 'Coffees', zh: '咖啡饮品' },
  'Pastelería': { en: 'Bakery & Pastries', zh: '烘焙甜点' },
  'Almuerzos': { en: 'Lunches', zh: '午间简餐' },
  'Espresso': { en: 'Espresso', zh: '意式浓缩咖啡' },
  'Café de especialidad, tostado en el día.': { en: 'Specialty coffee, freshly roasted daily.', zh: '每日新鲜烘焙的精品咖啡。' },
  'Cortado': { en: 'Cortado', zh: '可塔朵咖啡' },
  'Espresso con un toque de leche texturizada.': { en: 'Espresso topped with a splash of textured milk.', zh: '意式浓缩搭配少许丝滑奶泡。' },
  'Flat white': { en: 'Flat White', zh: '澳白咖啡' },
  'Doble espresso con leche entera microespumada.': { en: 'Double espresso with velvety microfoamed whole milk.', zh: '双份意式浓缩配绵密全脂微奶泡。' },
  'Latte': { en: 'Latte', zh: '拿铁咖啡' },
  'Espresso con abundante leche. Se puede pedir con leche de almendras.': { en: 'Espresso with steamed milk. Available with almond milk.', zh: '意式浓缩配丰富热牛奶，可选杏仁奶。' },
  'Chocolate caliente': { en: 'Hot Chocolate', zh: '热巧克力' },
  'Chocolate semiamargo derretido con leche, servido con crema.': { en: 'Melted semi-sweet chocolate with milk, topped with whipped cream.', zh: '半甜黑巧克力融于鲜奶，搭配淡奶油。' },
  'Medialuna de manteca': { en: 'Butter Croissant', zh: '黄油牛角包' },
  'Hojaldrada, de elaboración propia.': { en: 'Flaky pastry, freshly baked in-house.', zh: '酥脆千层口感，本店每日现烤。' },
  'Budín de limón': { en: 'Lemon Loaf Cake', zh: '柠檬磅蛋糕' },
  'Porción de budín húmedo con glaseado cítrico.': { en: 'Slice of moist lemon cake with citrus glaze.', zh: '湿润柠檬蛋糕切片，淋有柑橘糖霜。' },
  'Brownie con nueces': { en: 'Walnut Brownie', zh: '核桃布朗尼' },
  'Chocolate semiamargo, interior húmedo y nueces tostadas.': { en: 'Semi-sweet chocolate, fudgy center, and toasted walnuts.', zh: '半甜黑巧克力，内里湿润，配烤核桃仁。' },
  'Cheesecake de frutos rojos': { en: 'Red Berry Cheesecake', zh: '莓果芝士蛋糕' },
  'Base de galletita, queso crema y salsa de frutos rojos.': { en: 'Biscuit crust, cream cheese, and red berry compote.', zh: '饼干脆底、奶油芝士配酸甜莓果酱。' },
  'Alfajor de maicena': { en: 'Cornstarch Dulce de Leche Alfajor', zh: '玉米淀粉焦糖牛奶夹心饼' },
  'Con dulce de leche y coco rallado.': { en: 'Filled with dulce de leche and rolled in shredded coconut.', zh: '夹心焦糖牛奶酱，外层裹满椰蓉。' },
  'Tostado de jamón y queso': { en: 'Ham & Cheese Toasted Sandwich', zh: '火腿芝士热压三明治' },
  'Pan de miga artesanal, jamón cocido y queso cremoso.': { en: 'Artisanal soft bread, cooked ham, and creamy cheese.', zh: '手工白吐司夹熟火腿与顺滑芝士。' },
  'Ensalada Caesar con pollo': { en: 'Chicken Caesar Salad', zh: '鸡肉凯撒沙拉' },
  'Lechuga, pollo grillado, croutons, parmesano y aderezo Caesar.': { en: 'Lettuce, grilled chicken, croutons, parmesan, and Caesar dressing.', zh: '生菜、烤鸡胸肉、面包丁、帕玛森芝士与凯撒酱。' },
  'Sándwich de lomito': { en: 'Tenderloin Steak Sandwich', zh: '嫩牛里脊三明治' },
  'Lomito, queso, tomate y lechuga en pan ciabatta. Con papas rústicas.': { en: 'Beef tenderloin, cheese, tomato, and lettuce on ciabatta. Served with rustic fries.', zh: '牛里脊、芝士、番茄与生菜夹入夏巴塔面包，配乡村薯角。' },
  'Tarta del día con ensalada': { en: 'Savory Tart of the Day with Salad', zh: '今日咸派配沙拉' },
  'Consultá el sabor del día con el equipo.': { en: 'Ask our team for today\'s flavor.', zh: '今日口味请咨询店员。' },
  'Omelette de verduras': { en: 'Vegetable Omelette', zh: '田园蔬菜欧姆蛋' },
  'Tres huevos, zucchini, cebolla caramelizada y queso. Con ensalada.': { en: 'Three eggs, zucchini, caramelized onion, and cheese. Served with salad.', zh: '三颗鸡蛋搭配西葫芦、焦糖洋葱与芝士，附配沙拉。' },
}

const enVuelo = new Set()
const claveCache = (lang) => 'oestack_tr_cache_' + lang

export function leerCacheTraduccion(lang) {
  try { return JSON.parse(localStorage.getItem(claveCache(lang)) || '{}') } catch { return {} }
}

export function solicitarTraduccionRemota(texto, lang, onListo) {
  const clave = lang + ':' + texto
  if (enVuelo.has(clave)) return
  enVuelo.add(clave)
  const par = lang === 'zh' ? 'es|zh-CN' : 'es|en'
  fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(texto) + '&langpair=' + par)
    .then((r) => r.json())
    .then((res) => {
      const trad = res?.responseData?.translatedText
      if (trad && trad.toLowerCase() !== texto.toLowerCase()) {
        const actual = leerCacheTraduccion(lang)
        actual[texto] = trad
        localStorage.setItem(claveCache(lang), JSON.stringify(actual))
        onListo()
      }
    })
    .catch(() => {})
    .finally(() => enVuelo.delete(clave))
}
