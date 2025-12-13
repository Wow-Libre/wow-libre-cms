import React from "react";

const VdpBody = ({
  serverData,
  t,
  serverName,
  youtubeUrl,
}: {
  serverData: { [key: string]: string };
  t: (key: string, options?: any) => string;
  serverName: string;
  youtubeUrl: string;
}) => {
  return (
    <section className="contenedor relative pt-12 text-white mb-10 mt-10">
      <div className="items-center flex flex-wrap gap-8 lg:gap-12">
        {/* Video Section - Improved with better responsive design */}
        <div className="w-full lg:w-8/12 mx-auto px-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-slate-500 to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-gray-900/50 rounded-2xl p-2 overflow-hidden">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={
                    youtubeUrl ||
                    "https://www.youtube.com/embed/sxPji1VlsU0?si=EPa0DkocLJ-Nurx2"
                  }
                  title="World of Warcraft: Battle for Azeroth Cinematic Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section - Enhanced with better styling */}
        <div className="w-full lg:w-4/12 mx-auto px-4">
          <div className="lg:pr-8">
            {/* Section Header */}
            <div className="mb-8">
              <p className="text-base md:text-lg leading-relaxed text-gray-300">
                {t("vdp-server.body.title")}
              </p>
            </div>

            {/* Server Data List - Enhanced with better visual hierarchy */}
            <div className="space-y-3">
              {Object.entries(serverData).map(([key, value], index) => (
                <div
                  key={index}
                  className="group relative bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/60 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:bg-gray-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500/40 to-yellow-600/50 border border-yellow-400/60 text-yellow-400 text-xs group-hover:scale-110 transition-transform duration-300">
                        <i className="fas fa-check text-[10px]"></i>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-sm font-medium mb-0.5 group-hover:text-gray-300 transition-colors">
                          {key}
                        </span>
                        <span className="text-yellow-400 text-base font-semibold break-words">
                          {value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VdpBody;
