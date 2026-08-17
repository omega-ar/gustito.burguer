require("dotenv").config();
const { db } = require("./firebaseAdmin");

const productos = [
  // SIMPLES
  {
    id: "simple_clasica",
    nombre: "Simple Clásica",
    precio: 13000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, lechuga y tomate + Fritas",
    activo: true,
    imagen: "s_clasica.jpeg",
  },
  {
    id: "simple_chef",
    nombre: "Simple Chef",
    precio: 12000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, cebolla picada y mostaza + Fritas",
    activo: false,
    imagen: "s_chef.jpeg",
  },
  {
    id: "simple_huevo",
    nombre: "Simple con Huevo",
    precio: 13000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, huevo a la plancha + Fritas",
    activo: true,
    imagen: "s_huevo.jpeg",
  },
  {
    id: "simple_ahumada",
    nombre: "Simple Ahumada",
    precio: 14000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, mayonesa ahumada y panceta + Fritas",
    activo: false,
    imagen: "s_ahumada.jpg",
  },
  {
    id: "simple_bbq",
    nombre: "Simple BBQ",
    precio: 15000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, salsa BBQ y panceta + Fritas",
    activo: true,
    imagen: "s_bbq.jpg",
  },
  {
    id: "simple_ranch",
    nombre: "Simple Ranch",
    precio: 15000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, salsa Ranch y panceta + Fritas",
    activo: true,
    imagen: "s_ranch.jpeg",
  },
  {
    id: "simple_americana",
    nombre: "Simple Americana",
    precio: 16000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, pepinillos y panceta + Fritas",
    activo: true,
    imagen: "s_americana.jpeg",
  },
  {
    id: "simple_picante",
    nombre: "Simple Picante",
    precio: 16000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, mayonesa, jalapeños y panceta + Fritas",
    activo: true,
    imagen: "s_picante.jpeg",
  },
  {
    id: "simple_bbq_crunch",
    nombre: "Simple BBQ Crunch",
    precio: 16000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, pepinillos mezclados con BBQ y panceta + Fritas",
    activo: true,
    imagen: "s_crunch.jpeg",
  },
  {
    id: "simple_deluxe",
    nombre: "Simple Deluxe",
    precio: 17000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, mostaza, lechuga, tomate, panceta, pepinillos y mayonesa + Fritas",
    activo: true,
    imagen: "s_deluxe.jpeg",
  },
  {
    id: "simple_cheese",
    nombre: "Cheeseburger Simple",
    precio: 12000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar + Fritas",
    activo: true,
    imagen: "d_cheese.jpg",
  },
  {
    id: "simple_onion",
    nombre: "Simple New Onion",
    precio: 15000,
    categoria: "simple",
    descripcion:
      "Medallón 100gr, pan de papa, doble Cheddar, cebolla a la plancha y panceta + Fritas",
    activo: true,
    imagen: "d_onion.jpg",
  },

  // DOBLES
  {
    id: "doble_cheese",
    nombre: "Cheeseburger Doble",
    precio: 16000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar + Fritas",
    activo: true,
    imagen: "d_cheese.jpg",
  },
  {
    id: "doble_clasica",
    nombre: "Doble Clásica",
    precio: 17000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, lechuga y tomate + Fritas",
    activo: true,
    imagen: "d_clasica.jpeg",
  },
  {
    id: "doble_huevo",
    nombre: "Doble con Huevo",
    precio: 17000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, huevo a la plancha + Fritas",
    activo: true,
    imagen: "d_huevo.jpeg",
  },
  {
    id: "doble_onion",
    nombre: "Doble New Onion",
    precio: 19000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, cebolla a la plancha y panceta + Fritas",
    activo: true,
    imagen: "d_onion.jpg",
  },
  {
    id: "doble_bbq",
    nombre: "Doble BBQ",
    precio: 19000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, salsa BBQ y panceta + Fritas",
    activo: true,
    imagen: "d_bbq.jpeg",
  },
  {
    id: "doble_ranch",
    nombre: "Doble Ranch",
    precio: 19000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, salsa Ranch y panceta + Fritas",
    activo: true,
    imagen: "d_ranch.jpg",
  },
  {
    id: "doble_americana",
    nombre: "Doble Americana",
    precio: 20000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, pepinillos y panceta + Fritas",
    activo: true,
    imagen: "d_americana.jpg",
  },
  {
    id: "doble_picante",
    nombre: "Doble Picante",
    precio: 20000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, mayonesa, jalapeños y panceta + Fritas",
    activo: true,
    imagen: "d_picante.jpg",
  },
  {
    id: "doble_bbq_crunch",
    nombre: "Doble BBQ Crunch",
    precio: 20000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, pepinillos mezclados con BBQ y panceta + Fritas",
    activo: true,
    imagen: "d_crunch.jpeg",
  },
  {
    id: "doble_deluxe",
    nombre: "Doble Deluxe",
    precio: 21000,
    categoria: "doble",
    descripcion:
      "2 medallones 100gr c/u, pan de papa, triple Cheddar, mostaza, lechuga, tomate, panceta, pepinillos y mayonesa + Fritas",
    activo: true,
    imagen: "d_deluxe.jpeg",
  },

  // TRIPLES
  {
    id: "triple_cheese",
    nombre: "Cheeseburger Triple",
    precio: 19000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar + Fritas",
    activo: true,
    imagen: "t_cheese.jpg",
  },
  {
    id: "triple_clasica",
    nombre: "Triple Clásica",
    precio: 20000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, lechuga y tomate + Fritas",
    activo: true,
    imagen: "d_clasica.jpeg",
  },
  {
    id: "triple_huevo",
    nombre: "Triple con Huevo",
    precio: 20000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, huevo a la plancha + Fritas",
    activo: true,
    imagen: "d_huevo.jpeg",
  },
  {
    id: "triple_onion",
    nombre: "Triple New Onion",
    precio: 22000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, cebolla a la plancha y panceta + Fritas",
    activo: true,
    imagen: "d_onion.jpg",
  },
  {
    id: "triple_bbq",
    nombre: "Triple BBQ",
    precio: 22000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, salsa BBQ y panceta + Fritas",
    activo: true,
    imagen: "t_bbq.jpeg",
  },
  {
    id: "triple_ranch",
    nombre: "Triple Ranch",
    precio: 22000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, salsa Ranch y panceta + Fritas",
    activo: true,
    imagen: "t_ranch.jpg",
  },
  {
    id: "triple_americana",
    nombre: "Triple Americana",
    precio: 23000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, pepinillos y panceta + Fritas",
    activo: true,
    imagen: "t_americana.jpeg",
  },
  {
    id: "triple_picante",
    nombre: "Triple Picante",
    precio: 23000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, jalapeños, mayonesa y panceta + Fritas",
    activo: true,
    imagen: "t_picante.jpeg",
  },
  {
    id: "triple_bbq_crunch",
    nombre: "Triple BBQ Crunch",
    precio: 23000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, pepinillos con BBQ y panceta + Fritas",
    activo: true,
    imagen: "t_crunch.jpeg",
  },
  {
    id: "triple_deluxe",
    nombre: "Triple Deluxe",
    precio: 24000,
    categoria: "triple",
    descripcion:
      "3 medallones 100gr c/u, pan de papa, cuádruple Cheddar, mostaza, lechuga, tomate, panceta, pepinillos y mayonesa + Fritas",
    activo: true,
    imagen: "t_deluxe.jpeg",
  },

  // VEGETARIANAS
  {
    id: "simple_vegetariana",
    nombre: "Simple Vegetariana",
    precio: 14000,
    categoria: "vegetariana",
    descripcion:
      "1 medallón blend de hongos y porotos negros con romero de 100gr, doble Cheddar, pan de papa, lechuga y tomate + Fritas",
    activo: true,
    imagen: "default.png",
  },
  {
    id: "doble_vegetariana",
    nombre: "Doble Vegetariana",
    precio: 18000,
    categoria: "vegetariana",
    descripcion:
      "2 medallones blend de hongos y porotos negros con romero de 100gr, doble Cheddar, pan de papa, lechuga y tomate + Fritas",
    activo: true,
    imagen: "d_vegetariana.jpeg",
  },
  {
    id: "triple_vegetariana",
    nombre: "Triple Vegetariana",
    precio: 22000,
    categoria: "vegetariana",
    descripcion:
      "3 medallones blend de hongos y porotos negros con romero de 100gr, doble Cheddar, pan de papa, lechuga y tomate + Fritas",
    activo: true,
    imagen: "d_vegetariana.jpeg",
  },

  // BEBIDAS
  {
    id: "coca_cola_600",
    nombre: "Coca Cola 600ml",
    precio: 3000,
    categoria: "bebidas",
    descripcion: "Gaseosa línea Coca Cola de 600 ml",
    activo: true,
    requiere_stock: false,
    imagen: "R_Coca.jpg",
  },
  {
    id: "fanta_600",
    nombre: "Fanta 600ml",
    precio: 3000,
    categoria: "bebidas",
    descripcion: "Gaseosa línea Coca Cola de 600 ml",
    activo: true,
    requiere_stock: false,
    imagen: "R_Fanta.jpg",
  },
  {
    id: "sprite_600",
    nombre: "Sprite 600ml",
    precio: 3000,
    categoria: "bebidas",
    descripcion: "Gaseosa línea Coca Cola de 600 ml",
    activo: true,
    requiere_stock: false,
    imagen: "R_Sprite.jpg",
  },

  // OTROS
  {
    id: "papas_cheddar",
    nombre: "Papas con Cheddar",
    precio: 14000,
    categoria: "otros",
    descripcion: "400 gr de papa, Cheddar líquido y panceta picada",
    activo: true,
    imagen: "Papas_Cheddar.jpg",
  },
  {
    id: "caja_fritas",
    nombre: "Caja de fritas",
    precio: 9000,
    categoria: "otros",
    descripcion: "400 gr de papa frita",
    activo: true,
    imagen: "default.png",
  },

  // EXTRAS
  {
    id: "extra_fritas_200",
    nombre: "Porción de fritas (200gr)",
    precio: 5000,
    categoria: "extras",
    descripcion: "Porción extra de papas fritas 200gr",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_carne_cheddar",
    nombre: "100 g de carne + cheddar",
    precio: 4000,
    categoria: "extras",
    descripcion: "Medallón extra de carne de 100gr con cheddar",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_panceta_2",
    nombre: "Panceta (2 fetas)",
    precio: 2500,
    categoria: "extras",
    descripcion: "2 fetas adicionales de panceta crocante",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_cheddar_feta",
    nombre: "Fetas de Cheddar",
    precio: 1000,
    categoria: "extras",
    descripcion: "Fetas de queso cheddar adicionales",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_jalapenos",
    nombre: "Jalapeños",
    precio: 2000,
    categoria: "extras",
    descripcion: "Jalapeños en rodajas extra",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_pepinillos",
    nombre: "Pepinillos",
    precio: 2000,
    categoria: "extras",
    descripcion: "Pepinillos agridulces extra",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_huevo",
    nombre: "Huevo a la plancha",
    precio: 2000,
    categoria: "extras",
    descripcion: "Huevo a la plancha extra",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_salsas",
    nombre: "Salsas",
    precio: 1500,
    categoria: "extras",
    descripcion: "Porción de salsa adicional",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_lechuga_tomate",
    nombre: "Lechuga y tomate",
    precio: 1500,
    categoria: "extras",
    descripcion: "Lechuga y tomate frescos adicionales",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_medallon_100",
    nombre: "Medallón de carne 100gr",
    precio: 3000,
    categoria: "extras",
    descripcion: "Medallón extra de carne de 100gr",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_cheddar_liquido",
    nombre: "Cheddar líquido",
    precio: 3000,
    categoria: "extras",
    descripcion: "Porción adicional de queso cheddar líquido",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },
  {
    id: "extra_panceta_picada",
    nombre: "Panceta picada",
    precio: 3000,
    categoria: "extras",
    descripcion: "Porción adicional de panceta picada crocante",
    activo: true,
    requiere_stock: false,
    imagen: "default.png",
  },

  // PROMOS
  {
    id: "combo_cheese",
    nombre: "Combo Cheese (Martes)",
    precio: 13500,
    categoria: "promo",
    descripcion: "1 Cheeseburger Simple + Fritas + Gaseosa 600ml",
    activo: true,
    dias_activos: ["tuesday"],
    imagen: "d_cheese.jpg",
  },
  {
    id: "combo_duplo",
    nombre: "Combo Duplo (Martes)",
    precio: 25900,
    categoria: "promo",
    descripcion: "2 Cheeseburgers Simples + 2 Porciones de Fritas + 2 Gaseosas 600ml",
    activo: true,
    dias_activos: ["tuesday"],
    imagen: "d_cheese.jpg",
  },
  {
    id: "combo_especial",
    nombre: "Combo Especial (Miércoles)",
    precio: 17000,
    categoria: "promo",
    descripcion: "1 BBQ Crunch Simple (o Americana / Picante) + Fritas + Gaseosa 600ml",
    activo: true,
    dias_activos: ["wednesday"],
    imagen: "s_crunch.jpeg",
  },
  {
    id: "combo_pareja_doble",
    nombre: "Combo Pareja Doble (Miércoles)",
    precio: 33000,
    categoria: "promo",
    descripcion: "2 Cheeseburgers Dobles + 2 Porciones de Fritas + 2 Gaseosas 600ml",
    activo: true,
    dias_activos: ["wednesday"],
    imagen: "d_cheese.jpg",
  },
  {
    id: "combo_king_triple",
    nombre: "Combo King Triple (Jueves)",
    precio: 19900,
    categoria: "promo",
    descripcion: "1 Cheeseburger Triple + Fritas + Gaseosa 600ml",
    activo: true,
    dias_activos: ["thursday"],
    imagen: "t_cheese.jpg",
  },
  {
    id: "combo_trio_jueves",
    nombre: "Trío de Jueves (Jueves)",
    precio: 45900,
    categoria: "promo",
    descripcion: "3 Cheeseburgers Simples + Fritas Grandes + 3 Gaseosas 600ml",
    activo: true,
    dias_activos: ["thursday"],
    imagen: "d_cheese.jpg",
  },
];

const ingredientes = [
  {
    id: "pan_papa",
    nombre: "Pan de papa",
    unidad: "unidad",
    stock_actual: 100,
    stock_minimo: 20,
    costo_unitario: 500,
  },
  {
    id: "medallon_carne",
    nombre: "Medallón de carne (100gr)",
    unidad: "unidad",
    stock_actual: 150,
    stock_minimo: 30,
    costo_unitario: 800,
  },
  {
    id: "medallon_veggie",
    nombre: "Medallón vegetariano blend de hongos y porotos negros",
    unidad: "unidad",
    stock_actual: 80,
    stock_minimo: 15,
    costo_unitario: 900,
  },
  {
    id: "queso_cheddar",
    nombre: "Queso Cheddar",
    unidad: "feta",
    stock_actual: 200,
    stock_minimo: 40,
    costo_unitario: 300,
  },
  {
    id: "panceta",
    nombre: "Panceta",
    unidad: "unidad",
    stock_actual: 500,
    stock_minimo: 100,
    costo_unitario: 80,
  },
  {
    id: "panceta_picada",
    nombre: "Panceta picada",
    unidad: "porcion",
    stock_actual: 200,
    stock_minimo: 40,
    costo_unitario: 100,
  },
  {
    id: "huevo",
    nombre: "Huevo",
    unidad: "unidad",
    stock_actual: 60,
    stock_minimo: 20,
    costo_unitario: 200,
  },
  {
    id: "salsa_bbq",
    nombre: "Salsa BBQ",
    unidad: "ml",
    stock_actual: 3000,
    stock_minimo: 500,
    costo_unitario: 5,
  },
  {
    id: "salsa_ranch",
    nombre: "Salsa Ranch",
    unidad: "ml",
    stock_actual: 2000,
    stock_minimo: 500,
    costo_unitario: 5,
  },
  {
    id: "jalapenos",
    nombre: "Jalapeños",
    unidad: "unidad",
    stock_actual: 100,
    stock_minimo: 20,
    costo_unitario: 150,
  },
  {
    id: "pepinillos",
    nombre: "Pepinillos",
    unidad: "unidad",
    stock_actual: 100,
    stock_minimo: 20,
    costo_unitario: 150,
  },
  {
    id: "papel_termico",
    nombre: "Papel térmico",
    unidad: "unidad",
    stock_actual: 200,
    stock_minimo: 50,
    costo_unitario: 100,
  },
  {
    id: "papas_fritas",
    nombre: "Papas fritas (400gr)",
    unidad: "porcion",
    stock_actual: 50,
    stock_minimo: 15,
    costo_unitario: 1500,
  },
  {
    id: "lechuga",
    nombre: "Lechuga",
    unidad: "hoja",
    stock_actual: 200,
    stock_minimo: 50,
    costo_unitario: 50,
  },
  {
    id: "tomate",
    nombre: "Tomate",
    unidad: "rodaja",
    stock_actual: 300,
    stock_minimo: 60,
    costo_unitario: 50,
  },
  {
    id: "cebolla",
    nombre: "Cebolla",
    unidad: "porcion",
    stock_actual: 100,
    stock_minimo: 20,
    costo_unitario: 100,
  },
  {
    id: "mostaza",
    nombre: "Mostaza",
    unidad: "ml",
    stock_actual: 1000,
    stock_minimo: 200,
    costo_unitario: 3,
  },
  {
    id: "mayonesa",
    nombre: "Mayonesa",
    unidad: "ml",
    stock_actual: 2000,
    stock_minimo: 400,
    costo_unitario: 3,
  },
  {
    id: "mayonesa_ahumada",
    nombre: "Mayonesa ahumada",
    unidad: "ml",
    stock_actual: 1000,
    stock_minimo: 200,
    costo_unitario: 4,
  },
  {
    id: "cheddar_liquido",
    nombre: "Cheddar Líquido",
    unidad: "gramos",
    stock_actual: 5000,
    stock_minimo: 1000,
    costo_unitario: 8,
  },
];

const recetas = [
  // SIMPLES
  {
    producto_id: "simple_clasica",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_chef",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "cebolla", cantidad: 1 },
      { ingrediente_id: "mostaza", cantidad: 10 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_huevo",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "huevo", cantidad: 1 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_ahumada",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "mayonesa_ahumada", cantidad: 15 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_bbq",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_ranch",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "salsa_ranch", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_americana",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_picante",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "mayonesa", cantidad: 15 },
      { ingrediente_id: "jalapenos", cantidad: 5 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_bbq_crunch",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_deluxe",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "mostaza", cantidad: 5 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "mayonesa", cantidad: 10 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_cheese",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "simple_onion",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "cebolla", cantidad: 1 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },

  // DOBLES
  {
    producto_id: "doble_cheese",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_clasica",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_huevo",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "huevo", cantidad: 1 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_onion",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "cebolla", cantidad: 1 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_bbq",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_ranch",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "salsa_ranch", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_americana",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_picante",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "mayonesa", cantidad: 15 },
      { ingrediente_id: "jalapenos", cantidad: 5 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_bbq_crunch",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_deluxe",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 3 },
      { ingrediente_id: "mostaza", cantidad: 5 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "mayonesa", cantidad: 10 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },

  // TRIPLES
  {
    producto_id: "triple_cheese",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_clasica",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_huevo",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "huevo", cantidad: 1 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_onion",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "cebolla", cantidad: 1 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_bbq",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_ranch",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "salsa_ranch", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_americana",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_picante",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "mayonesa", cantidad: 15 },
      { ingrediente_id: "jalapenos", cantidad: 5 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_bbq_crunch",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_deluxe",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "mostaza", cantidad: 5 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "mayonesa", cantidad: 10 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },

  // VEGETARIANAS
  {
    producto_id: "simple_vegetariana",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_veggie", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "doble_vegetariana",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_veggie", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "triple_vegetariana",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_veggie", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "lechuga", cantidad: 2 },
      { ingrediente_id: "tomate", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },

  // OTROS
  {
    producto_id: "papas_cheddar",
    ingredientes: [
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "cheddar_liquido", cantidad: 50 },
      { ingrediente_id: "panceta_picada", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "caja_fritas",
    ingredientes: [
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },

  // PROMOS
  {
    producto_id: "combo_cheese",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "combo_duplo",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 2 },
      { ingrediente_id: "medallon_carne", cantidad: 2 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "papas_fritas", cantidad: 2 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "combo_especial",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 1 },
      { ingrediente_id: "queso_cheddar", cantidad: 2 },
      { ingrediente_id: "pepinillos", cantidad: 3 },
      { ingrediente_id: "salsa_bbq", cantidad: 30 },
      { ingrediente_id: "panceta", cantidad: 2 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "combo_pareja_doble",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 2 },
      { ingrediente_id: "medallon_carne", cantidad: 4 },
      { ingrediente_id: "queso_cheddar", cantidad: 6 },
      { ingrediente_id: "papas_fritas", cantidad: 2 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "combo_king_triple",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 1 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 4 },
      { ingrediente_id: "papas_fritas", cantidad: 1 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
  {
    producto_id: "combo_trio_jueves",
    ingredientes: [
      { ingrediente_id: "pan_papa", cantidad: 3 },
      { ingrediente_id: "medallon_carne", cantidad: 3 },
      { ingrediente_id: "queso_cheddar", cantidad: 6 },
      { ingrediente_id: "papas_fritas", cantidad: 3 },
      { ingrediente_id: "papel_termico", cantidad: 1 },
    ],
  },
];

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`🗑️ Colección '${collectionPath}' vaciada`);
}

async function seedDatabase() {
  console.log(
    "\n🚀 Comenzando carga de datos del nuevo menú...\n",
  );

  try {
    await deleteCollection("productos");
    await deleteCollection("ingredientes");
    await deleteCollection("recetas");
    console.log("✨ Base de datos limpia de registros obsoletos");

    console.log("📦 Cargando productos...");
    for (const producto of productos) {
      await db.collection("productos").doc(producto.id).set(producto);
    }
    console.log(`✅ ${productos.length} productos cargados`);

    console.log("🥩 Cargando ingredientes...");
    for (const ingrediente of ingredientes) {
      await db.collection("ingredientes").doc(ingrediente.id).set(ingrediente);
    }
    console.log(`✅ ${ingredientes.length} ingredientes cargados`);

    console.log("📋 Cargando recetas...");
    for (const receta of recetas) {
      await db.collection("recetas").doc(receta.producto_id).set(receta);
    }
    console.log(`✅ ${recetas.length} recetas cargadas`);

    console.log("📁 Asegurando colecciones vacías...");
    await db.collection("pedidos").doc("_placeholder").set({ temporal: true });
    await db
      .collection("movimientos_stock")
      .doc("_placeholder")
      .set({ temporal: true });
    await db.collection("pedidos").doc("_placeholder").delete();
    await db.collection("movimientos_stock").doc("_placeholder").delete();
    console.log("✅ Colecciones listas");

    console.log("\n🎉 ¡BASE DE DATOS ACTUALIZADA CON ÉXITO!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
  }
}

seedDatabase();
