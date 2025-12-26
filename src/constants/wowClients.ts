/*
  wowClients: Lista de versiones del cliente de World of Warcraft disponibles para descargar.

  Cada objeto representa un cliente y debe contener:
  - title: Nombre y versión del cliente (ej. "Vanilla 1.12.1").
  - description: Breve explicación o uso del cliente.
  - icon: SVG path para mostrar un ícono representativo.
  - image: URL de una imagen promocional del cliente.
  - reverse: Booleano para alternar el diseño (true para invertir la disposición de imagen/texto).
  - url: Enlace directo para descargar el cliente.
  - btnText: Texto que aparecerá en el botón de descarga.

  Si deseas agregar o editar clientes disponibles para descarga,
  visita la wiki: https://github.com/ManuChitiva/wow-libre-web/wiki/Agregar-m%C3%A1s-clientes-para-descargar
*/

export const wowClients = [
    {
      title: "World of Warcraft - Tradicional",
      description:
        "Revive la experiencia clásica con la versión 3.3.5a. ¡Explora Azeroth como en los viejos tiempos!",
      icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
      image:
        "https://wow.zamimg.com/uploads/blog/images/23049-the-burning-crusade-classic-beta-account-flagging-has-begun-check-your-battle.jpg",
      reverse: true,
      url: "https://cdn.wowlatinoamerica.com/wla335_win.tar.gz",
      btnText: "Descargar Juego",
    },
    {
      title: "World of Warcraft - HD",
      description:
        "Disfruta de gráficos mejorados sin perder la esencia clásica de WoW 3.3.5a.",
      icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
      image: "https://i.imgur.com/8ae3ihU.png",
      reverse: false,
      url: "https://drive.usercontent.google.com/download?id=1jH5dirVKluY_L1kJwNicCd2A0ccjSvec&export=download&authuser=0",
      btnText: "Descargar Juego",
    }
  ];