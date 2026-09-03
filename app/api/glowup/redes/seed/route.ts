import { isAuthenticated } from '@/lib/adminAuth';
import { ensureGlowUpTables } from '@/lib/glowupDb';
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
    caption: `Esta semana tenemos fechas libres para tu cumple 🎀✨\n\n¿Cuando es tu evento? Escribinos y coordinamos!\n\nZona: Gran Mendoza (sin Las Heras)\n\n👉 Consultas por DM`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-05']),
    pilar: 'comercial',
    tipo_grabacion: 'diseno',
    guion: `SLIDE: Fondo pastel rosa suave con detalles de globos dibujados\nTexto principal: "Fechas disponibles este mes 🎀"\nSubtitulo: "Septiembre casi agotado"\nSticker de encuesta: "¿Tu cumple es en septiembre?" SI / NO\nCTA: "Escribinos por DM para reservar"`
  },
  {
    titulo: 'Story: Detalle arco de globos',
    caption: `Este arco nos llevo 2 horas y un monton de amor 🎀🌸 Pero la cara de la cumpleanera no tiene precio!\n\n¿Queres uno para tu evento?`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-08']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `VIDEO BOOMERANG o VIDEO LENTO: primer plano del arco terminado\nDolly lento desde la base hasta la punta\nColores: el del ultimo evento (pedirle a Tami)\nTexto: "2 horas de trabajo, una eternidad de recuerdos 🎀"\nEtiqueta el lugar si es un salon conocido`
  },
  {
    titulo: 'Story: Con cuanta anticipacion reservar',
    caption: `DATO IMPORTANTE si estas pensando en decorar tu cumple 📅\n\nRecomendamos reservar con al menos 1 semana de anticipacion para poder personalizar todo a tu gusto!\n\nSi tu evento es pronto, escribinos igual, hacemos lo posible 💪`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-10']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE educativo con icono de calendario\nTimeline visual: "1 semana antes → Reserva y sena" / "3 dias antes → Confirmamos colores y detalles" / "Dia del evento → Llegamos 2-3hs antes a armar"\nTexto final: "Asi nos aseguramos que todo salga perfecto 🌸"\nCTA: "Consultas por DM"`
  },
  {
    titulo: 'Story: Testimonio de clienta',
    caption: `"Tami es un amor y la decoracion quedo exactamente como la habia imaginado. Todos me preguntaron quien habia decorado!" - Vicky, mama de Sofia\n\nGracias por confiar en Glow Up Deco 🎀`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-12']),
    pilar: 'testimonial',
    tipo_grabacion: 'diseno',
    guion: `Fondo: foto del evento de Sofia (con permiso)\nCita en letra script/cursiva sobre la foto\nNombre y pequeño detalle: "Vicky, mama de Sofia (3 anos)"\nCorazon animado o emoji de flores\nLogotipo Glow Up Deco abajo\nCTA: "Tu cumple puede ser el proximo 🌸"`
  },
  // ─── REEL SEMANA 1 ──────────────────────────────────────────────────────────
  {
    titulo: 'Reel: Timelapse armado decoracion completa',
    caption: `De salon vacio a sueno hecho realidad en 3 horas 🎀✨ Miralo!\n\nDecoracion para el cumple de Emma, 5 anos. Tematica: mariposas y flores en lila y rosa.\n\n¿Queres una asi para tu cumple? 👇\n\n#glowupdeco #decoracion #cumpleanos #mendoza #globos #decoracioncumple`,
    plataforma: 'instagram',
    formato: 'reel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-09']),
    pilar: 'contenido',
    tipo_grabacion: 'tami_obra',
    guion: `** GRABAR EN OBRA ** (Tami graba cuando vaya a armar)\nPEDIR AL COORDINADOR DEL EVENTO: salon disponible 30min antes para grabar el "vacio"\n\nDURACION FINAL: 30-40 segundos\n\nQUE GRABAR:\n- 0-3seg: INICIO - Salon completamente vacio. Tami entra con las cajas/bolsas de materiales. Grabar desde la puerta. Texto: "Esto era el salon a las 14hs"\n- 3-15seg: PROCESO (timelapse x3) - Poner camara fija en un tripode o apoyada en altura y grabar en lapso de tiempo mientras se arma. Incluir: colgar telas, armar la base de la mesa, montar los paneles, inflar globos, armar el arco\n- 15-25seg: DETALLES - Primeros planos de cada elemento terminado: centro de mesa, cartel de luz, arco de globos, detalle de flores/globos por colores\n- 25-30seg: REVEAL - Camara desde la puerta, abrir lentamente mostrando el salon completo terminado. Texto: "3 horas despues ✨"\n- 30-35seg: Tami frente a la decoracion, sonriendo. Texto: "@glowup.deco"\n\nEDICION: agregar musica trending, acelerartimelapse x4, texto animado\nMUSICA: algo romantico/bello, no muy movido`
  },
  // ─── CARRUSEL SEMANA 1 ──────────────────────────────────────────────────────
  {
    titulo: 'Carrusel: Que incluye la decoracion completa',
    caption: `Todo lo que incluye nuestra decoracion completa en UN SOLO POST 🎀 Desliza para verlo!\n\nPorque creemos que tenes que saber exactamente que estas reservando antes de pagar la sena 🌸\n\n#glowupdeco #decoracioncumple #mendoza #globos #decoracion`,
    plataforma: 'instagram',
    formato: 'carrusel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-11']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1 (portada): Foto de una decoracion completa de fondo. Texto en blanco: "Todo lo que incluye nuestra deco 🎀" + "Desliza →"\n\nSLIDE 2: Item 1 - MESAS DECORATIVAS. Foto de detalle de las mesas. Texto: "Mesas temáticas con alzadas, bandejas y posa tortas según la tematica que elijas. TODO A MEDIDA."\n\nSLIDE 3: Item 2 - ALFOMBRA + PANELES. Foto del sector principal con la alfombra. Texto: "Alfombra de camino + paneles decorativos que enmarcan el sector principal para las fotos."\n\nSLIDE 4: Item 3 - ARCO DE GLOBOS. Foto del arco. Texto: "Arco de 3 colores con globos dimension 24" de 1 a 4 metros segun el espacio. Incluye globos especiales segun la tematica."\n\nSLIDE 5: Item 4 - CARTEL DE LUZ NEON. Foto del neon encendido. Texto: "Happy Birthday + numero de anos en luz neon. El detalle que mas llama la atencion en las fotos!"\n\nSLIDE 6: Item 5 - ACCESORIOS. Collage de accesorios. Texto: "Flores, plantas, imagenes tematicas, el nombre del cumpleanero/a y todo lo que haga falta para completar el look."\n\nSLIDE 7 (CTA): Fondo rosa pastel. Texto: "¿Lista para reservar?\nSena: 50% del total\nAnticipacion minima: 1 semana\nZona: Gran Mendoza" + datos de contacto`
  },
  // ─── SEMANA 2 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Paleta de colores del mes',
    caption: `La paleta de colores MAS PEDIDA de este mes 🌸🤍✨ Rosa viejo + blanco + dorado = elegancia pura!\n\n¿A vos te gusta esta combinacion?`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-15']),
    pilar: 'contenido',
    tipo_grabacion: 'diseno',
    guion: `SLIDE: Cuadrados de colores grandes con el nombre de cada tono: "ROSA VIEJO #C19A9A" / "BLANCO ROTO #F5F0EB" / "DORADO #D4AF37"\nFoto de una decoracion que use esos colores\nTexto: "La combinacion del mes 🌸"\nEncuesta: "¿Te gusta esta paleta?" ME ENCANTA / PREFIERO OTRA\nCTA: "Escribinos para armar TU paleta ideal"`
  },
  {
    titulo: 'Story: Alquilamos o vendemos los materiales',
    caption: `PREGUNTA FRECUENTE: Los materiales son de nosotras o me los quedo?\n\nSolo los globos y el nombre del cumpleanero son para quedarse. El resto es ALQUILER 🎀\n\nAsi podemos mantener los precios accesibles para todas!`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-17']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE con dos columnas o iconos:\n✓ TE LO LLEVAS: globos del arco, nombre del cumpleanero/a\n✗ SE LO LLEVAMOS NOSOTRAS: alfombra, paneles, mesas, alzadas, neon, accesorios\nTexto aclaratorio: "Asi podemos mantener precios accesibles y siempre renovar los materiales 🌸"\nCTA: "Consultas por DM"`
  },
  {
    titulo: 'Story: Foto arco de globos terminado',
    caption: `Este arco quedoooo 🎀✨ Tematica marinera para el cumple de Valentino, 2 anos!\n\nAzul cielo + blanco + ancla = amor puro`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-19']),
    pilar: 'contenido',
    tipo_grabacion: 'camara',
    guion: `FOTO o REEL CORTO: arco terminado, vista completa y luego primer plano de los detalles\nMostrar los globos 24" y como los mas chicos quedan al centro\nTexto: "Arco marinero para Valentino 🌊"\nEtiqueta salon si corresponde\nEncuesta: "¿Te gusta la tematica marinera?" SI / OTRA`
  },
  // ─── REEL SEMANA 2 ──────────────────────────────────────────────────────────
  {
    titulo: 'Reel: 3 estilos de decoracion para cumples de nena',
    caption: `3 estilos completamente diferentes para el cumple de tu nena 🎀 Cual es el favorito de tu hija?\n\nComentanos abajo! 👇\n\n#glowupdeco #decoracioncumple #cumpleanos #mendoza #nenas #estilos`,
    plataforma: 'instagram',
    formato: 'reel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-16']),
    pilar: 'educativo',
    tipo_grabacion: 'camara',
    guion: `FORMATO: Nosotras hablando a camara (no Tami)\nDURACION: 45-60 segundos\nLOCACION: frente a fotos de decoraciones o en estudio con fondo claro\n\nSCRIPT:\n"Si tu hija esta por cumplir y todavia no saben que tematica elegir, te muestro 3 estilos que son los mas pedidos este ano.\n\n[Mostrando foto 1] El primero: ROMANTIQ PRINC. Tonos rosa, lila y dorado. Flores, mariposas, mucho brillo. Es el clasico que nunca falla para las mas chiquitas.\n\n[Mostrando foto 2] El segundo: MODERNO MINIMAL. Blanco, negro y un color acento tipo terracota o verde. Muy limpio y elegante. Ideal si la mama tiene ojo para el deco y quiere algo mas sofisticado.\n\n[Mostrando foto 3] El tercero: BOTANICO VERDE. Muchas plantas reales, flores secas, tono tierra. Esta en su momento de mayor auge y queda INCREIBLE en fotos.\n\n¿Cual le gusta mas a tu hija? Comentanos y si queres cotizamos el que elijan!"\n\nEDICION: Mostrar las fotos de cada estilo cuando se nombran. Transiciones suaves. Musica suave de fondo.\nNOTA: Necesitamos fotos de al menos 2 de estos 3 estilos de eventos anteriores de Glow Up`
  },
  // ─── SEMANA 3 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Proceso de armado paso a paso',
    caption: `Detras de escena de un armado 🎀 Esto es lo que hacemos cada vez que vamos a un evento!\n\nHoras de trabajo para que el resultado sea perfecto ✨`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-22']),
    pilar: 'contenido',
    tipo_grabacion: 'tami_obra',
    guion: `** GRABAR EN OBRA ** (Tami graba durante el proximo armado)\nSERIE DE 4-5 STORIES:\nStory 1: "Llegamos al salon 📦" - foto de las cajas y materiales en la entrada\nStory 2: "Empezamos por la base 🌸" - foto del piso con la alfombra\nStory 3: "El arco en construccion 🎈" - foto del arco a la mitad\nStory 4: "Casi listo... 👀" - foto del salon 80% armado\nStory 5: "LISTO! 🎀" - reveal del salon completo\nCada story con texto y musica`
  },
  {
    titulo: 'Story: Fechas disponibles de octubre',
    caption: `Octubre ya esta a la vuelta de la esquina 📅🎀 Si tu cumple es el proximo mes, escribinos YA!\n\nLas fechas se llenan rapido y queremos darte el mejor servicio`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-24']),
    pilar: 'comercial',
    tipo_grabacion: 'diseno',
    guion: `SLIDE: Calendario de octubre con fechas disponibles marcadas en verde y ocupadas en rosado\nTexto: "Octubre disponible 📅"\nNumero de fechas libres: actualizar el dia que se publique\nCTA de urgencia: "Solo quedan X sabados libres"\nBoton de DM`
  },
  {
    titulo: 'Story: Zona de cobertura',
    caption: `IMPORTANTE: nuestra zona de cobertura es el GRAN MENDOZA (excluyendo Las Heras) 📍\n\nEl envio se cotiza segun la distancia al salon de tu evento. Consulta tu zona!`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-26']),
    pilar: 'educativo',
    tipo_grabacion: 'diseno',
    guion: `SLIDE: Mapa simple de Gran Mendoza con la zona de cobertura marcada\nTextos: "Trabajamos en:" + lista de zonas (Capital, Godoy Cruz, Guaymallen, Maipu, Luzuriaga, Lujan de Cuyo, etc.)\n"No llegamos a: Las Heras"\nCTA: "Consulta tu zona especifica por DM"`
  },
  // ─── REEL SEMANA 3 ──────────────────────────────────────────────────────────
  {
    titulo: 'Reel: Antes y despues de una decoracion completa',
    caption: `El ANTES y DESPUES que todos esperan 🎀✨ Esto es lo que pasa cuando Glow Up Deco llega a un salon!\n\nTematica: jardim secreto | cumple de Olivia, 4 anos\n\nGuarda este post si vas a tener un cumple pronto 👇\n\n#glowupdeco #antesydespues #decoracion #cumpleanos #mendoza`,
    plataforma: 'instagram',
    formato: 'reel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-23']),
    pilar: 'contenido',
    tipo_grabacion: 'tami_obra',
    guion: `** GRABAR EN OBRA ** (Tami graba en el proximo evento grande)\nDURACION FINAL: 20-30 segundos\n\nFORMATO: ANTES/DESPUES con transicion en el centro de pantalla\n\nQUE GRABAR:\n- ANTES: Video de 5-8 segundos del salon completamente vacio. Luz encendida. Recorrer el salon de izquierda a derecha lentamente.\n- DURANTE (opcional): clip de 3 segundos de las cajas en el piso\n- DESPUES: Video de 8-10 segundos del salon terminado. Misma angulacion que el ANTES. Luz del salon + luz del neon encendido.\n- DETALLE: 5 segundos de primer plano del elemento estrella (arco, neon, mesa principal)\n\nTEXTO A AGREGAR EN EDICION:\n"ANTES" en el lado izquierdo con reloj 14:00\n"DESPUES" en el lado derecho con reloj 17:30\n"3 horas de magia 🎀"\n\nMUSICA: "Before He Cheats" o trending reveal. Algo con impacto en el momento del reveal\nTRANSICION: wipe del centro o linea que divide antes/despues`
  },
  // ─── CARRUSEL SEMANA 3 ──────────────────────────────────────────────────────
  {
    titulo: 'Carrusel: Las 5 paletas mas pedidas de septiembre',
    caption: `Las paletas de colores que mas nos pidieron este mes 🌸 Guardala para cuando tengas que elegir!\n\nCual es tu favorita? 👇 Comentanos!\n\n#glowupdeco #paleta #decoracion #colores #cumpleanos #mendoza`,
    plataforma: 'instagram',
    formato: 'carrusel',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-25']),
    pilar: 'contenido',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1 (portada): Titulo "LAS PALETAS MAS PEDIDAS 🌸" sobre fondo con puntos de color. Subtexto: "Septiembre 2026 | Glow Up Deco"\n\nSLIDE 2: PALETA 1 - "ROMANTICA CLASICA". Muestras de color: rosa chicle / lila / blanco / dorado. Foto de decoracion con esos colores. Texto: "La que nunca falla. Para princesas de 1 a 100 anos."\n\nSLIDE 3: PALETA 2 - "BOTANICA VERDE". Muestras: verde salvia / terracota / beige / blanco roto. Foto. Texto: "La mas pedida este 2026. Natural, elegante y diferente."\n\nSLIDE 4: PALETA 3 - "PASTEL TOTAL". Muestras: amarillo pastel / celeste bebé / rosa bebe / lavanda / menta. Foto. Texto: "Ideal para cumples de bebes y nenas pequenas. Dulce y soñadora."\n\nSLIDE 5: PALETA 4 - "NEGRO Y DORADO". Muestras: negro / dorado / blanco. Foto. Texto: "Para las que quieren algo mas adulto y sofisticado. Impacto garantizado."\n\nSLIDE 6: PALETA 5 - "AZUL Y BLANCO". Muestras: azul bebe / azul rey / blanco / plateado. Foto. Texto: "Versatil para nenes y nenas. Marino, cielo, lo que elijas."\n\nSLIDE 7 (CTA): "Tu paleta ideal te espera. Escribinos y la creamos juntas 🌸" + datos de contacto`
  },
  // ─── SEMANA 4 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Story: Cierre septiembre',
    caption: `Ultimo lunes del mes y nosotras con todo 🎀✨ Septiembre fue un mes increible lleno de eventos hermosos!\n\nGracias a todas las familias que confiaron en Glow Up Deco este mes 💕`,
    plataforma: 'instagram',
    formato: 'story',
    estado: 'borrador',
    fechas_prog: JSON.stringify(['2026-09-29']),
    pilar: 'contenido',
    tipo_grabacion: 'diseno',
    guion: `SLIDE 1: Collage de fotos de los mejores eventos de septiembre (mosaico 3x3 o carrusel de fotos)\nTexto: "Septiembre fue hermoso 🌸"\n\nSLIDE 2: Texto de agradecimiento\n"Gracias a TODAS las familias que nos eligieron este mes. Cada cumple fue especial."\nNombres de las cumpleaneras (solo primer nombre, con permiso)\n\nSLIDE 3: CTA octubre\n"Octubre ya esta abierto 📅 Fechas limitadas"\nBoton de DM`
  },
];

export async function POST() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  const sql = getClient();
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM gu_redes`;
    if (count > 0) return Response.json({ ok: true, msg: 'Ya hay contenido cargado.' });
    for (const item of CALENDARIO) {
      await sql`INSERT INTO gu_redes ${sql(item)}`;
    }
    return Response.json({ ok: true, insertados: CALENDARIO.length });
  } finally { await sql.end(); }
}
