/*
  addonsAvailable: Lista de objetos que representan addons disponibles para mostrar en tarjetas.

  Cada objeto debe tener las siguientes propiedades:
  - image: URL de la imagen representativa del addon.
  - CardTitle: Título que se mostrará en la tarjeta.
  - titleHref: Enlace al que redirige el título.
  - btnHref: Enlace que usará el botón.
  - CardDescription: Descripción corta del addon.
  - Button: Texto que se mostrará en el botón de acción.

  Si tienes dudas sobre cómo agregar o modificar addons,
  visita la wiki: https://github.com/ManuChitiva/wow-libre-web/wiki/Agregar-m%C3%A1s-addons-para-descargar
*/
export const addonsAvailable = [
  {
    image:
      "https://static.wixstatic.com/media/5dd8a0_b69726c7d7ef445a943e37c1e7446318~mv2.png",
    CardTitle: "Wow Libre App",
    titleHref:
      "https://www.mediafire.com/file/o2u3wl0nceof8rw/app-release.apk/file",
    btnHref:
      "https://www.mediafire.com/file/o2u3wl0nceof8rw/app-release.apk/file",
    CardDescription:
      "Descarga la app de Wow Libre para tu dispositivo móvil. Puedes obtener información sobre el servidor, como los horarios de los eventos, los horarios de los raids, etc.",
    Button: "No disponible",
  },
  {
    image:
      "https://cl2.buscafs.com/www.levelup.com/public/uploads/images/841103/841103.jpg",
    CardTitle: "Mas addons",
    titleHref: "https://www.curseforge.com/wow",
    btnHref: "https://www.curseforge.com/wow",
    CardDescription:
      "Busca y descarga más addons desde la página oficial de CurseForge.",
    Button: "Ir a CurseForge",
  },
  {
    image:
      "https://static.wixstatic.com/media/5dd8a0_da6263b84a52419eb22d7c22714a8ce8~mv2.png",
    CardTitle: "@WowLibre_bot",
    titleHref: "https://t.me/WowLibre_bot",
    btnHref: "https://t.me/WowLibre_bot",
    CardDescription:
      "Chat con el bot de Wow Libre. Puedes obtener información sobre el servidor, como los horarios de los eventos, los horarios de los raids, etc.",
    Button: "Chat con el bot",
  },
];
