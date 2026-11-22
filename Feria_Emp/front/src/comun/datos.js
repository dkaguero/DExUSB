// Datos de la feria que usan los widgets. Hoy son los de muestra; en la
// fase 6 llegarán de la hoja pública «Feria CESEG – público» con esta misma
// forma. No hay datos personales: solo lo que la empresa publica en su stand.
(function (FE) {
  "use strict";

  FE.DATOS = {
    edicion: {
      nombre: "Feria de Empleo USB",
      // Fechas por definir: se configuran en la hoja de la feria.
      fechas: null
    },

    // Planes del proyecto original (demo-edition-seed.ts y decisiones del 2026-10-31).
    planes: [
      {
        id: "platinum", nombre: "Platinum", precio: 250, desde: 1, hasta: 5, forma: "Isla con tótem",
        beneficios: ["Vacantes sin límite", "Acceso a toda la base de CV que autorizó compartirlo", "Analítica completa",
          "Charla garantizada en el auditorio", "Ubicación junto al pórtico CESEG"]
      },
      {
        id: "gold", nombre: "Gold", precio: 200, desde: 6, hasta: 10, forma: "Esquina con pantalla",
        beneficios: ["Hasta 10 vacantes", "CV de quienes lo comparten con la empresa", "Analítica básica",
          "Charla en el auditorio, a solicitud", "Destacado en el directorio"]
      },
      {
        id: "silver", nombre: "Silver", precio: 150, desde: 11, hasta: 15, forma: "Stand de pared",
        beneficios: ["Hasta 3 vacantes", "CV de quienes lo comparten con la empresa", "Analítica básica"]
      }
    ],

    // Pabellones de muestra del proyecto original: 15 posiciones cada uno.
    pabellones: [
      { slug: "tecnologia", nombre: "Tecnología", sector: "Tecnología", color: "#00aaff", posiciones: 15 },
      { slug: "salud", nombre: "Salud", sector: "Salud", color: "#e5484d", posiciones: 15 },
      { slug: "ingenieria", nombre: "Ingeniería", sector: "Ingeniería", color: "#f5a524", posiciones: 15 },
      { slug: "negocios", nombre: "Negocios", sector: "Negocios", color: "#4caf50", posiciones: 15 }
    ],

    // Stands aprobados y con pago confirmado. Vacío hasta que las empresas se registren.
    stands: [],

    // Charlas aprobadas del auditorio: { titulo, empresa, inicio (ISO, hora de
    // Caracas), duracion (min), youtube }. Vacío hasta que haya agenda.
    charlas: [],

    // Accesos del pórtico CESEG y enlaces del sitio. null = aún no existe:
    // el botón se muestra como «Disponible pronto».
    enlaces: {
      sitio: "https://sites.google.com/usb.ve/dex-ceseg",
      egresados: "https://sites.google.com/usb.ve/dex-ceseg/egresados",
      emprendimiento: "https://sites.google.com/usb.ve/dex-ceseg/emprendimiento",
      contacto: "https://sites.google.com/usb.ve/dex-ceseg/contacto",
      auditorio: null,
      calendario: null,
      youtubeCanal: null,
      registroEmpresa: null,
      vacante: null,
      // Receptor de visitas (aplicación web de Apps Script). La hoja puede reemplazarlo con url_receptor.
      receptor: "https://script.google.com/macros/s/AKfycbzVu0xC7OyauBRiB0a8jxt3gXd3y5mOc05VMyTjyo2yBCJirUBsZQvbFfd_X4OCz5ds/exec",
      perfilPostulante: null,
      postular: null,
      compartirCv: null
    }
  };

  // Ficha de ejemplo: muestra a las empresas cómo se verá su stand. No es una empresa real.
  FE.EJEMPLO = {
    ejemplo: true,
    empresa: "Tu empresa aquí",
    color: "#0055a5",
    descripcion: "Así se verá tu stand: la descripción de la empresa, su video, sus fotos, sus redes y sus vacantes. " +
      "Los visitantes pueden compartir su CV, postular a cada vacante y escribirte por WhatsApp.",
    video: "https://www.youtube.com/",
    web: "https://www.usb.ve",
    redes: [
      { red: "Instagram", url: "https://www.instagram.com/" },
      { red: "LinkedIn", url: "https://www.linkedin.com/" },
      { red: "Facebook", url: "https://www.facebook.com/" }
    ],
    whatsapp: "584120000000",
    whatsappMensaje: "Hola, los vi en la Feria de Empleo USB.",
    folleto: "#",
    sala: "https://meet.google.com/",
    galeria: [205, 35, 145, 285, 0, 175],
    vacantes: [
      { titulo: "Pasante de desarrollo de software", modalidad: "Híbrida", contrato: "Pasantía" },
      { titulo: "Analista de datos", modalidad: "Remota", contrato: "Tiempo completo" }
    ]
  };
}(window.FE = window.FE || {}));
