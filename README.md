# World of Warcraft Community Web CMS

¡Bienvenido a Wow Libre CMS!
Esta es una aplicación web desarrollada para transformar y enriquecer la experiencia de los jugadores de World of Warcraft. No se trata de una simple página de registro o tienda: nuestro objetivo es crear una plataforma dinámica, útil y atractiva para toda la comunidad.

Wow Libre CMS busca ofrecer funcionalidades innovadoras que complementen y mejoren cada aventura en Azeroth.

## 📚 Wiki

Encuentra toda la documentación y guías en nuestro [Wiki oficial](https://github.com/Wow-Libre/wow-libre-cms/wiki).

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Spring Boot, MySQL
- **Autenticación**: Cookies para el manejo de sesiones de usuario
- **API**: Integración con servicios REST para la gestión de cuentas y personajes

## 👥 Comunidad

- Sitio web oficial: www.wowlibre.com
- Únete a nuestro Discord: discord.gg/ZhStUnAbkC

## 🤝 Contribuciones

¿Quieres aportar al proyecto? ¡Nos encantaría contar contigo!

Si tienes ideas, sugerencias o mejoras, no dudes en abrir un issue o enviar un pull request.

Toda participación es bienvenida y valorada por la comunidad.

---

## 📦 Instalación y Configuración

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

- **Node.js** (versión 18 o superior) - [Descargar Node.js](https://nodejs.org/)
- **npm** (viene incluido con Node.js) o **yarn**
- **Git** - [Descargar Git](https://git-scm.com/)

### Paso 1: Clonar el Repositorio

Abre tu terminal y ejecuta el siguiente comando para clonar el repositorio:

```bash
git clone git@github.com:Wow-Libre/wow-libre-cms.git
cd wow-libre-cms
```

Si prefieres descargar el código como archivo ZIP:

1. Ve al repositorio en GitHub
2. Haz clic en el botón verde "Code"
3. Selecciona "Download ZIP"
4. Extrae el archivo ZIP en tu carpeta de trabajo
5. Abre la terminal en la carpeta extraída

### Paso 2: Instalar Dependencias

Una vez que estés en la carpeta del proyecto, instala todas las dependencias necesarias:

```bash
npm install
```

Este proceso puede tardar unos minutos mientras se descargan todas las dependencias del proyecto.

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables de entorno:

```env
# URL base del API Core
NEXT_PUBLIC_BASE_URL_CORE=http://localhost:8080/api

# URL base del API de Transacciones
NEXT_PUBLIC_BASE_URL_TRANSACTION=http://localhost:8080/api/transactions

# Clave API de Google reCAPTCHA
NEXT_PUBLIC_GOOGLE_API_KEY_RE_CAPTCHA=tu_clave_recaptcha_aqui

# Nombre del servidor
NEXT_PUBLIC_SERVER_NAME=Wow Libre

# Logo del servidor (URL o ruta)
NEXT_PUBLIC_SERVER_LOGO=/logo.png
```

**Nota**: Reemplaza los valores de ejemplo con tus propias configuraciones. Si no tienes una clave de reCAPTCHA, puedes obtener una en [Google reCAPTCHA](https://www.google.com/recaptcha/admin).

### Paso 4: Ejecutar la Aplicación en Modo Desarrollo

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

Abre tu navegador y visita esa URL para ver la aplicación en funcionamiento.

El servidor de desarrollo incluye:

- ✅ Recarga automática cuando guardas cambios
- ✅ Mensajes de error detallados
- ✅ Hot Module Replacement (HMR)

### Paso 5: Compilar para Producción

Para crear una versión optimizada de la aplicación:

```bash
npm run build
```

Esto generará una carpeta `.next` con la aplicación compilada y optimizada.

### Paso 6: Ejecutar la Versión de Producción

Después de compilar, puedes ejecutar la versión de producción localmente:

```bash
npm start
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 🐛 Solución de Problemas

### Error: "Module not found"

```bash
# Elimina node_modules y package-lock.json, luego reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

```bash
# Usa otro puerto
PORT=3001 npm run dev
```

### Variables de entorno no funcionan

- Las variables que comienzan con `NEXT_PUBLIC_` son accesibles en el cliente
- Las demás variables solo están disponibles en el servidor
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Compila la aplicación para producción
npm start            # Ejecuta la versión compilada

# Calidad de código
npm run lint         # Ejecuta el linter para encontrar errores
```

---

## 📄 Licencia

Este proyecto es de código abierto. Consulta el archivo LICENSE para más detalles.

---

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la [Wiki del proyecto](https://github.com/ManuChitiva/wow-libre-cms/wiki)
2. Abre un [issue en GitHub](https://github.com/ManuChitiva/wow-libre-cms/issues)
3. Únete a nuestro [Discord](https://discord.gg/ZhStUnAbkC)

---

¡Gracias por usar Wow Libre CMS! 🎮✨
