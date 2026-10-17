// Traduce una filtración de Have I Been Pwned a texto claro, en castellano.
// La función /api/check usa este módulo; el navegador no lo necesita y no
// debe importarlo: así el bundle del visitante no arrastra el catálogo.
//
// Los nombres en inglés son los de HIBP (estables). El texto es nuestro.

export type AdviceBlock = {
  label: string;
  explanation: string;
  recommendation: string;
};

export type BreachCard = {
  title: string;
  domain: string;
  date: string;
  leaked: string[];
  note: string | null;
  affected: string | null;
};

export type CheckView = {
  found: boolean;
  summary: string;
  detail: string;
  footnote: string | null;
  breaches: BreachCard[];
  advice: AdviceBlock[];
};

type AdviceText = AdviceBlock;

const CLASSES = new Map<string, AdviceText>();

function group(
  text: Pick<AdviceText, "explanation" | "recommendation">,
  rows: ReadonlyArray<readonly [string, string]>,
) {
  for (const [name, label] of rows) {
    const key = name.toLowerCase();
    if (CLASSES.has(key)) {
      throw new Error(`Clase de dato repetida: ${name}`);
    }
    CLASSES.set(key, { label, ...text });
  }
}

function one(
  name: string,
  label: string,
  explanation: string,
  recommendation: string,
) {
  group({ explanation, recommendation }, [[name, label]]);
}

const CHANGE_PASSWORD =
  "Cámbiala si todavía la usas, y no la repitas en ningún otro sitio. Activa la verificación en dos pasos donde puedas.";

one(
  "Passwords",
  "Contraseñas",
  "La contraseña que usabas en ese servicio quedó expuesta.",
  CHANGE_PASSWORD,
);

one(
  "Historical passwords",
  "Contraseñas antiguas",
  "No solo salió la última contraseña: también otras que usaste antes.",
  "Si reutilizaste alguna, cámbiala también en el resto de sitios. Una contraseña vieja sigue sirviendo si la dejaste puesta en otro lado.",
);

one(
  "Password hints",
  "Pistas de contraseña",
  "Quedó guardada una pista pensada para recordarte la contraseña, y también sirve para adivinarla.",
  "Cambia las contraseñas que se puedan deducir de esa pista. En los servicios nuevos, no dejes pistas.",
);

one(
  "Password strengths",
  "Fortaleza de la contraseña",
  "Quedó anotado si tu contraseña era fácil o difícil de acertar, no necesariamente la contraseña en sí.",
  "Si era débil, cámbiala por una larga y distinta. Con este dato solo no hace falta ninguna otra gestión.",
);

one(
  "PINs",
  "PIN",
  "Un PIN —el código de una tarjeta, un móvil o una cuenta— quedó expuesto.",
  "Cámbialo si todavía lo usas, y no lo repitas a la vez en la tarjeta, el móvil y el banco.",
);

one(
  "Security questions and answers",
  "Preguntas de seguridad",
  "Las respuestas para recuperar la cuenta (una mascota, un colegio, un apellido) quedaron expuestas.",
  "Cambia esas respuestas en otros servicios. Si puedes, usa un código de un solo uso en lugar de una pregunta.",
);

one(
  "Auth tokens",
  "Llaves de sesión",
  "Son unas llaves temporales con las que el servicio te reconocía sin volver a pedir la contraseña.",
  "Cierra las sesiones abiertas de ese servicio, cambia la contraseña y vuelve a entrar. Así dejas inservibles las llaves viejas.",
);

one(
  "Encrypted keys",
  "Claves protegidas",
  "Aparecen claves que no se leen a simple vista porque van protegidas. No hay que darlas por seguras.",
  "Sustitúyelas si aún las usas para entrar o para firmar algo, y no reutilices la contraseña que las protegía.",
);

one(
  "Mnemonic phrases",
  "Frases semilla",
  "Es la lista de palabras que recupera un monedero de criptomonedas. Quien la tiene, tiene los fondos.",
  "Pasa los fondos a un monedero nuevo, con una frase nueva, y no vuelvas a guardar esa frase en un correo o en una nota en la nube.",
);

one(
  "Phone numbers",
  "Teléfonos",
  "Tu número de teléfono quedó asociado a este correo.",
  "Desconfía de llamadas y SMS que te pidan códigos, datos o un enlace. No llames al número que te dejen en un mensaje inesperado.",
);

one(
  "Partial phone numbers",
  "Teléfonos parciales",
  "Solo aparece una parte del número, no el teléfono entero.",
  "Aun así, desconfía de SMS y llamadas que citen ese dato para pedirte un código o un enlace.",
);

one(
  "Physical addresses",
  "Direcciones postales",
  "Tu dirección física aparece entre los datos filtrados.",
  "Recela de cartas, paquetes o visitas que usen esa dirección para hacerse pasar por un banco, una tienda o la administración. No confirmes datos a quien te llame sin avisar.",
);

one(
  "Dates of birth",
  "Fechas de nacimiento",
  "Tu fecha de nacimiento se usa a menudo para comprobar que eres tú.",
  "No la uses como contraseña ni como respuesta de seguridad. Si un servicio solo te identifica con ella, pregunta si puedes cambiar ese método.",
);

one(
  "Partial dates of birth",
  "Fechas de nacimiento parciales",
  "Aparece solo una parte de tu fecha de nacimiento, por ejemplo el año o el día y el mes.",
  "No la completes tú en respuestas de seguridad ni en contraseñas. Trata ese trozo como un dato que ya no es secreto.",
);

one(
  "Email addresses",
  "Direcciones de correo",
  "El propio correo forma parte de la filtración: por eso esta consulta puede encontrarlo.",
  "Sospecha de mensajes que te llamen por tu nombre y te metan prisa. Entra en los servicios escribiendo tú la dirección, no desde un botón del mensaje.",
);

one(
  "Recovery email addresses",
  "Correos de recuperación",
  "El correo que usabas para recuperar la cuenta también quedó expuesto.",
  "Revisa que ese correo siga siendo tuyo y que su contraseña sea distinta. Quien entre ahí puede pedir el cambio de contraseña del resto.",
);

one(
  "Names",
  "Nombres",
  "Tu nombre aparece junto a este correo. Con eso, un mensaje falso parece más creíble.",
  "Un mensaje falso resulta más creíble con tu nombre. Antes de pagar, enviar un código o abrir un enlace, confirma por una llamada que hagas tú que la petición es real.",
);

one(
  "Usernames",
  "Nombres de usuario",
  "El nombre con el que entrabas en ese servicio quedó expuesto.",
  "Si repites ese usuario en otros sitios, mira qué se ve en público. No reutilices su contraseña.",
);

one(
  "Credit cards",
  "Tarjetas de crédito",
  "Los datos de una tarjeta quedaron en la filtración.",
  "Revisa los movimientos. Si no reconoces algo, llama a tu banco por el número de la tarjeta o de su web oficial y pide una tarjeta nueva. No uses el teléfono de un SMS.",
);

one(
  "Partial credit card data",
  "Datos parciales de tarjeta",
  "Aparece solo una parte de la tarjeta, a menudo los últimos dígitos.",
  "Con eso no se puede pagar, pero sí fingir que te conocen. Revisa los movimientos y no confirmes el resto del número a nadie que te escriba.",
);

one(
  "Credit card CVV",
  "Código de seguridad de la tarjeta",
  "El código de detrás de la tarjeta quedó expuesto, junto a otros datos de pago.",
  "Con el número y ese código se puede comprar por internet. Avisa a tu banco y pide una tarjeta nueva: ese código no se cambia, se sustituye la tarjeta.",
);

one(
  "Bank account numbers",
  "Números de cuenta",
  "Tu número de cuenta bancaria quedó expuesto.",
  "Sirve sobre todo para hacerse pasar por tu banco. Revisa los movimientos y habla con el banco por su teléfono oficial si ves algo raro. No des códigos que te lleguen por SMS.",
);

one(
  "Government issued IDs",
  "Documentos de identidad",
  "Un documento oficial, como el DNI o uno equivalente, quedó expuesto.",
  "No envíes fotos del documento por correo ni por mensaje. Si ves trámites que no has iniciado, pregunta en la policía o en la oficina que lo emitió cómo dejar constancia.",
);

one(
  "Partial government issued IDs",
  "Documentos de identidad parciales",
  "Aparece solo una parte de un documento oficial, no el número completo.",
  "No completes tú el resto si alguien te lo pide para «verificar». Con el trozo ya pueden fingir que te conocen.",
);

one(
  "Social security numbers",
  "Números de la seguridad social",
  "Quedó expuesto un número de afiliación o de seguridad social.",
  "Desconfía de trámites, bajas o ayudas que no hayas pedido. Si te citan ese número para exigirte un pago inmediato, contrasta con el organismo en su web oficial.",
);

one(
  "Passport numbers",
  "Números de pasaporte",
  "El número de tu pasaporte quedó expuesto.",
  "No envíes fotos del pasaporte. Si no lo tienes localizado o ves un uso que no reconoces, pregunta en la policía cómo denunciarlo.",
);

one(
  "Driver's licenses",
  "Permisos de conducir",
  "Los datos de tu permiso de conducir quedaron expuestos.",
  "No mandes una foto del permiso a quien te la pida por mensaje. Si sospechas un uso indebido, pregunta en tráfico o en la policía cómo dejar constancia.",
);

one(
  "IP addresses",
  "Direcciones IP",
  "Una dirección IP señala una conexión de red en un momento dado, no tu casa con certeza ni tu identidad.",
  "No hace falta que hagas nada técnico. Desconfía si alguien cita ese dato para asustarte, pedirte dinero o venderte una limpieza del ordenador.",
);

one(
  "Photos",
  "Fotos",
  "Hay fotos tuyas, o tomadas desde tu cuenta, entre los datos filtrados.",
  "Pueden servir para hacerse pasar por ti. Revisa perfiles que no recuerdes haber abierto. Si alguien te amenaza con publicarlas, no pagues: guarda el mensaje y cuéntaselo a una persona de confianza.",
);

one(
  "Profile photos",
  "Fotos de perfil",
  "La imagen con la que te mostrabas en ese servicio quedó expuesta.",
  "Sirve para copiar tu perfil en otro sitio. Busca cuentas con tu nombre y tu foto que no hayas creado tú, y repórtalas en esa red.",
);

one(
  "Biometric data",
  "Datos biométricos",
  "Hay datos de tu cuerpo (una huella, una cara, un iris) pensados para identificarte.",
  "No se pueden cambiar como una contraseña. Pregunta al servicio cómo desactivar ese acceso y usa otro método. Si alguien te pide verificar tu cara por un enlace, no lo hagas.",
);

one(
  "HIV statuses",
  "Estado serológico",
  "Aparece información sobre VIH. Es un dato de salud íntimo.",
  "Nadie debería usarlo para presionarte. No respondas a chantajes ni pagues. Si te sientes en peligro, guarda el mensaje y pide ayuda a alguien de confianza o a la policía.",
);

one(
  "Sexual orientations",
  "Orientación sexual",
  "Aparece tu orientación sexual. Es un dato íntimo.",
  "Nadie tiene derecho a usarlo contra ti. No pagues si te amenazan con contarlo. Guarda el mensaje y, si lo necesitas, pide ayuda a una persona de confianza o a la policía.",
);

one(
  "Sexual fetishes",
  "Preferencias sexuales",
  "Aparecen preferencias sexuales íntimas asociadas a este correo.",
  "Un chantaje con este dato busca que pagues y que te calles. No pagues: quien chantajea suele volver a pedir. Guarda el mensaje y apóyate en alguien de confianza o en la policía.",
);

one(
  "Personal health data",
  "Datos de salud",
  "Hay información sobre tu salud en la filtración.",
  "Es íntima. Desconfía de mensajes que la citen para venderte un tratamiento o para asustarte. No la confirmes a desconocidos.",
);

one(
  "Health insurance information",
  "Seguros médicos",
  "Quedaron datos de tu seguro de salud, como la póliza o la aseguradora.",
  "Revisa que no haya cargos o citas que no reconozcas. Habla con la aseguradora por su teléfono oficial, no por el de un mensaje.",
);

one(
  "Mothers maiden names",
  "Apellido de soltera de la madre",
  "Este dato se ha usado mucho como pregunta para recuperar cuentas.",
  "Si alguna cuenta aún lo pregunta, cambia esa respuesta por otra que no se pueda buscar, o mejor activa un código de un solo uso.",
);

one(
  "Places of birth",
  "Lugares de nacimiento",
  "El lugar donde naciste se usa a menudo en formularios y en preguntas de seguridad.",
  "No lo uses como respuesta secreta. Quien lo junte con tu nombre puede rellenar trámites haciéndose pasar por ti.",
);

one(
  "Delivery instructions",
  "Instrucciones de entrega",
  "Son indicaciones para encontrar tu casa: un portal, un timbre, dejarlo en conserjería.",
  "No las repitas en sitios que no sean de un pedido que estés esperando, y desconfía de avisos de reparto con un enlace.",
);

one(
  "Apps installed on devices",
  "Aplicaciones instaladas",
  "La lista de aplicaciones de un dispositivo cuenta hábitos tuyos.",
  "Si no reconoces el dispositivo, cambia las contraseñas de las cuentas que tenías abiertas en él. No instales nada que te pidan en un mensaje.",
);

one(
  "Browsing histories",
  "Historial de navegación",
  "El historial dice qué webs visitaste. Puede ser íntimo.",
  "Nadie debería chantajearte con ello. Si el dato salió de tu dispositivo, cambia las contraseñas que el navegador guardaba. No pagues por borrar el historial.",
);

one(
  "Login histories",
  "Historial de accesos",
  "Queda constancia de cuándo se entró en una cuenta.",
  "Si en ese servicio ves accesos que no reconoces, cambia la contraseña y cierra el resto de sesiones.",
);

one(
  "Audio recordings",
  "Grabaciones de voz",
  "Hay grabaciones de tu voz. Alguien podría intentar imitarte con ellas.",
  "Pueden usarse para imitarte. Desconfía de una llamada que te meta prisa: cuelga y llama tú al número de siempre.",
);

one(
  "AI prompts",
  "Textos escritos a un asistente",
  "Son textos que escribiste a un asistente automático. A veces cuentan más de lo que parece.",
  "Si pegaste ahí contraseñas, documentos o secretos, cámbialos. Si solo eran preguntas cotidianas, no hace falta ninguna gestión.",
);

one(
  "Shipment tracking numbers",
  "Números de seguimiento",
  "Un número de seguimiento de un paquete quedó asociado a ti.",
  "Los fraudes de paquetes son habituales. Mira el seguimiento en la web de la empresa de transporte, no en un enlace que te llegue por mensaje.",
);

one(
  "Cryptocurrency wallet addresses",
  "Direcciones de monederos",
  "Es la dirección de un monedero de criptomonedas. No es la frase secreta, pero deja ver movimientos de ese monedero.",
  "No envíes fondos a una dirección que te dicten en un mensaje. Si también se filtró la frase semilla, mueve los fondos a un monedero nuevo.",
);

one(
  "Address book contacts",
  "Contactos de la agenda",
  "Tu agenda —nombres y formas de contacto de otras personas— quedó expuesta.",
  "Esas personas pueden recibir engaños en tu nombre. Si puedes, avísales de que no te crean si les pides dinero por mensaje sin hablar antes.",
);

one(
  "Deceased date",
  "Fecha de fallecimiento",
  "Hay una fecha de fallecimiento asociada a este correo.",
  "Desconfía de trámites, seguros o condolencias que te pidan un pago o un documento. Contrasta con el organismo oficial.",
);

one(
  "Deceased statuses",
  "Indicación de fallecimiento",
  "El registro marca un fallecimiento asociado a este correo.",
  "Desconfía de trámites o condolencias que te pidan un pago o un documento. Contrasta con el organismo oficial, no con el enlace del mensaje.",
);

group(
  {
    explanation:
      "Este dato sitúa un lugar relacionado contigo: una ciudad o un punto en el mapa.",
    recommendation:
      "No confirma por sí solo dónde estás ahora. Sí hace más creíble un engaño, como un paquete, una visita o una multa. No confirmes la dirección a quien te contacte sin avisar.",
  },
  [
    ["Geographic locations", "Ubicaciones"],
    ["Latitude and longitude pairs", "Coordenadas"],
  ],
);

group(
  {
    explanation:
      "Identifica un aparato o cómo se usaba, no tu domicilio.",
    recommendation:
      "No hace falta que hagas nada técnico por este dato solo. Desconfía de avisos que citen tu móvil o tu ordenador para asustarte o para que instales algo.",
  },
  [
    ["Device information", "Datos del dispositivo"],
    ["Device serial numbers", "Números de serie"],
    ["Device usage tracking data", "Uso del dispositivo"],
    ["IMEI numbers", "Identificador del móvil (IMEI)"],
    ["IMSI numbers", "Identificador de la línea (IMSI)"],
    ["MAC addresses", "Direcciones físicas del aparato (MAC)"],
    ["Browser user agent details", "Datos del navegador"],
  ],
);

group(
  {
    explanation:
      "Es información económica asociada a ti. Quien la tenga puede fingir que llama de tu banco o de Hacienda.",
    recommendation:
      "Revisa los movimientos de las próximas semanas. Si algo no cuadra, llama a tu banco o a la agencia por el teléfono de su web, nunca por el de un mensaje.",
  },
  [
    ["Account balances", "Saldos de cuentas"],
    ["Credit scores", "Puntuaciones de crédito"],
    ["Credit status information", "Situación crediticia"],
    ["Earnings", "Ingresos"],
    ["Financial investments", "Inversiones"],
    ["Financial transactions", "Movimientos de dinero"],
    ["Income levels", "Nivel de ingresos"],
    ["Living costs", "Gastos del hogar"],
    ["Loan information", "Préstamos"],
    ["Net worths", "Patrimonio"],
    ["Payment histories", "Historial de pagos"],
    ["Payment methods", "Métodos de pago"],
    ["Taxation records", "Datos fiscales"],
    ["Utility bills", "Facturas de suministros"],
  ],
);

group(
  {
    explanation: "Hay texto que escribiste: conversaciones, correos o comentarios.",
    recommendation:
      "Si el contenido es íntimo, nadie debería chantajearte con él. No pagues, guarda el aviso y apóyate en alguien de confianza.",
  },
  [
    ["Chat logs", "Conversaciones de chat"],
    ["Comments", "Comentarios"],
    ["Email messages", "Correos electrónicos"],
    ["Forum posts", "Mensajes en foros"],
    ["Private messages", "Mensajes privados"],
    ["SMS messages", "Mensajes SMS"],
  ],
);

group(
  {
    explanation:
      "Es un dato personal íntimo. No tienes por qué justificarlo ante nadie.",
    recommendation:
      "Nadie debería usarlo para presionarte. No pagues si te amenazan con difundirlo. Guarda el mensaje y, si lo necesitas, pide ayuda a una persona de confianza o a la policía.",
  },
  [
    ["Disabilities", "Discapacidades"],
    ["Drug habits", "Consumo de sustancias"],
    ["Religions", "Religión"],
    ["Ethnicities", "Etnia"],
    ["Races", "Raza"],
    ["Political views", "Ideas políticas"],
    ["Political donations", "Donaciones políticas"],
  ],
);

group(
  {
    explanation: "Hay nombres o datos de tu familia asociados a este correo.",
    recommendation:
      "Un mensaje que cita a un familiar es un engaño habitual. Confirma por un medio que sí uses con esa persona antes de enviar dinero o documentos, y avísale si crees que pueden escribirle.",
  },
  [
    ["Family members' names", "Nombres de familiares"],
    ["Family plans", "Planes familiares"],
    ["Family structure", "Estructura familiar"],
    ["Parenting plans", "Acuerdos de custodia"],
    ["Spouses names", "Nombre de la pareja"],
  ],
);

group(
  {
    explanation: "Aparece información de tu trabajo o de tu búsqueda de empleo.",
    recommendation:
      "Cuidado con ofertas o supuestos recursos humanos que te pidan documentos o un pago. Entra en el portal de empleo escribiendo tú la dirección.",
  },
  [
    ["Career levels", "Nivel profesional"],
    ["Company names", "Empresas"],
    ["Employers", "Empresas donde trabajas"],
    ["Employment statuses", "Situación laboral"],
    ["Job applications", "Candidaturas de empleo"],
    ["Job titles", "Puestos de trabajo"],
    ["Occupations", "Ocupaciones"],
    ["Professional skills", "Competencias profesionales"],
    ["Work habits", "Hábitos de trabajo"],
    ["Years of professional experience", "Años de experiencia"],
  ],
);

group(
  {
    explanation: "Es un dato con el que te presentas en internet.",
    recommendation:
      "Si usas el mismo nombre en varios sitios, mira si ha aparecido un perfil que no hayas creado tú. No reutilices la contraseña de esa cuenta.",
  },
  [
    ["Avatars", "Avatares"],
    ["Bios", "Biografías"],
    ["Display names", "Nombres visibles"],
    ["Homepage URLs", "Páginas personales"],
    ["Instant messenger identities", "Cuentas de mensajería"],
    ["Nicknames", "Apodos"],
    ["Personal descriptions", "Descripciones personales"],
    ["Salutations", "Tratamientos"],
    ["Social media profiles", "Perfiles en redes"],
    ["User website URLs", "Direcciones de webs"],
  ],
);

group(
  {
    explanation: "Hay información de viajes asociada a este correo.",
    recommendation:
      "Desconfía de cambios de reserva, recargos o mensajes de una aerolínea que no esperabas. Entra en su web escribiendo tú la dirección, no desde el enlace del mensaje.",
  },
  [
    ["Flights taken", "Vuelos"],
    ["Travel habits", "Hábitos de viaje"],
    ["Travel plans", "Planes de viaje"],
  ],
);

group(
  {
    explanation:
      "Hay datos de un vehículo asociado a ti, como la matrícula, el modelo o el bastidor.",
    recommendation:
      "Desconfía de multas, peajes o citas de la ITV que lleguen por mensaje y pidan un pago inmediato. Contrasta en la web oficial.",
  },
  [
    ["Car ownership statuses", "Si tienes coche"],
    ["Licence plates", "Matrículas"],
    ["Vehicle details", "Datos del vehículo"],
    ["Vehicle identification numbers (VINs)", "Números de bastidor"],
    ["Vehicle registration plates", "Matrículas del vehículo"],
  ],
);

group(
  {
    explanation: "Describe tu aspecto. No es una contraseña.",
    recommendation:
      "No suele hacer falta ninguna gestión. Desconfía de quien use ese detalle para hacerse pasar por alguien que te conoce.",
  },
  [
    ["Beauty ratings", "Valoraciones de aspecto"],
    ["Clothing sizes", "Tallas de ropa"],
    ["Physical attributes", "Rasgos físicos"],
    ["Tattoo status", "Tatuajes"],
  ],
);

group(
  {
    explanation:
      "Es un dato personal, no una contraseña. Rara vez exige un cambio urgente.",
    recommendation:
      "Sirve para que un mensaje falso resulte creíble. Desconfía de las urgencias que citen este detalle y te pidan un código, un pago o un enlace.",
  },
  [
    ["Academic records", "Expedientes académicos"],
    ["Age groups", "Grupos de edad"],
    ["Ages", "Edades"],
    ["Appointments", "Citas"],
    ["Astrological signs", "Signos del zodiaco"],
    ["Buying preferences", "Preferencias de compra"],
    ["Cellular network names", "Compañías de móvil"],
    ["Charitable donations", "Donaciones"],
    ["Citizenship statuses", "Ciudadanía"],
    ["Customer feedback", "Opiniones de cliente"],
    ["Customer interactions", "Interacciones con un servicio"],
    ["Customer service records", "Historial de atención al cliente"],
    ["Drinking habits", "Hábitos con el alcohol"],
    ["Eating habits", "Hábitos de alimentación"],
    ["Education levels", "Nivel de estudios"],
    ["Fitness levels", "Forma física"],
    ["Genders", "Género"],
    ["Home ownership statuses", "Si la vivienda es propia"],
    ["IQ levels", "Cociente intelectual"],
    ["Language preferences", "Idiomas preferidos"],
    ["Loyalty program details", "Programas de puntos"],
    ["Marital statuses", "Estado civil"],
    ["Military service", "Servicio militar"],
    ["Nationalities", "Nacionalidades"],
    ["Personal interests", "Intereses"],
    ["Profile statistics", "Estadísticas del perfil"],
    ["Purchases", "Compras"],
    ["Purchasing habits", "Hábitos de compra"],
    ["Relationship statuses", "Situación sentimental"],
    ["Reward program balances", "Saldo de puntos"],
    ["School grades (class levels)", "Curso escolar"],
    ["Smoking habits", "Hábito de fumar"],
    ["Social connections", "Contactos en redes"],
    ["Socioeconomic levels", "Nivel socioeconómico"],
    ["Spoken languages", "Idiomas que hablas"],
    ["Support tickets", "Consultas de soporte"],
    ["Survey results", "Respuestas a encuestas"],
    ["Telecommunications carrier", "Operador de telefonía"],
    ["Time zones", "Husos horarios"],
    ["User statuses", "Estados de la cuenta"],
    ["VIP statuses", "Si eras cliente preferente"],
    ["Warranty claims", "Reclamaciones de garantía"],
    ["Website activity", "Actividad en la web"],
  ],
);

const FALLBACK_EXPLANATION =
  "Este dato también formaba parte de la filtración. Conservamos el nombre que usa Have I Been Pwned porque no tenemos una explicación propia más fina.";
const FALLBACK_RECOMMENDATION =
  "Anota de qué se trata y piensa si te identifica en otros sitios. Desconfía de quien lo mencione para pedirte dinero, un código o un enlace.";

const SERIOUS = new Set([
  "passwords",
  "historical passwords",
  "password hints",
  "pins",
  "security questions and answers",
  "auth tokens",
  "encrypted keys",
  "mnemonic phrases",
  "credit cards",
  "credit card cvv",
  "bank account numbers",
  "government issued ids",
  "partial government issued ids",
  "social security numbers",
  "passport numbers",
  "driver's licenses",
  "biometric data",
  "phone numbers",
]);

const EMPTY_SUMMARY =
  "Buena señal: este correo no aparece en las filtraciones verificadas que consulta Have I Been Pwned.";
const EMPTY_DETAIL =
  "Eso no demuestra que no exista nada más sobre ti en internet. Solo que, en esta lista, no hay una filtración verificada con este correo.";
const FOUND_DETAIL =
  "Te cuento qué se filtró y qué puedes hacer, con calma y por partes.";
// El mismo umbral que en la guía: con muchas fichas el detalle no promete
// recorrerlas todas, porque el chat solo abre las primeras.
const MANY = 20;
const DATE_FOOTNOTE =
  "La fecha es orientativa: a menudo la filtración se descubre mucho después.";
const UNDATED = "Fecha no indicada";
const UNKNOWN_LEAK = "No se detalla qué datos concretos se filtraron";

export function explainDataClass(name: string): AdviceBlock & { source: string } {
  const clean = name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
  const found = CLASSES.get(clean.toLowerCase());
  if (found) return { source: clean, ...found };
  return {
    source: clean || "dato",
    label: clean || "Dato sin nombre",
    explanation: FALLBACK_EXPLANATION,
    recommendation: FALLBACK_RECOMMENDATION,
  };
}

export function noBreachView(): CheckView {
  return {
    found: false,
    summary: EMPTY_SUMMARY,
    detail: EMPTY_DETAIL,
    footnote: null,
    breaches: [],
    advice: [],
  };
}

function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function formatDate(value: unknown): { label: string; sort: number } {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { label: UNDATED, sort: Number.NEGATIVE_INFINITY };
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { label: UNDATED, sort: Number.NEGATIVE_INFINITY };
  }
  return {
    label: new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
    sort: date.getTime(),
  };
}

function formatAffected(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  const count = Math.floor(value);
  const formatted = new Intl.NumberFormat("es").format(count);
  return count === 1 ? "1 cuenta afectada" : `${formatted} cuentas afectadas`;
}

function cleanDomain(value: unknown): string {
  const domain = cleanLine(value, 253).toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return "";
  return domain;
}

function breachNote(record: Record<string, unknown>): string | null {
  const parts: string[] = [];
  if (record.IsFabricated === true) {
    parts.push("Parte de estos datos parece fabricada. El correo sí figuraba en el lote.");
  }
  if (record.IsVerified === false) {
    parts.push(
      "Have I Been Pwned todavía no ha podido verificar esta filtración. Tómalo como una pista.",
    );
  }
  if (record.IsStealerLog === true) {
    parts.push(
      "Salió de un programa que roba lo guardado en un dispositivo, no de un ataque a una web.",
    );
  } else if (record.IsMalware === true) {
    parts.push("Salió de un programa malicioso en algún dispositivo, no de un ataque a una web.");
  }
  if (record.IsSpamList === true) {
    parts.push("Es una lista de correo comercial, no un robo de contraseñas.");
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

type ParsedBreach = BreachCard & { sort: number; spamList: boolean; sources: string[] };

function toBreach(record: Record<string, unknown>): ParsedBreach | null {
  const title = cleanLine(record.Title, 160) || cleanLine(record.Name, 160);
  if (!title) return null;
  const classes = Array.isArray(record.DataClasses) ? record.DataClasses : [];
  const leaked: string[] = [];
  const sources: string[] = [];
  const seenLabels = new Set<string>();
  for (const item of classes) {
    if (typeof item !== "string") continue;
    const advice = explainDataClass(item);
    sources.push(advice.source);
    if (seenLabels.has(advice.label)) continue;
    seenLabels.add(advice.label);
    leaked.push(advice.label);
  }
  const dated = formatDate(record.BreachDate);
  return {
    title,
    domain: cleanDomain(record.Domain),
    date: dated.label,
    sort: dated.sort,
    leaked: leaked.length > 0 ? leaked : [UNKNOWN_LEAK],
    note: breachNote(record),
    affected: formatAffected(record.PwnCount),
    spamList: record.IsSpamList === true,
    sources,
  };
}

function summaryFor(count: number, commercialOnly: boolean): { summary: string; detail: string } {
  if (commercialOnly) {
    return {
      summary:
        count === 1
          ? "Este correo aparece en una lista de envíos comerciales, no en un robo de cuentas."
          : `Este correo aparece en ${count} listas de envíos comerciales, no en un robo de cuentas.`,
      detail:
        "Quien tenga el correo puede escribirte. Desconfía de los mensajes que no esperabas; no hace falta cambiar contraseñas solo por esto.",
    };
  }
  const noun = count === 1 ? "1 filtración" : `${count} filtraciones`;
  if (count >= MANY) {
    return {
      summary: `Este correo aparece en ${noun}.`,
      detail: `Son ${count} en total. No hace falta mirarlas una a una: te dejo las primeras y el resto, por si quieres verlo.`,
    };
  }
  return {
    summary: `Este correo aparece en ${noun}.`,
    detail: FOUND_DETAIL,
  };
}

// null: la respuesta no se puede enseñar (no es una lista usable).
// Una lista vacía es un resultado real: ninguna filtración.
export function presentBreaches(payload: unknown): CheckView | null {
  if (!Array.isArray(payload)) return null;
  if (payload.length === 0) return noBreachView();

  const limited = payload.slice(0, 300);
  const truncated = payload.length > limited.length;
  let sawObject = false;
  let skippedByPolicy = 0;
  const parsed: ParsedBreach[] = [];
  for (const item of limited) {
    if (!item || typeof item !== "object") continue;
    sawObject = true;
    const record = item as Record<string, unknown>;
    if (record.IsRetired === true || record.IsSensitive === true) {
      skippedByPolicy += 1;
      continue;
    }
    const breach = toBreach(record);
    if (breach) parsed.push(breach);
  }
  if (!sawObject || (parsed.length === 0 && skippedByPolicy === 0)) return null;
  if (parsed.length === 0) return noBreachView();

  parsed.sort((a, b) => b.sort - a.sort || a.title.localeCompare(b.title, "es"));

  const advice: AdviceBlock[] = [];
  const seenAdvice = new Set<string>();
  let serious = false;
  let everySpam = true;
  for (const breach of parsed) {
    if (!breach.spamList) everySpam = false;
    for (const source of breach.sources) {
      const key = source.toLowerCase();
      if (SERIOUS.has(key)) serious = true;
      if (seenAdvice.has(key)) continue;
      seenAdvice.add(key);
      const explained = explainDataClass(source);
      advice.push({
        label: explained.label,
        explanation: explained.explanation,
        recommendation: explained.recommendation,
      });
    }
    if (breach.sources.length === 0 && !seenAdvice.has("")) {
      seenAdvice.add("");
      advice.push({
        label: "Datos no detallados",
        explanation: "La filtración existe, pero no se indica qué campos concretos salieron.",
        recommendation:
          "Cambia la contraseña de ese servicio si aún la usas en algún otro sitio, y desconfía de mensajes que citen su nombre.",
      });
    }
  }

  const commercialOnly = everySpam && !serious;
  const copy = summaryFor(parsed.length, commercialOnly);
  return {
    found: true,
    summary: copy.summary,
    detail: truncated
      ? `${copy.detail} Hay más resultados de los que caben aquí; mostramos 300.`
      : copy.detail,
    footnote: DATE_FOOTNOTE,
    breaches: parsed.map((breach) => ({
      title: breach.title,
      domain: breach.domain,
      date: breach.date,
      leaked: breach.leaked,
      note: breach.note,
      affected: breach.affected,
    })),
    advice,
  };
}
