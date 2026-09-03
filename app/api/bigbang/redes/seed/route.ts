import { isAuthenticated } from '@/lib/adminAuth';
import { ensureBigBangTables } from '@/lib/bigbangDb';
import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 1 });
}

const CALENDARIO: Record<string, unknown>[] = [
  // ─── SEMANA 1 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Fechas disponibles septiembre',
    caption: `Esta semana todavia tenemos fechas disponibles 🚀✨\n\n¿Tu cumple es en septiembre? Escribinos y reservamos tu lugar en el espacio 🪐\n\n👉 Link en bio para consultar`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-05']),
    pilar: 'comercial',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1: Fondo negro con estrellas animadas\nTexto central: "Esta semana tenemos fechas 🚀"\nSubtitulo: "Septiembre casi agotado"\nSticker: encuesta "¿Tu cumple es este mes?" SI / NO\nCTA final: "Escribinos por DM"`
  },
  {
    titulo: 'Story: BTS preparando el salon',
    caption: `Asi empieza la magia ✨🚀 Preparando el salon para el proximo cumple espacial\n\n¿Queres que el de tu hijo sea el proximo? 👇`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-08']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `VIDEO 15seg: camara recorre el salon vacio, se empieza a ver como se cuelga decoracion\nMusica: trending instrumental\nTexto superpuesto: "Esto era hace 2 horas..."\nCut rapido a salon terminado\nTexto: "La magia de Big Bang 🚀"\nCTA: "Reserva por DM"`
  },
  {
    titulo: 'Story: Tip anticipacion',
    caption: `DATO: los mejores salones y fechas se reservan con AL MENOS 3 semanas de anticipacion 📅\n\n¿Ya pensaste en el cumple de tu hijo? No esperes mas 🚀`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-10']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE con icono de calendario\nTexto grande: "3 semanas antes" con emoji reloj\nBullets: "✓ Mejor disponibilidad de fechas" / "✓ Tiempo para personalizar" / "✓ Sin apuros"\nCTA: "Reserva ahora → Link en bio"`
  },
  {
    titulo: 'Story: Testimonio de cliente',
    caption: `"Fue el mejor cumple que le hicimos a Maximo. Los chicos no paraban de hablar del astronauta 🧑‍🚀" - Caro, mama de Maximo (5 anos)\n\nGracias por confiar en nosotros! 🚀`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-12']),
    pilar: 'testimonial',
    tipo_grabacion: 'diseno',
    guion: `Fondo: foto del evento de Maximo (pedir autorizacion a la mama)\nCita en texto con comillas y nombre\nEstrellas animadas de fondo\nLogotipo Big Bang abajo\nSticker de corazon\nCTA: "Tu hijo puede ser el proximo 🚀"`
  },
  // ─── REEL SEMANA 1 ──────────────────────────────────────────────────────────
  {
    titulo: 'Reel: Transformacion del salon (antes/despues)',
    caption: `De salon vacio a universo espacial en 3 horas 🚀✨ Esto es lo que hacemos en Big Bang para cada cumple!\n\nEl cumple de Luca, 5 anos, tematica astronauta\n\n¿Queres uno asi? 👇 Link en bio\n\n#bigbangfiestas #cumplemendoza #fiestasinfantiles #astronauta #mendoza #cumpleanos`,
    plataforma: 'instagram',
    formato: 'reel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-09']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `DURACION: 30-45 segundos\n\nESCENA 1 (0-3seg): Salon vacio, luz normal. Texto: "Salon vacio, martes a las 15hs"\n\nESCENA 2 (3-8seg): Timelapse acelerado de nosotras armando la decoracion - se ven movimientos rapidos de globos, paneles, telas\n\nESCENA 3 (8-15seg): Primeros planos de detalles: cartel de luz neon, arco de globos con planetas, mesas con cohetes\n\nESCENA 4 (15-22seg): Salon terminado desde la puerta, camara entra lentamente. Texto: "3 horas despues..." con musica que sube\n\nESCENA 5 (22-30seg): Los chicos entrando y reaccionando, caras de sorpresa. Texto: "Esto es Big Bang 🚀"\n\nCTA final: texto "Reservas: link en bio"\n\nMUSICA: Buscar trending en Instagram Reels (instrumental energica)\nEDICION: cortes rapidos al ritmo, colores vibrantes, texto animado`
  },
  // ─── CARRUSEL SEMANA 1 ──────────────────────────────────────────────────────
  {
    titulo: 'Carrusel: Nuestros paquetes 2026',
    caption: `Conoce nuestros paquetes para 2026 🚀 Desliza para ver todo lo que incluye cada uno 👉\n\nTres niveles para que tu hijo tenga la fiesta de sus suenos sin sorpresas en el precio!\n\n#bigbangfiestas #cumplemendoza #fiestasinfantiles #preciosmendoza`,
    plataforma: 'instagram',
    formato: 'carrusel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-11']),
    pilar: 'comercial',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1 (portada): Fondo negro/violeta con estrellas. Titulo grande: "NUESTROS PAQUETES 2026 🚀" Texto: "Desliza para conocerlos" con flecha\n\nSLIDE 2 (Promo Clasic): Icono cohete dorado. Titulo: "PROMO CLASIC". Precio: "$300.000 - $370.000". Lista: "✓ Salon para hasta 30 chicos" / "✓ 3 horas de duracion" / "✓ Animacion incluida" / "✓ Decoracion tematica basica" / "✓ Mesa de cumpleanos". Call-out: "Ideal para cumples intimos"\n\nSLIDE 3 (Promo Full): Icono cohete plateado con corona. Titulo: "PROMO FULL". Precio: "$350.000 - $400.000". Lista: "✓ Todo lo del Clasic +" / "✓ Decoracion premium con arco de globos" / "✓ Cartel de luz neon personalizado" / "✓ Fotoprops para fotos" / "✓ Neon nombre del cumpleanero". Call-out: "El mas elegido"\n\nSLIDE 4 (Personalizacion): Icono estrella. Titulo: "PERSONALIZAMOS TODO". Texto: "Cada cumple es unico. Elegis la tematica, los colores y nosotros lo hacemos realidad". Tematicas: "Astronauta | Espacio | Planetas | Superheroes | Princesas | Lo que vos quieras"\n\nSLIDE 5 (CTA): Fondo galaxia. Titulo: "RESERVA TU FECHA". Subtitulo: "Fechas limitadas por mes". Datos de contacto + logo. CTA: "Mensaje directo o link en bio"`
  },
  // ─── SEMANA 2 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Promo Clasic vs Full',
    caption: `Promo Clasic o Promo Full? 🚀 Ambas incluyen animacion, decoracion y el mejor cumple espacial para tu hijo!\n\nLa diferencia esta en los detalles ✨ Escribinos y te asesoramos`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-15']),
    pilar: 'comercial',
    tipo_grabacion: 'diseno',
    guion: `SLIDE comparativo: dos columnas\nIzquierda: "CLASIC 🥈" - lista de 4 items\nDerecha: "FULL 🥇" - misma lista + extras en verde\nAbajo: "Ambas incluyen animacion y decoracion"\nCTA: "Consulta por DM"`
  },
  {
    titulo: 'Story: Los ninos jugando / animacion',
    caption: `La cara de felicidad de los chicos lo dice todo 🚀✨ Esto es lo que mas nos gusta de nuestro trabajo!\n\n#bigbangfiestas #animacion #cumpleanos`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-17']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `VIDEO 10-15seg: Clip de un juego grupal durante la animacion\nLos chicos riendo, el animador dirigiendo el juego\nMusica alegre de fondo\nTexto: "Esto es lo que amamos 🚀"\nSin mostrar caras de menores (o con permiso expreso de los padres)`
  },
  {
    titulo: 'Story: Incluimos cotilion?',
    caption: `PREGUNTA FRECUENTE: el cotillon esta incluido en los paquetes?\n\nRespuesta: DEPENDE del paquete! Escribinos y te contamos todo 🚀`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-19']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE: Estilo FAQ\nPregunta grande arriba: "?El cotillon esta incluido?"\nRespuesta: icono de check verde para Promo Full / icono X para Clasic\nTexto aclaratorio: "En Full incluimos sorpresitas para cada invitado"\nCTA: "Consulta el detalle completo por DM"`
  },
  // ─── REEL SEMANA 2 ──────────────────────────────────────────────────────────
  {
    titulo: 'Reel: Un cumple en el espacio (highlights)',
    caption: `El cumple de Valentina fue INCREIBLE 🚀✨ Miralo en 30 segundos!\n\nTematica: princesa del espacio | 4 anos | 25 invitados\n\nTu hijo merece esto tambien 👇\n\n#bigbangfiestas #cumpleanos #princesadelespacio #mendoza #fiestasinfantiles`,
    plataforma: 'instagram',
    formato: 'reel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-16']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `DURACION: 30 segundos\n\nESCENA 1 (0-2seg): Detalle del cartel de luz neon con el nombre "Valentina"\n\nESCENA 2 (2-5seg): La nena entrando con su vestido, reaccion de asombro\n\nESCENA 3 (5-10seg): Primeros planos rapidosde decoracion: planetas, estrellas, mesa dulce\n\nESCENA 4 (10-18seg): Juego grupal con los invitados, chicos saltando y riendo\n\nESCENA 5 (18-25seg): Corte de torta, todos cantando\n\nESCENA 6 (25-30seg): Foto final de grupo frente a la decoracion\n\nTexto final: "Tu fiesta espacial te espera 🚀"\n\nNOTA: Pedir autorizacion escrita a los padres para publicar imagenes de los ninos\nMUSICA: instrumental alegre, trending`
  },
  // ─── CARRUSEL SEMANA 2 ──────────────────────────────────────────────────────
  {
    titulo: 'Carrusel: Tendencias fiestas infantiles 2026',
    caption: `Las tendencias en fiestas infantiles que estan arrasando en 2026 🚀 Desliza para inspirarte!\n\nCual es tu favorita? Comentanos 👇\n\n#tendencias #fiestasinfantiles #cumplemendoza #bigbangfiestas`,
    plataforma: 'instagram',
    formato: 'carrusel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-25']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1 (portada): Titulo "TENDENCIAS 2026" con cohete y estrellas\n\nSLIDE 2: Tendencia #1 "ESPACIO REALISTA". Foto de decoracion con planetas 3D, astronautas, nebulas en azul/violeta. Texto: "Nada de caricaturas. El espacio como NASA lo ve."\n\nSLIDE 3: Tendencia #2 "NEON + OSCURO". Decoracion con muchos carteles de luz, fondo negro, colores fosforescentes. Texto: "Elegante y espectacular para fotos."\n\nSLIDE 4: Tendencia #3 "TEMATICAS MIXTAS". Ejemplo: superheroe + espacio, unicornio + galaxia. Texto: "Personalizacion total. Tu hijo elige."\n\nSLIDE 5: Tendencia #4 "PHOTOCALL INTERACTIVO". Sector especial para fotos con props, marco de neon, fondo tematico. Texto: "Todos van a querer sacarse la foto ahi."\n\nSLIDE 6 (CTA): "Cual te gusto mas? Reserva tu fecha y lo hacemos realidad" + datos de contacto`
  },
  // ─── SEMANA 3 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Detalle decoracion espacial',
    caption: `Los detalles marcan la diferencia ✨🚀 Cada elemento de nuestra decoracion esta pensado para hacer WOW a los chicos!\n\n#decoracion #fiestasinfantiles #bigbangfiestas`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-22']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `VIDEO o FOTOS en secuencia rapida (boomerang o slideshow)\nPrimeros planos: cohete de carton, luna inflable, cartel de luz neon, globos metalicos\nMusica chill/trending\nTexto: "Los detalles que hacen la diferencia 🚀"`
  },
  {
    titulo: 'Story: Fechas octubre disponibles',
    caption: `Ya estas pensando en octubre? 📅🚀 Las fechas del proximo mes se estan llenando!\n\nEscribinos para consultar disponibilidad`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-24']),
    pilar: 'comercial',
    tipo_grabacion: 'diseno',
    guion: `SLIDE: Calendario de octubre con algunos dias marcados como "OCUPADO" y otros como "DISPONIBLE"\nTexto: "Quedan X fechas libres en octubre"\nCTA urgencia: "No esperes a ultimo momento"\nBoton de DM`
  },
  {
    titulo: 'Story: El equipo de animadores',
    caption: `Nuestro equipo de animadores hace que cada cumple sea UNICO 🚀🧑‍🚀 Capacitados, divertidos y con mucha energia!\n\n¿Los conoces? Pronto los presentamos uno por uno 👀`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-26']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `VIDEO grupal del equipo de animadores\nSaludando a camara, con trajes/disfraz\nTexto: "El equipo que hace la magia 🚀"\nPresentar con nombre y emoji de cada uno`
  },
  // ─── REEL SEMANA 3 ──────────────────────────────────────────────────────────
  {
    titulo: 'Reel: 3 cosas que diferencian a Big Bang',
    caption: `Por que elegir Big Bang para el cumple de tu hijo? Te cuento las 3 razones mas importantes 🚀\n\nGuarda este video para cuando lo necesites!\n\n#bigbangfiestas #mendoza #fiestasinfantiles #tipscumple`,
    plataforma: 'instagram',
    formato: 'reel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-23']),
    pilar: 'educativo',
    tipo_grabacion: 'camara',
    guion: `FORMATO: Camara a cara (hablando directo)\nDURACION: 45-60 segundos\nLOCACION: frente a la decoracion del local o en un salon terminado\n\nSCRIPT:\n"Hola! Si estas buscando el mejor cumple para tu hijo en Mendoza, quedate porque te cuento las 3 razones por las que las familias eligen Big Bang.\n\n[Razon 1 - levantar 1 dedo] La ANIMACION. No somos solo decoracion. Tenemos animadores propios que hacen juegos, bailes y se encargan de que todos los chicos la pasen increible durante todo el cumple.\n\n[Razon 2 - levantar 2 dedos] La PERSONALIZACION total. Cada cumple es diferente porque cada nino es diferente. Elegis la tematica, los colores, hasta el nombre en neon.\n\n[Razon 3 - levantar 3 dedos] Y la tercera... la TRANQUILIDAD para los padres. Nosotros nos encargamos de todo. Vos solo tenes que llegar y disfrutar.\n\n[Al final] Si queres reservar tu fecha, escribinos por DM o entra al link de la bio. Los cupos son limitados cada mes!"\n\nEDICION: Texto en pantalla que refuerza cada punto. Cuts rapidos entre razones. Logo al final.`
  },
  // ─── SEMANA 4 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Cierre septiembre + teaser octubre',
    caption: `ULTIMO LUNES DE SEPTIEMBRE 🚀 Fueron un mes increible!\n\nEn octubre tenemos una SORPRESA muy especial preparada... Activen las notificaciones para no perdersela 🔔`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-29']),
    pilar: 'contenido',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1: Collage de fotos de los cumples de septiembre con texto "Septiembre terminando 🚀"\nSLIDE 2: Fondo oscuro, signo de pregunta grande, texto "Algo nuevo viene en octubre..."\nSLIDE 3: "Activa notificaciones para enterarte primero" con icono de campana\nCTA: "Comparti con alguien que tenga cumple en octubre!"`
  },
];

export async function POST() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureBigBangTables();
  const sql = getClient();
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM bb_redes`;
    if (count > 0) return Response.json({ ok: true, msg: 'Ya hay contenido cargado.' });
    for (const item of CALENDARIO) {
      await sql`INSERT INTO bb_redes ${sql(item)}`;
    }
    return Response.json({ ok: true, insertados: CALENDARIO.length });
  } finally { await sql.end(); }
}
