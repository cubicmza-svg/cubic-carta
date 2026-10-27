// Carta inicial de Cubic (la que estaba en cubicmza.netlify.app/datos.js, pasada de los PDF 2026).
// Se usa como versión de partida y como ejemplo de formato para la IA; después manda lo que suben desde /admin/carta.
import type { Carta } from './cartaTipos';

export const CARTA_BASE: Record<'cafeteria' | 'resto', Carta> = {
 "cafeteria": {
  "titulo": "cafetería & brunch",
  "bajada": "de lunes a sábado desde las 09:00",
  "portada": "img/desliza-todo.jpg",
  "secciones": [
   {
    "id": "brunch",
    "t": "brunch",
    "foto": "img/toston-campo.jpg",
    "nota": "todos nuestros brunch vienen con infusión grande y jugo chico",
    "bloques": [
     {
      "cols": [
       "individual",
       "para compartir"
      ],
      "items": [
       {
        "n": "De campo",
        "d": "tostón con palta y huevo + fetas de jamón y queso",
        "p": [
         15700,
         30000
        ]
       },
       {
        "n": "Italian Cubic",
        "d": "focaccia rellena de jamón y queso",
        "p": [
         16250,
         25500
        ]
       },
       {
        "n": "Parisino",
        "d": "croissant relleno dulce o salado (consultá variedades)",
        "p": [
         12500,
         24000
        ]
       },
       {
        "n": "Fitness",
        "d": "yogurt con frutas frescas + mix de frutos secos + 2 tostadas integrales + jugo chico + dip de queso y dulce",
        "p": [
         20000,
         34500
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "promos",
    "t": "promos",
    "foto": "img/cafe-croissant.jpg",
    "bloques": [
     {
      "cols": [
       "individual",
       "para compartir"
      ],
      "items": [
       {
        "n": "Promo 1",
        "d": "infusión grande + torta o medialuna",
        "p": [
         4500,
         8300
        ]
       },
       {
        "n": "Promo 2",
        "d": "infusión grande + 2 tostadas + queso crema y dulce + jugo chico",
        "p": [
         7500,
         14300
        ]
       },
       {
        "n": "Promo 3",
        "d": "infusión grande + jugo chico + tostado, panini o sándwich frío con tomate y lechuga",
        "p": [
         11800,
         19000
        ]
       },
       {
        "n": "Promo 4",
        "d": "infusión grande + porción de torta + jugo chico",
        "p": [
         15000,
         27000
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "cafe",
    "t": "café",
    "foto": "img/guia-capuccino.jpg",
    "bloques": [
     {
      "t": "tradicional",
      "cols": [
       "chico",
       "mediano",
       "grande",
       "XXL"
      ],
      "items": [
       {
        "n": "Café solo",
        "p": [
         3800,
         4400,
         5000,
         8000
        ]
       },
       {
        "n": "Cortado",
        "p": [
         3800,
         4400,
         5000,
         8000
        ]
       },
       {
        "n": "Goteado",
        "p": [
         3800,
         4400,
         5000,
         8000
        ]
       },
       {
        "n": "Manchado",
        "p": [
         3800,
         4400,
         5000,
         8000
        ]
       },
       {
        "n": "Latte",
        "p": [
         3800,
         4400,
         5000,
         8000
        ]
       }
      ]
     },
     {
      "cols": [
       "simple",
       "doble"
      ],
      "items": [
       {
        "n": "Espresso",
        "p": [
         3800,
         5000
        ]
       },
       {
        "n": "Americano",
        "p": [
         3800,
         5000
        ]
       }
      ]
     },
     {
      "t": "especiales",
      "items": [
       {
        "n": "Flat white",
        "p": 7000
       },
       {
        "n": "Capuccino",
        "p": 9000
       },
       {
        "n": "Submarino",
        "p": 9400
       },
       {
        "n": "Chocolatada",
        "p": 6200
       },
       {
        "n": "Té clásico",
        "p": 2700
       },
       {
        "n": "Té saborizado",
        "p": 3700
       },
       {
        "n": "Ice caramel",
        "p": 7500
       },
       {
        "n": "Ice choco",
        "p": 7500
       },
       {
        "n": "Coffee tonic",
        "p": 7500
       },
       {
        "n": "Moka",
        "p": 7500
       }
      ]
     }
    ]
   },
   {
    "id": "dulce",
    "t": "para acompañar · dulce",
    "foto": "img/tarta-frutilla.jpg",
    "bloques": [
     {
      "items": [
       {
        "n": "Tortitas",
        "d": "raspada u hojaldre",
        "p": 1000
       },
       {
        "n": "Tortita con jamón y queso",
        "p": 1900
       },
       {
        "n": "Medialuna",
        "p": 1500
       },
       {
        "n": "Medialuna con jamón y queso",
        "p": 3000
       },
       {
        "n": "Croissant",
        "p": 2300
       },
       {
        "n": "Croissant relleno",
        "d": "consultá opción dulce o salada",
        "p": 6000
       },
       {
        "n": "Porción de torta",
        "d": "consultá variedades",
        "p": 11300
       },
       {
        "n": "Mini alfajor de maicena",
        "p": 1800
       },
       {
        "n": "Tostadas con dip",
        "d": "de queso, o manteca y mermelada",
        "p": 5900
       },
       {
        "n": "Porción de lemonie",
        "p": 3800
       },
       {
        "n": "Yogurt natural con frutas",
        "p": 14200
       },
       {
        "n": "Budín",
        "d": "2 porciones",
        "p": 5500
       },
       {
        "n": "Chipá",
        "d": "2 porciones",
        "p": 3400
       }
      ]
     }
    ]
   },
   {
    "id": "salado",
    "t": "para acompañar · salado",
    "foto": "img/focaccia-tomates.jpg",
    "bloques": [
     {
      "t": "paninis",
      "items": [
       {
        "n": "Jamón y queso",
        "p": 6800
       },
       {
        "n": "Salame y queso",
        "p": 6800
       },
       {
        "n": "Mortadela y queso",
        "p": 6800
       },
       {
        "n": "Cheddar y jamón",
        "p": 6800
       },
       {
        "n": "Caprese",
        "p": 6800
       },
       {
        "n": "Jamón crudo, queso y rúcula",
        "p": 9000
       }
      ]
     },
     {
      "t": "y además",
      "items": [
       {
        "n": "Tostado chico",
        "p": 7300
       },
       {
        "n": "Tostado grande",
        "p": 12000
       },
       {
        "n": "Sándwich clásico",
        "d": "jamón, queso, lechuga y tomate",
        "p": 7900
       },
       {
        "n": "Tostón de campo",
        "d": "palta, huevo, jamón y queso",
        "p": 12000
       },
       {
        "n": "Focaccia rellena",
        "d": "consultá variedades",
        "p": 12800
       },
       {
        "n": "Huevos revueltos",
        "d": "con jamón y queso",
        "p": 8700
       }
      ]
     },
     {
      "t": "adicionales",
      "items": [
       {
        "n": "Dip de palta",
        "p": 3400
       },
       {
        "n": "Dip de granola y mix de frutos secos",
        "p": 7800
       },
       {
        "n": "Dip de queso y mermelada",
        "p": 3000
       },
       {
        "n": "Tostada de pan blanco",
        "p": 1400
       },
       {
        "n": "Tostada de pan integral",
        "p": 1800
       },
       {
        "n": "Dip de aceitunas verdes o negras",
        "p": 1900
       },
       {
        "n": "Maní o papas snack",
        "p": 1900
       }
      ]
     }
    ]
   },
   {
    "id": "sintacc",
    "t": "sin tacc",
    "foto": "img/cafe-budin.jpg",
    "nota": "opciones gluten free",
    "bloques": [
     {
      "items": [
       {
        "n": "Alfajores",
        "d": "consultá variedades",
        "p": 5800
       },
       {
        "n": "Conito de dulce de leche",
        "p": 2800
       },
       {
        "n": "Tostadas con dip",
        "d": "de queso, o manteca y mermelada",
        "p": 6400
       },
       {
        "n": "Baguetín de jamón y queso",
        "p": 6800
       },
       {
        "n": "Baguetín de jamón crudo, queso y rúcula",
        "p": 9000
       },
       {
        "n": "Ciabatta de jamón y queso",
        "p": 8300
       },
       {
        "n": "Ciabatta de jamón crudo, queso y rúcula",
        "p": 10500
       },
       {
        "n": "Sándwich clásico",
        "d": "jamón, queso, lechuga y tomate",
        "p": 7300
       },
       {
        "n": "Tostón de campo",
        "d": "palta, huevo, jamón y queso",
        "p": 13500
       },
       {
        "n": "Focaccia rellena",
        "d": "consultá variedades",
        "p": 14300
       }
      ]
     }
    ]
   },
   {
    "id": "bebidas",
    "t": "bebidas",
    "foto": "img/limonada.jpg",
    "bloques": [
     {
      "t": "jugos y licuados",
      "cols": [
       "individual",
       "jarra"
      ],
      "items": [
       {
        "n": "Limonada / pomelada",
        "p": [
         5200,
         11800
        ]
       },
       {
        "n": "Naranja",
        "p": [
         4500,
         9000
        ]
       }
      ]
     },
     {
      "cols": [
       "individual",
       "mixto"
      ],
      "items": [
       {
        "n": "Licuados",
        "d": "frutilla, banana, durazno, ananá o frutos rojos",
        "p": [
         5800,
         6500
        ]
       }
      ]
     },
     {
      "t": "gaseosas y aguas",
      "items": [
       {
        "n": "Línea Pepsi",
        "d": "lata · 350 cc · 500 cc",
        "p": 3400
       },
       {
        "n": "Línea Pepsi 1,5 L",
        "p": 6700
       },
       {
        "n": "Línea Coca-Cola",
        "d": "lata · 350 cc · 500 cc",
        "p": 4200
       },
       {
        "n": "Línea Coca-Cola 1,25 L",
        "p": 8800
       },
       {
        "n": "Agua saborizada 500 cc",
        "p": 3400
       },
       {
        "n": "Agua saborizada 1,5 L",
        "p": 6700
       },
       {
        "n": "Agua mineral sin gas 500 cc",
        "p": 3400
       },
       {
        "n": "Agua mineral con gas 500 cc",
        "p": 3500
       },
       {
        "n": "Gatorade 500 cc",
        "p": 4800
       }
      ]
     }
    ]
   }
  ]
 },
 "resto": {
  "titulo": "resto & bar",
  "bajada": "almuerzos, cenas, after y tragos",
  "portada": "img/burger-palta-tabla.jpg",
  "aviso": {
   "grande": "2x1",
   "texto": "en tragos tradicionales de 19 a 23 hs",
   "ir": "tragos"
  },
  "secciones": [
   {
    "id": "entradas",
    "t": "entradas",
    "foto": "img/papas-cheddar.jpg",
    "bloques": [
     {
      "t": "papas fritas y rabas",
      "cols": [
       "chicas",
       "grandes"
      ],
      "items": [
       {
        "n": "Papas fritas tradicionales",
        "p": [
         6300,
         12500
        ]
       },
       {
        "n": "Papas fritas con cheddar y verdeo",
        "p": [
         8800,
         15000
        ]
       },
       {
        "n": "Rabas",
        "p": [
         null,
         18200
        ]
       }
      ]
     },
     {
      "t": "empanadas",
      "cols": [
       "2 u.",
       "½ doc.",
       "docena"
      ],
      "items": [
       {
        "n": "Empanadas",
        "d": "carne o pollo · jamón y queso · caprese · cebolla y muzzarella · atún · choclo",
        "p": [
         3800,
         11300,
         22500
        ]
       }
      ]
     },
     {
      "t": "ensaladas",
      "items": [
       {
        "n": "César",
        "d": "colchón de verdes, cubos de pollo, crutones, escamas de queso y salsa César",
        "p": 15000
       },
       {
        "n": "Teriyaki",
        "d": "colchón de verdes, láminas de pollo teriyaki, tomates cherry confitados y cebolla morada",
        "p": 15000
       },
       {
        "n": "Caprese",
        "d": "mix de verdes, quesos macerados, tomates cherry, albahaca, aceitunas negras y escamas de queso",
        "p": 12500
       }
      ]
     }
    ]
   },
   {
    "id": "picadas",
    "t": "picadas",
    "foto": "img/picada.jpg",
    "bloques": [
     {
      "cols": [
       "2 personas",
       "4 personas"
      ],
      "items": [
       {
        "n": "Avenida",
        "d": "salame, jamón cocido, mortadela, queso tybo, sardo, roquefort, aceitunas verdes y negras, papas copetín, maní salado, lactonesa del día y rodajas de pan",
        "p": [
         26900,
         50700
        ]
       },
       {
        "n": "Cubic",
        "d": "jamón crudo, jamón cocido, salame, queso tybo, sardo, roquefort, empanadas de copetín, rabas, aceitunas verdes y negras, papas copetín, maní salado, lactonesa del día, barbacoa y pan",
        "p": [
         35000,
         69000
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "sandwiches",
    "t": "sándwiches & al plato",
    "foto": "img/lomo-focaccia.jpg",
    "bloques": [
     {
      "t": "sándwiches",
      "items": [
       {
        "n": "Lomo focaccia",
        "d": "de ternera, cerdo o pollo",
        "p": 25000
       },
       {
        "n": "Lomo completo",
        "d": "de ternera, cerdo o pollo",
        "p": 22500
       },
       {
        "n": "Sándwich de milanesa",
        "p": 22500
       },
       {
        "n": "Sándwich de cerdo braseado",
        "p": 20000
       },
       {
        "n": "Sándwich de pollo teriyaki",
        "p": 20000
       }
      ]
     },
     {
      "t": "al plato · con guarnición",
      "items": [
       {
        "n": "Milanesa napolitana",
        "p": 15000
       },
       {
        "n": "Lomo o suprema",
        "p": 15000
       },
       {
        "n": "Cerdo braseado",
        "p": 15000
       },
       {
        "n": "Pollo teriyaki",
        "p": 15000
       }
      ]
     }
    ]
   },
   {
    "id": "burgers",
    "t": "hamburguesas",
    "foto": "img/burger-palta-tabla.jpg",
    "bloques": [
     {
      "items": [
       {
        "n": "Cheeseburger",
        "p": 12500
       },
       {
        "n": "Barba burger",
        "p": 13500
       },
       {
        "n": "Classic burger",
        "p": 13500
       },
       {
        "n": "Americana",
        "p": 16500
       },
       {
        "n": "Bluecheese",
        "p": 18000
       },
       {
        "n": "Triple cheeseburger",
        "p": 18750
       },
       {
        "n": "Americana doble",
        "p": 21000
       },
       {
        "n": "Guacamole",
        "p": 22500
       }
      ]
     }
    ]
   },
   {
    "id": "pizzas",
    "t": "pizzas",
    "foto": "img/pizza-especial.jpg",
    "bloques": [
     {
      "cols": [
       "6 porc.",
       "8 porc.",
       "12 porc."
      ],
      "items": [
       {
        "n": "Muzzarella",
        "p": [
         9500,
         12700,
         17500
        ]
       },
       {
        "n": "Especial",
        "p": [
         10400,
         13900,
         19000
        ]
       },
       {
        "n": "Napolitana",
        "p": [
         10400,
         13900,
         19000
        ]
       },
       {
        "n": "Fugazzeta",
        "p": [
         10400,
         13900,
         19000
        ]
       },
       {
        "n": "Cuatro quesos",
        "p": [
         10400,
         13900,
         19000
        ]
       },
       {
        "n": "Hawaiana",
        "d": "con ananá",
        "p": [
         14900,
         19500,
         27000
        ]
       },
       {
        "n": "Palmitos",
        "p": [
         14900,
         19500,
         27000
        ]
       },
       {
        "n": "Especial con anchoas",
        "p": [
         14900,
         19500,
         27000
        ]
       },
       {
        "n": "Jamón crudo y rúcula",
        "p": [
         15400,
         20000,
         27500
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "promos",
    "t": "promos para comer",
    "foto": "img/amigas-mesa.jpg",
    "bloques": [
     {
      "t": "pizza libre",
      "items": [
       {
        "n": "Pizza libre tradicional",
        "d": "muzzarella, especial, napolitana y fugazzeta",
        "p": 18800
       },
       {
        "n": "Pizza libre especial",
        "d": "hawaiana, cuatro quesos, anchoas, palmitos y jamón crudo y rúcula",
        "p": 27500
       },
       {
        "n": "Pizza libre sin TACC",
        "d": "muzzarella, especial, napolitana y fugazzeta",
        "p": 20000
       }
      ]
     },
     {
      "t": "de a dos · con papas fritas",
      "items": [
       {
        "n": "2 lomos focaccia",
        "p": 50000
       },
       {
        "n": "2 sándwiches de milanesa",
        "p": 45000
       },
       {
        "n": "2 lomos completos",
        "p": 42500
       },
       {
        "n": "2 sándwiches de cerdo braseado",
        "p": 37500
       },
       {
        "n": "2 sándwiches de pollo teriyaki",
        "p": 37500
       },
       {
        "n": "2 burgers americanas",
        "p": 32500
       },
       {
        "n": "2 classic burgers",
        "p": 27000
       },
       {
        "n": "2 cheeseburgers",
        "p": 22500
       }
      ]
     },
     {
      "items": [
       {
        "n": "Americana doble + Michelob 473 cc",
        "p": 21000
       }
      ]
     }
    ]
   },
   {
    "id": "sintacc",
    "t": "sin tacc",
    "foto": "img/empanadas-carne.jpg",
    "nota": "opciones gluten free",
    "bloques": [
     {
      "items": [
       {
        "n": "Baguetín de jamón y queso",
        "p": 6800
       },
       {
        "n": "Baguetín de jamón crudo, queso y rúcula",
        "p": 9000
       },
       {
        "n": "Ciabatta de jamón y queso",
        "p": 8300
       },
       {
        "n": "Ciabatta de jamón crudo, queso y rúcula",
        "p": 10500
       },
       {
        "n": "Sándwich clásico",
        "d": "jamón, queso, lechuga y tomate",
        "p": 7300
       },
       {
        "n": "Sándwich de pollo teriyaki",
        "p": 20000
       },
       {
        "n": "Sándwich de cerdo braseado",
        "p": 20000
       },
       {
        "n": "Lomo completo",
        "d": "en pan ciabatta o focaccia, con huevo, tomate, lechuga y lactonesa",
        "p": 21600
       },
       {
        "n": "Tostón de campo",
        "d": "palta, huevo, jamón y queso",
        "p": 13500
       },
       {
        "n": "Focaccia rellena",
        "d": "consultá variedades",
        "p": 14300
       }
      ]
     },
     {
      "t": "pizzas individuales · 4 porciones",
      "items": [
       {
        "n": "Muzzarella",
        "p": 6800
       },
       {
        "n": "Especial",
        "p": 7800
       },
       {
        "n": "Napolitana",
        "p": 7800
       },
       {
        "n": "Fugazza",
        "p": 7800
       },
       {
        "n": "Jamón crudo y rúcula",
        "p": 10200
       }
      ]
     }
    ]
   },
   {
    "id": "tragos",
    "t": "coctelería",
    "foto": "img/barra-aperol.jpg",
    "nota": "2x1 en tragos tradicionales de 19 a 23 hs",
    "bloques": [
     {
      "t": "de autor",
      "items": [
       {
        "n": "Pink Floyd",
        "d": "leche, pulpa de frutilla, Malibu y gin",
        "p": 18750
       },
       {
        "n": "Aperol Sunset",
        "d": "Aperol, vodka, jugo de naranja y sirope",
        "p": 18750
       },
       {
        "n": "Cookies Time",
        "d": "Baileys, licor de chocolate, licor de café, helado y galletitas Oreo",
        "p": 20000
       }
      ]
     },
     {
      "t": "tradicionales",
      "items": [
       {
        "n": "Gin tonic",
        "p": 15000
       },
       {
        "n": "Aperol spritz",
        "p": 15000
       },
       {
        "n": "Aperol tonic",
        "p": 12500
       },
       {
        "n": "Ramazzotti spritz",
        "p": 15000
       },
       {
        "n": "Negroni",
        "p": 12500
       },
       {
        "n": "Boulevardier",
        "p": 15000
       },
       {
        "n": "Campari orange",
        "p": 11300
       },
       {
        "n": "Campari tonic",
        "p": 11300
       },
       {
        "n": "Cynar pomelo",
        "p": 11300
       },
       {
        "n": "Cynar julep",
        "p": 15000
       },
       {
        "n": "Fernet Branca",
        "p": 12500
       },
       {
        "n": "Fernet para preparar",
        "p": 17500
       },
       {
        "n": "Vermut clásico",
        "p": 11300
       },
       {
        "n": "Daiquiri",
        "p": 12500
       },
       {
        "n": "Mojito",
        "p": 15000
       },
       {
        "n": "Mojito Malibu",
        "p": 17500
       },
       {
        "n": "Cuba libre",
        "p": 12500
       },
       {
        "n": "Pisco",
        "p": 12500
       },
       {
        "n": "Caipirinha",
        "p": 12500
       },
       {
        "n": "Caipiroska",
        "p": 15000
       },
       {
        "n": "Caipi Jäger",
        "p": 15000
       },
       {
        "n": "Tequila sunrise",
        "p": 12500
       },
       {
        "n": "Penicillin",
        "p": 15000
       },
       {
        "n": "Gancia",
        "p": 11300
       },
       {
        "n": "Jäger + Red Bull",
        "p": 15000
       },
       {
        "n": "Smirnoff + Red Bull",
        "p": 15000
       },
       {
        "n": "Hanky Panky",
        "p": 16250
       },
       {
        "n": "Jäger mule",
        "p": 15000
       }
      ]
     }
    ]
   },
   {
    "id": "alcohol",
    "t": "cervezas, vinos & más",
    "foto": "img/fernet-papas.jpg",
    "bloques": [
     {
      "t": "promos",
      "items": [
       {
        "n": "Jarra de fernet",
        "p": 26250
       },
       {
        "n": "Combo champagne + 4 Red Bull",
        "p": 45000
       },
       {
        "n": "Combo fernet + Coca-Cola 1,25 L",
        "p": 57500
       },
       {
        "n": "Combo Smirnoff + 4 Red Bull",
        "p": 60000
       }
      ]
     },
     {
      "t": "cervezas",
      "items": [
       {
        "n": "Quilmes litro",
        "p": 8300
       },
       {
        "n": "Andes Origen litro",
        "p": 9800
       },
       {
        "n": "Stella Artois litro",
        "p": 11800
       },
       {
        "n": "Patagonia 730 cc",
        "p": 12000
       },
       {
        "n": "Corona 710 cc",
        "p": 12000
       },
       {
        "n": "Michelob 473 cc",
        "p": 6700
       },
       {
        "n": "Stella Pure Gold 330 cc",
        "p": 6900
       },
       {
        "n": "Corona 330 cc",
        "p": 8300
       },
       {
        "n": "Stella 330 cc",
        "p": 8300
       },
       {
        "n": "Corona 0.0 330 cc",
        "p": 7900
       },
       {
        "n": "Stella 0.0 330 cc",
        "p": 7900
       }
      ]
     },
     {
      "t": "vinos",
      "items": [
       {
        "n": "Vino por copa",
        "p": 4000
       },
       {
        "n": "El Gran Loco",
        "p": 16250
       },
       {
        "n": "Atilio Avena",
        "p": 17500
       },
       {
        "n": "Novecento",
        "p": null
       },
       {
        "n": "Emilia",
        "p": null
       },
       {
        "n": "Celeste y Blanco",
        "p": 13500
       },
       {
        "n": "Portillo",
        "p": 15000
       },
       {
        "n": "Estancia Mendoza",
        "p": null
       },
       {
        "n": "Santa Julia",
        "p": 16300
       }
      ]
     },
     {
      "t": "champagne",
      "items": [
       {
        "n": "Nave Robino",
        "p": 21250
       },
       {
        "n": "Capricio Fiore",
        "p": 18500
       },
       {
        "n": "Novecento",
        "p": 18500
       },
       {
        "n": "Canciller",
        "p": 12300
       }
      ]
     },
     {
      "t": "whisky · medida",
      "items": [
       {
        "n": "Jameson",
        "p": 12500
       },
       {
        "n": "Ballantine’s",
        "p": 16250
       },
       {
        "n": "JW Black Label",
        "p": 18750
       }
      ]
     }
    ]
   },
   {
    "id": "sinalcohol",
    "t": "sin alcohol",
    "foto": "img/limonada.jpg",
    "bloques": [
     {
      "t": "jugos y licuados",
      "cols": [
       "individual",
       "jarra"
      ],
      "items": [
       {
        "n": "Limonada / pomelada",
        "p": [
         5200,
         11800
        ]
       },
       {
        "n": "Naranja",
        "p": [
         4500,
         9000
        ]
       }
      ]
     },
     {
      "cols": [
       "individual",
       "mixto"
      ],
      "items": [
       {
        "n": "Licuados",
        "d": "frutilla, banana, durazno, ananá o frutos rojos",
        "p": [
         5800,
         6500
        ]
       }
      ]
     },
     {
      "t": "gaseosas, aguas y energizantes",
      "items": [
       {
        "n": "Línea Pepsi",
        "d": "lata · 350 cc · 500 cc",
        "p": 3400
       },
       {
        "n": "Línea Pepsi 1,5 L",
        "p": 6700
       },
       {
        "n": "Línea Coca-Cola",
        "d": "lata · 350 cc · 500 cc",
        "p": 4200
       },
       {
        "n": "Línea Coca-Cola 1,5 L",
        "p": 8800
       },
       {
        "n": "Agua saborizada 500 cc",
        "p": 3400
       },
       {
        "n": "Agua saborizada 1,5 L",
        "p": 6700
       },
       {
        "n": "Agua mineral sin gas 500 cc",
        "p": 3400
       },
       {
        "n": "Agua mineral con gas 500 cc",
        "p": 3500
       },
       {
        "n": "Gatorade o Powerade 500 cc",
        "p": 4800
       },
       {
        "n": "Red Bull",
        "p": 9000
       },
       {
        "n": "Monster",
        "p": 11300
       }
      ]
     }
    ]
   }
  ]
 }
};
