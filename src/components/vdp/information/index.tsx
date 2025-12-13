import React from "react";

interface ServerInformationVdpProps {
  isSubscribed: boolean;
  t: (key: string, options?: any) => string;
}

const ServerInformationVdp: React.FC<ServerInformationVdpProps> = ({
  isSubscribed,
  t,
}) => {
  return (
    <section className="group relative mt-10 overflow-hidden bg-[url(https://static.wixstatic.com/media/5dd8a0_0879e8262cf045588dfccde2c80e3578~mv2.webp)] bg-cover bg-center bg-no-repeat transition-all duration-700 hover:bg-[url(https://static.wixstatic.com/media/5dd8a0_ba9fa6d86b08441dac7e9fa20171d560~mv2.webp)]">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 group-hover:from-black/70 group-hover:via-black/60 group-hover:to-black/70 transition-all duration-700"></div>

      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-slate-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Glassmorphism container */}
      <div className="relative bg-black/30 backdrop-blur-md border-t border-white/10 p-8 md:p-12 lg:px-16 lg:py-24">
        <div className="contenedor">
          <div className="text-center max-w-4xl mx-auto">
            {isSubscribed ? (
              <>
                {/* Success Icon with animation */}
                <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-green-600/30 border-2 border-green-400/60 mb-8 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 hover:scale-110 group/icon">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-green-400 group-hover/icon:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Title with enhanced gradient */}
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight tracking-tight">
                  {t("vdp-server.subscription-active.title")}
                </h2>

                {/* Description paragraphs with better spacing */}
                <div className="space-y-4 mb-10">
                  <p className="text-gray-100 text-lg md:text-xl lg:text-2xl leading-relaxed drop-shadow-lg font-medium">
                    {t("vdp-server.subscription-active.description")}
                  </p>
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed drop-shadow-md">
                    {t("vdp-server.subscription-active.disclaimer")}
                  </p>
                </div>

                {/* Enhanced CTA Button */}
                <div className="mt-10 sm:mt-12">
                  <a
                    href="/accounts"
                    className="group relative inline-flex items-center justify-center gap-3 text-lg md:text-xl rounded-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 px-10 md:px-14 py-4 md:py-5 font-bold text-white transition-all duration-500 hover:from-slate-500 hover:via-slate-600 hover:to-slate-500 focus:ring-4 focus:ring-slate-500/50 focus:outline-none shadow-2xl hover:shadow-slate-500/50 transform hover:scale-105 overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      {t("vdp-server.subscription-active.btn-text")}
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </a>
                </div>
              </>
            ) : (
              <>
                {/* Premium Icon with animation */}
                <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-slate-500/30 via-slate-600/20 to-slate-500/30 border-2 border-slate-400/60 mb-8 shadow-lg shadow-slate-500/20 hover:shadow-slate-500/40 transition-all duration-300 hover:scale-110 group/icon animate-pulse">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 group-hover/icon:rotate-12 transition-transform duration-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>

                {/* Title with enhanced gradient */}
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight tracking-tight">
                  {t("vdp-server.subscription-inactive.title")}
                </h2>

                {/* Description with better styling */}
                <p className="text-gray-100 text-lg md:text-xl lg:text-2xl leading-relaxed drop-shadow-lg font-medium mb-10">
                  {t("vdp-server.subscription-inactive.description")}
                </p>

                {/* Enhanced CTA Button */}
                <div className="mt-10 sm:mt-12">
                  <a
                    href="/subscriptions"
                    className="group relative inline-flex items-center justify-center gap-3 text-lg md:text-xl rounded-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 px-10 md:px-14 py-4 md:py-5 font-bold text-white transition-all duration-500 hover:from-slate-500 hover:via-slate-600 hover:to-slate-500 focus:ring-4 focus:ring-slate-500/50 focus:outline-none shadow-2xl hover:shadow-slate-500/50 transform hover:scale-105 overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      {t("vdp-server.subscription-inactive.btn-text")}
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServerInformationVdp;
