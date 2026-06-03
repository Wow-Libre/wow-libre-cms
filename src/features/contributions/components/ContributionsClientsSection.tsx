import { wowClients } from "@/constants/wowClients";

export function ContributionsClientsSection() {
  return (
    <section id="download" aria-labelledby="contributions-clients-heading">
      <header className="max-w-3xl text-center sm:mx-auto sm:text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
          Clientes oficiales
        </p>
        <h2
          id="contributions-clients-heading"
          className="font-gaming mt-3 text-3xl font-bold text-white sm:text-4xl"
        >
          Clientes y{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            guías
          </span>
        </h2>
        <p className="mt-3 text-base text-slate-400 sm:text-lg">
          Elige la versión que prefieras y comienza tu aventura en Azeroth.
        </p>
      </header>

      <div className="mt-12 space-y-8 lg:space-y-10">
        {wowClients.map((client, index) => {
          const reverse = client.reverse;
          return (
            <article
              key={client.title}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-[0_20px_45px_rgba(0,0,0,0.3)]"
            >
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-stretch lg:gap-10 xl:gap-14">
                <div
                  className={`flex min-w-0 flex-col justify-center order-2 ${
                    reverse ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={client.icon}
                      />
                    </svg>
                  </span>
                  <h3 className="font-gaming mt-4 text-2xl font-bold text-white sm:text-3xl">
                    {client.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-400">
                    {client.description}
                  </p>
                  <a
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/25 transition hover:from-cyan-500 hover:to-sky-500 sm:text-base"
                  >
                    {client.btnText}
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                </div>

                <div
                  className={`relative order-1 min-h-[240px] w-full sm:min-h-[300px] lg:min-h-[400px] xl:min-h-[460px] ${
                    reverse ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="group h-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={client.image}
                      alt={client.title}
                      className="h-full min-h-[inherit] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
