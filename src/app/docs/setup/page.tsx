"use client";

import { getSubscriptionActive } from "@/api/subscriptions";
import NavbarMinimalist from "@/components/navbar-minimalist";
import { useUserContext } from "@/context/UserContext";
import { Source_Sans_3 } from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBook,
  FaBox,
  FaCheckCircle,
  FaChevronRight,
  FaDatabase,
  FaDiscord,
  FaDownload,
  FaFileCode,
  FaGlobe,
  FaLayerGroup,
  FaLock,
  FaServer,
  FaTerminal,
  FaBolt,
} from "react-icons/fa";

const DISCORD_INVITE_URL = "https://discord.gg/xNcAfTAJRR";
const DOWNLOAD_EXE_URL = "https://www.mediafire.com/file/9gql7cyvwfgbysi/output.rar/file";
const DOWNLOAD_SCRIPT_PLATFORM_URL = "https://raw.githubusercontent.com/Wow-Libre/wow-core/master/src/main/resources/static/scripts/scripts.sql";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const StepCard: React.FC<{
  step: number;
  title: string;
  children: React.ReactNode;
}> = ({ step, title, children }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 shadow-xl shadow-black/20 transition-all duration-300 hover:border-slate-600 hover:shadow-2xl hover:shadow-blue-500/5">
    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500/80 to-cyan-500/50 opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="p-6 pl-7 sm:p-8 sm:pl-9">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-500/20 text-lg font-bold text-blue-300 ring-1 ring-blue-500/30">
          {step}
        </span>
        <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h3>
      </div>
      <div className="prose prose-invert prose-slate max-w-none text-slate-300 prose-p:leading-[1.7] prose-p:tracking-[0.01em] prose-code:rounded-md prose-code:bg-slate-700/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-amber-200/90 prose-code:before:content-none prose-code:after:content-none prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 hover:prose-a:underline prose-li:leading-[1.7]">
        {children}
      </div>
    </div>
  </article>
);

const CodeBlock: React.FC<{
  children: string;
  label?: string;
}> = ({ children, label }) => (
  <div className="my-4 overflow-hidden rounded-xl border border-slate-600/70 bg-slate-950/95 shadow-inner">
    {label && (
      <div className="flex items-center gap-2 border-b border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
        {label}
      </div>
    )}
    <pre className="overflow-x-auto p-4 text-sm leading-[1.6] text-slate-200 sm:p-5 sm:text-base">
      <code className="font-mono">{children}</code>
    </pre>
  </div>
);

const SectionTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <header className="mb-10">
    <div className="mb-3 flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 ring-1 ring-amber-500/20">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
    </div>
    {subtitle && (
      <p className="ml-[4.25rem] text-slate-400 sm:ml-[4.5rem]">{subtitle}</p>
    )}
    <div className="mt-4 h-px w-24 bg-gradient-to-r from-amber-500/40 to-transparent" />
  </header>
);

const DOC_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
] as const;

export default function DocsSetupPage() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUserContext();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [supportLoading, setSupportLoading] = useState(true);

  const currentLang = (i18n.language?.slice(0, 2) ?? "en") as "es" | "en" | "pt";

  const handleChangeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    if (user?.logged_in) {
      setUser((prev) => (prev ? { ...prev, language: code } : prev));
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    const check = async () => {
      if (!token || !user?.logged_in) {
        setHasActiveSubscription(false);
      } else {
        try {
          const active = await getSubscriptionActive(token);
          setHasActiveSubscription(active);
        } catch {
          setHasActiveSubscription(false);
        }
      }
      setSupportLoading(false);
    };
    check();
  }, [user?.logged_in]);

  const canJoinDiscord = hasActiveSubscription && user?.logged_in;

  return (
    <div className={`${sourceSans.className} min-h-screen bg-[#070b12] antialiased`}>
      <div className="contenedor">
        <NavbarMinimalist />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-[#070b12]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 shadow-lg shadow-blue-500/5">
            <FaBook className="h-4 w-4" />
            {t("docs.setup.badge", "Documentación")}
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            {t("docs.setup.title", "Cómo levantar Wow Libre")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-[1.65] text-slate-400">
            {t(
              "docs.setup.subtitle",
              "Guía paso a paso para instalar y ejecutar toda la solución: backend Core, Realm y frontend CMS en Linux o Windows."
            )}
          </p>
          {/* Selector de idioma */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
              {t("docs.setup.language", "Idioma")}
            </span>
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-slate-600/70 bg-slate-800/50 p-1 shadow-inner ring-1 ring-slate-700/50">
              {DOC_LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleChangeLanguage(code)}
                  className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    currentLang === code
                      ? "bg-blue-500/25 text-blue-300 shadow-sm ring-1 ring-blue-500/40"
                      : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
                  }`}
                  aria-pressed={currentLang === code}
                  aria-label={label}
                >
                  {currentLang === code && (
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-blue-500/10 to-transparent" />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12">
        {/* Arquitectura */}
        <section className="mb-24">
          <SectionTitle
            icon={<FaLayerGroup className="h-7 w-7" />}
            title={t("docs.setup.architecture.title", "Arquitectura de la solución")}
            subtitle={t(
              "docs.setup.architecture.subtitle",
              "Tres proyectos que debes tener en marcha en este orden."
            )}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: <FaServer className="h-6 w-6" />,
                name: "wow-core",
                color: "amber",
                port: "8091",
                desc: "API central: autenticación, usuarios, realms, préstamos, noticias. Java 21, Spring Boot, MySQL.",
              },
              {
                icon: <FaDatabase className="h-6 w-6" />,
                name: "wow-libre-realm",
                color: "emerald",
                port: "8090",
                desc: "Cliente por reino: conecta con el emulador (AzerothCore/TrinityCore) vía SOAP. Java 17, Spring Boot.",
              },
              {
                icon: <FaGlobe className="h-6 w-6" />,
                name: "wow-libre-cms",
                color: "blue",
                port: "3000",
                desc: "Frontend: sitio web, registro, tienda, perfiles. Next.js, React.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex flex-col rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      item.color === "amber"
                        ? "bg-amber-500/20 text-amber-400"
                        : item.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="rounded-lg bg-slate-700/80 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
                    :{item.port}
                  </span>
                </div>
                <h3 className="mb-2 font-bold text-white">{item.name}</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Requisitos previos */}
        <section className="mb-24">
          <SectionTitle
            icon={<FaBolt className="h-7 w-7" />}
            title={t("docs.setup.prereq.title", "Requisitos previos")}
          />
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 shadow-xl sm:p-8">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-slate-300"><strong className="text-white">Linux:</strong> Docker + Docker Compose; Node.js 18+ solo para el CMS. MySQL y las apps Java van en contenedores.</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-slate-300"><strong className="text-white">Windows:</strong> Java 21, Java 17, Node.js 18+, MySQL 8+, Git (o los launchers .exe para Core y Realm).</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-slate-300"><strong className="text-white">Node.js 18+</strong> — para wow-libre-cms (npm o yarn).</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-slate-300"><strong className="text-white">MySQL 8.0+</strong> — base de datos (platform para core; acore_auth, acore_characters, acore_world para el emulador/realm).</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-slate-300"><strong className="text-white">Git</strong> — para clonar los repositorios.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Linux */}
        <section className="mb-24" id="linux">
          <SectionTitle
            icon={<FaTerminal className="h-7 w-7" />}
            title={t("docs.setup.linux.title", "Instalación en Linux con Docker")}
            subtitle={t(
              "docs.setup.linux.subtitle",
              "Docker Compose levanta MySQL, wow-core y wow-libre-realm. El frontend (CMS) se ejecuta en el host."
            )}
          />

          <div className="space-y-10">
            <StepCard step={1} title="Instalar Docker y Docker Compose">
              <p className="mb-4">
                En Ubuntu/Debian instala Docker Engine y el plugin Compose. Para el CMS necesitarás también Node.js 18+ en el host.
              </p>
              <CodeBlock label="Terminal">
                {`# Docker oficial
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture)] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar
docker --version
docker compose version`}
              </CodeBlock>
              <p className="mt-3 text-sm text-slate-400">
                Para Node.js (solo para el CMS):{" "}
                <code>curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs</code>
              </p>
            </StepCard>

            <StepCard step={2} title="Crear el proyecto y el docker-compose.yml">
              <p className="mb-4">
                Crea una carpeta (por ejemplo <code>wow-libre</code>) y guarda un <code>docker-compose.yml</code> con la solución completa: MySQL, wow-core, wow-libre-realm y opcionalmente Nginx.
              </p>
              <CodeBlock label="docker-compose.yml">
                {`services:
  wow-libre-core:
    image: wowlibre96/wow-libre-core:latest
    ports:
      - "8091:8091"
    mem_limit: 868m
    networks:
      - app-network
    env_file:
      - ./.env

  wow-libre-realm:
    image: wowlibre96/wow-libre-realm:latest
    ports:
      - "8090:8090"
    mem_limit: 768m
    networks:
      - app-network
    extra_hosts:
      - "host.docker.internal:host-gateway"
    env_file:
      - ./.env

  mysql:
    image: mysql:8.0
    container_name: mysql
    restart: always
    mem_limit: 1g
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: platform
      MYSQL_USER: tuUser
      MYSQL_PASSWORD: tuclave
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:`}
              </CodeBlock>
              <p className="mt-3 text-sm text-slate-400">
                El puerto 3307 en el host evita conflictos con un MySQL local. <code>host.docker.internal</code> permite al realm conectar al SOAP del emulador en tu máquina.
              </p>
            </StepCard>

            <StepCard step={3} title="Crear y configurar el archivo .env">
              <p className="mb-4">
                El archivo <code>.env</code> guarda las variables de entorno que usan <strong>wow-core</strong> y <strong>wow-libre-realm</strong>. Debe estar en la <strong>misma carpeta</strong> que el <code>docker-compose.yml</code>, sin extensión (el nombre del archivo es exactamente <code>.env</code>).
              </p>
              <p className="mb-4 text-slate-300">
                <strong>Cómo crearlo:</strong> En Linux/Mac crea el archivo con <code>touch .env</code> o desde tu editor. Si clonaste el repo de wow-core, puedes copiar <code>.env.example</code> a <code>.env</code> con <code>cp .env.example .env</code> y luego editar los valores. En Windows crea un archivo de texto y renómbralo a <code>.env</code> (asegúrate de que no quede como <code>.env.txt</code>).
              </p>
              <p className="mb-2 text-slate-300">
                Debe incluir <strong>dos bloques</strong>: uno con las variables de wow-core (base de datos <code>platform</code>, JWT, email, reCAPTCHA, etc.; ver <code>.env.example</code> en el repo wow-core) y otro con las de wow-libre-realm (URLs JDBC de las bases del emulador, SOAP, JWT). Ambos servicios pueden usar el mismo <code>.env</code>. Ejemplo cuando MySQL corre en Docker (hostname <code>mysql</code>):
              </p>
              <CodeBlock label=".env (ejemplo)">
                {`# Wow-Core (ver .env.example en el repo wow-core)
DB_CORE_URL=jdbc:mysql://mysql:3306/platform
DB_CORE_USERNAME=tuUser
DB_CORE_PASSWORD=tuclave
CORE_SERVER_PORT=8091
HOST_DOMAIN=http://localhost:3000
CORE_JWT_SECRET_KEY=tu_clave_secreta_jwt
# ... resto (CORE_GOOGLE_*, GOOGLE_API_SECRET, etc.)

# Wow-Libre-Realm (ver README del repo wow-libre-realm)
DB_WOW_CLIENT_HOST_AUTH=jdbc:mysql://mysql:3306/acore_auth
DB_WOW_CLIENT_HOST_CHARACTERS=jdbc:mysql://mysql:3306/acore_characters
DB_WOW_CLIENT_HOST_WORLD=jdbc:mysql://mysql:3306/acore_world
DB_WOW_CLIENT_USERNAME=tuUser
DB_WOW_CLIENT_PASSWORD=tuclave
WOW_CLIENT_SERVER_PORT=8090
HOST_BASE_CORE=http://wow-libre-core:8091
WOW_CLIENT_SOAP_URI=http://host.docker.internal:7878
WOW_CLIENT_SOAP_GM_USERNAME=admin
WOW_CLIENT_SOAP_GM_PASSWORD=tu_password_gm
WOW_CLIENT_SECRET_JWT=tu_jwt_secret_realm`}
              </CodeBlock>
              <p className="mt-3 text-sm text-slate-400">
                Las bases <code>acore_auth</code>, <code>acore_characters</code> y <code>acore_world</code> las crea el emulador (AzerothCore/TrinityCore). La base <code>platform</code> la crea el compose; en el siguiente paso cargarás el script SQL de wow-core para crear sus tablas.
              </p>
            </StepCard>

            <StepCard step={4} title="Iniciar los contenedores y cargar el esquema de Core">
              <p className="mb-4">
                Levanta la pila con <code>docker compose up -d</code>. La primera vez debes cargar el script SQL de wow-core en la base <code>platform</code> para crear las tablas de la plataforma. Puedes descargar el script desde el repo oficial:
              </p>
              <a
                href={DOWNLOAD_SCRIPT_PLATFORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/15 px-5 py-3 text-base font-semibold text-blue-400 transition-colors hover:bg-blue-500/25"
              >
                <FaDownload className="h-5 w-5" />
                {t("docs.setup.download-sql-platform", "Descargar Script .sql platform")}
              </a>
              <p className="mb-2 text-slate-300">Guarda el archivo y ejecuta (ajusta la ruta al archivo descargado):</p>
              <CodeBlock label="Terminal">
                {`docker compose up -d

# Esperar a que MySQL esté listo (~30 s), luego:
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword platform < scripts.sql`}
              </CodeBlock>
              <p className="mt-4 font-semibold text-white">Scripts SQL para wow-libre-realm (emulador)</p>
              <p className="mb-3 text-sm text-slate-400">
                Estos scripts se ejecutan sobre las bases del <strong>emulador</strong> (acore_auth, acore_characters). Ejecútalos en el orden que tenga sentido para tu esquema; ajusta tipos si tu emulador ya tiene cambios.
              </p>
              <CodeBlock label="acore_auth — enlace cuenta y tabla client">
                {`-- Enlace cuenta ↔ usuario de la app
ALTER TABLE acore_auth.account ADD COLUMN user_id bigint;

-- Clientes de la aplicación (admin, integraciones)
CREATE TABLE acore_auth.client (
    id              bigint AUTO_INCREMENT NOT NULL,
    username        varchar(50) NOT NULL,
    password        text NOT NULL,
    status          boolean NOT NULL,
    rol             varchar(50) NOT NULL,
    jwt             text,
    refresh_token   text,
    expiration_date date,
    PRIMARY KEY (id),
    CONSTRAINT client_username_uq UNIQUE (username)
);`}
              </CodeBlock>
              <CodeBlock label="acore_characters — guild y character_transaction">
                {`-- Gremios: campos extra
ALTER TABLE acore_characters.guild
    ADD COLUMN public_access boolean,
    ADD COLUMN discord       text,
    ADD COLUMN multi_faction boolean;

-- Historial de transacciones por personaje
CREATE TABLE acore_characters.character_transaction (
    id               bigint auto_increment NOT NULL,
    character_id     bigint NOT NULL,
    account_id       bigint NOT NULL,
    user_id          bigint NOT NULL,
    amount           bigint NOT NULL,
    command          text,
    successful       boolean NOT NULL,
    transaction_id   text,
    indebtedness     boolean NOT NULL,
    transaction_date date NOT NULL,
    reference        varchar(50) NOT NULL,
    status           boolean NOT NULL,
    transaction_type varchar(60) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT character_transaction_reference_uq UNIQUE (reference)
);`}
              </CodeBlock>
              <CodeBlock label="acore_auth — server_publications (opcional)">
                {`CREATE TABLE acore_auth.server_publications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    img         text NOT NULL,
    title       VARCHAR(80) NOT NULL,
    description TEXT NOT NULL
);`}
              </CodeBlock>
              <p className="mt-3 text-slate-400">
                Comprueba Core: <code>curl http://localhost:8091/core/actuator/health</code> y Realm: <code>http://localhost:8090</code> (o Swagger según el repo).
              </p>
            </StepCard>

            <StepCard step={5} title="(Opcional) Nginx como puerta de enlace">
              <p className="mb-4">
                Para producción puedes añadir el servicio <code>nginx</code> al <code>docker-compose.yml</code> y exponer un único dominio (por ejemplo <code>api.tudominio.com</code>) con <code>/core/</code> → wow-core y <code>/realm/</code> → wow-libre-realm. La configuración de ejemplo está en el README de{" "}
                <a href="https://github.com/Wow-Libre/wow-libre-realm" target="_blank" rel="noopener noreferrer">
                  wow-libre-realm
                </a>.
              </p>
              <p className="text-slate-400">
                En desarrollo puedes usar directamente los puertos 8091 y 8090 sin Nginx.
              </p>
            </StepCard>

            <StepCard step={6} title="Ejecutar wow-libre-cms (frontend) en el host">
              <p className="mb-4">
                El CMS es una app Next.js. En desarrollo se ejecuta en el host con Node.js y debe apuntar al Core (por ejemplo <code>http://localhost:8091/core</code>). Crea un archivo <code>.env.local</code> en la raíz del proyecto con las siguientes variables:
              </p>
              <p className="mb-2 font-semibold text-white">Variables de entorno del CMS (.env.local)</p>
              <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-slate-300">
                <li><code className="rounded bg-slate-700/80 px-1 py-0.5">NEXT_PUBLIC_BASE_URL_CORE</code> — URL base del API Core (desarrollo: <code className="rounded bg-slate-700/80 px-1 py-0.5">http://localhost:8091/core</code>; producción: tu dominio, ej. <code className="rounded bg-slate-700/80 px-1 py-0.5">https://api.tudominio.com/core</code>).</li>
                <li><code className="rounded bg-slate-700/80 px-1 py-0.5">NEXT_PUBLIC_GOOGLE_API_KEY_RE_CAPTCHA</code> — Clave de sitio de Google reCAPTCHA v2 (obtener en <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">google.com/recaptcha/admin</a>).</li>
                <li><code className="rounded bg-slate-700/80 px-1 py-0.5">NEXT_PUBLIC_SERVER_NAME</code> — Nombre del servidor que se muestra en la web (ej. &quot;Wow Libre&quot;).</li>
                <li><code className="rounded bg-slate-700/80 px-1 py-0.5">NEXT_PUBLIC_SERVER_LOGO</code> — Ruta o URL del logo (ej. <code className="rounded bg-slate-700/80 px-1 py-0.5">/logo.png</code>).</li>
                <li><code className="rounded bg-slate-700/80 px-1 py-0.5">NEXT_PUBLIC_BASE_URL</code> — (Opcional, producción.) URL pública del sitio CMS (ej. <code className="rounded bg-slate-700/80 px-1 py-0.5">https://wowlibre.com</code>) para meta tags y enlaces.</li>
              </ul>
              <CodeBlock label=".env.local (ejemplo)">
                {`NEXT_PUBLIC_BASE_URL_CORE=http://localhost:8091/core
NEXT_PUBLIC_GOOGLE_API_KEY_RE_CAPTCHA=tu_clave_recaptcha
NEXT_PUBLIC_SERVER_NAME=Wow Libre
NEXT_PUBLIC_SERVER_LOGO=/logo.png
# Producción:
# NEXT_PUBLIC_BASE_URL=https://tudominio.com`}
              </CodeBlock>
              <CodeBlock label="Terminal">
                {`git clone https://github.com/Wow-Libre/wow-libre-cms.git
cd wow-libre-cms
npm install
# Crear .env.local con las variables de arriba
npm run dev`}
              </CodeBlock>
              <p className="mt-4 font-semibold text-white">Producción con Vercel</p>
              <p className="mb-2 text-slate-300">
                Para desplegar el CMS en producción puedes usar <strong>Vercel</strong> (optimizado para Next.js). Conecta tu repositorio de GitHub/GitLab en <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">vercel.com</a>, configura el proyecto y en <strong>Settings → Environment Variables</strong> añade las mismas variables (<code>NEXT_PUBLIC_BASE_URL_CORE</code>, <code>NEXT_PUBLIC_GOOGLE_API_KEY_RE_CAPTCHA</code>, <code>NEXT_PUBLIC_SERVER_NAME</code>, <code>NEXT_PUBLIC_SERVER_LOGO</code>, <code>NEXT_PUBLIC_BASE_URL</code>) con los valores de producción. Cada push a la rama principal puede desplegar automáticamente.
              </p>
              <p className="text-slate-400">
                Abre <strong className="text-white">http://localhost:3000</strong> en desarrollo.
              </p>
            </StepCard>
          </div>
        </section>

        {/* Windows */}
        <section className="mb-24" id="windows">
          <SectionTitle
            icon={<FaBox className="h-7 w-7" />}
            title={t("docs.setup.windows.title", "Instalación en Windows")}
            subtitle={t("docs.setup.windows.subtitle", "Usando los launchers .exe para las aplicaciones Java.")}
          />

          <div className="space-y-10">
            <StepCard step={1} title="Instalar dependencias">
              <ul className="list-inside list-disc space-y-2 text-slate-300">
                <li><strong className="text-white">Java 21</strong> y <strong className="text-white">Java 17</strong> — descarga desde Oracle o Adoptium; configura JAVA_HOME si es necesario.</li>
                <li><strong className="text-white">Node.js 18+</strong> — desde nodejs.org; incluye npm.</li>
                <li><strong className="text-white">MySQL 8</strong> — instalar y crear la base <code>platform</code> y ejecutar el script SQL de wow-core.</li>
                <li><strong className="text-white">Git</strong> — para clonar repositorios.</li>
              </ul>
            </StepCard>

            <StepCard step={2} title="Base de datos y wow-core">
              <p className="mb-4">
                Crea la base de datos <code>platform</code> en MySQL y ejecuta el script SQL de wow-core para crear las tablas. Descarga los instaladores .exe (wow-core y wow-libre-realm) y luego instala wow-core con su launcher.
              </p>
              <div className="mb-4 flex flex-wrap gap-3">
                <a
                  href={DOWNLOAD_SCRIPT_PLATFORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/15 px-5 py-3 text-base font-semibold text-blue-400 transition-colors hover:bg-blue-500/25"
                >
                  <FaDownload className="h-5 w-5" />
                  {t("docs.setup.download-sql-platform", "Descargar Script .sql platform")}
                </a>
                <a
                  href={DOWNLOAD_EXE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-5 py-3 text-base font-semibold text-amber-400 transition-colors hover:bg-amber-500/25"
                >
                  <FaDownload className="h-5 w-5" />
                  {t("docs.setup.download-exe-windows", "Descargar instaladores (.exe)")}
                </a>
              </div>
              <p className="mb-2 text-sm text-slate-400">
                {t("docs.setup.download-exe-windows-hint", "El archivo incluye los launchers de wow-core y wow-libre-realm. Extrae el .rar y ejecuta cada instalador.")}
              </p>
              <p className="text-slate-300">
                {t("docs.setup.windows-exe-core-note", "No hace falta configurar un archivo .env a mano: el instalador .exe (creado con el .iss) guía la instalación y pide durante el proceso los datos necesarios (base de datos, JWT, etc.). Crea y escribe la configuración por ti.")}
              </p>
            </StepCard>

            <StepCard step={3} title="wow-libre-realm en Windows">
              <p className="mb-4">
                Usa el instalador de wow-libre-realm incluido en el archivo que descargaste en el paso anterior. Igual que con wow-core, el instalador (preparado con el .iss) te pide en la instalación los datos necesarios (MySQL, SOAP, etc.) y genera la configuración; no tienes que editar <code>.env</code> ni <code>application.yml</code> a mano.
              </p>
              <p className="text-slate-400">
                Ejecuta el .exe de wow-libre-realm y sigue el asistente; tendrás que indicar conexión a MySQL (acore_auth, acore_characters, acore_world) y la URI SOAP del emulador (puerto 7878 por defecto).
              </p>
            </StepCard>

            <StepCard step={4} title="wow-libre-cms en Windows">
              <p className="mb-4">Abre PowerShell o CMD en la carpeta del proyecto CMS.</p>
              <CodeBlock label="PowerShell / CMD">
                {`git clone https://github.com/Wow-Libre/wow-libre-cms.git
cd wow-libre-cms
npm install
# Crear .env.local con NEXT_PUBLIC_BASE_URL_CORE=http://localhost:8091/core
npm run dev`}
              </CodeBlock>
              <p className="mt-3 text-slate-400">
                Abre <strong className="text-white">http://localhost:3000</strong>.
              </p>
            </StepCard>
          </div>
        </section>

        {/* Orden de arranque */}
        <section className="mb-24">
          <SectionTitle
            icon={<FaCheckCircle className="h-7 w-7" />}
            title={t("docs.setup.order.title", "Orden de arranque y verificación")}
          />
          <div className="relative rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 shadow-xl sm:p-8">
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/50 via-slate-600 to-transparent" />
            <ol className="relative space-y-6 pl-12">
              {[
                { name: "MySQL", detail: "Debe estar corriendo con las bases creadas." },
                { name: "wow-core", detail: "Primero; el CMS y el realm dependen de su API. Health: http://localhost:8091/core/actuator/health" },
                { name: "wow-libre-realm", detail: "Después; conecta emulador y core. Swagger: http://localhost:8090/swagger-ui.html" },
                { name: "wow-libre-cms", detail: "Por último; http://localhost:3000" },
              ].map((item, i) => (
                <li key={i} className="relative flex flex-col gap-1">
                  <span className="absolute -left-[2.15rem] flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400 ring-2 ring-slate-800">
                    {i + 1}
                  </span>
                  <strong className="text-white">{item.name}</strong>
                  <span className="text-sm text-slate-400">{item.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Enlaces */}
        <section className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 shadow-xl sm:p-8">
          <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <FaFileCode className="h-5 w-5" />
            </div>
            {t("docs.setup.links.title", "Repositorios y documentación")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-1">
            {[
              { href: "https://github.com/Wow-Libre/wow-core", label: "wow-core" },
              { href: "https://github.com/Wow-Libre/wow-libre-realm", label: "wow-libre-realm" },
              { href: "https://github.com/Wow-Libre/wow-libre-cms", label: "wow-libre-cms" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-600/60 bg-slate-800/50 px-5 py-4 text-white transition-all hover:border-blue-500/40 hover:bg-slate-700/50 hover:shadow-lg"
                >
                  <span className="font-semibold">{link.label}</span>
                  <FaChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Modal Soporte Premium / Discord */}
        {!supportLoading && (
          <section className="mt-16 pb-12">
            <div
              className={`relative overflow-hidden rounded-2xl border-2 shadow-2xl transition-all duration-300 ${
                canJoinDiscord
                  ? "border-indigo-500/50 bg-gradient-to-br from-indigo-950/60 via-slate-900/95 to-slate-900"
                  : "border-slate-600/60 bg-slate-800/60 opacity-90"
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent)]" />
              <div className="relative flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                    canJoinDiscord
                      ? "bg-indigo-500/25 text-indigo-400 ring-2 ring-indigo-500/40"
                      : "bg-slate-600/50 text-slate-500"
                  }`}
                >
                  <FaDiscord className="h-9 w-9" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white sm:text-2xl">
                  {t("docs.setup.support.title", "¿Necesitas soporte profesional?")}
                </h3>
                <p className="mb-6 max-w-md text-slate-300">
                  {canJoinDiscord
                    ? t("docs.setup.support.subtitle-active", "Únete a nuestro Discord y accede al canal de soporte Premium para ayuda con la instalación y la plataforma.")
                    : t("docs.setup.support.subtitle-locked", "El acceso al soporte Premium en Discord está reservado a suscriptores. Suscríbete para desbloquear este beneficio y recibir ayuda directa del equipo.")}
                </p>
                {canJoinDiscord ? (
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-xl bg-indigo-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
                  >
                    <FaDiscord className="h-6 w-6" />
                    {t("docs.setup.support.join-discord", "Unirse a Discord")}
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
                    <span className="inline-flex items-center gap-2.5 rounded-xl border border-slate-500/60 bg-slate-700/50 px-5 py-3 text-slate-400 cursor-not-allowed text-base">
                      <FaLock className="h-5 w-5 shrink-0" />
                      {t("docs.setup.support.locked", "Solo suscriptores")}
                    </span>
                    <Link
                      href="/subscriptions"
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-amber-500 px-6 py-4 text-lg font-semibold text-amber-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/35 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      {t("docs.setup.support.view-plans", "Ver planes y suscribirse")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
