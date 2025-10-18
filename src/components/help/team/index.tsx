import { teamMembers } from "@/constants/teamMembers";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useTranslation } from "react-i18next";

const MeetTheTeam = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("support.team.title")}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t("support.team.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 transition-all duration-300 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden"
            >
              {/* Imagen del miembro */}
              <div className="relative mb-8">
                <div className="relative overflow-hidden rounded-2xl w-48 h-48 mx-auto">
                  <img
                    className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                    src={member.image}
                    alt={`${member.name}'s avatar`}
                  />
                  {/* Overlay sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Información del miembro */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-gray-400 mb-6 text-lg">{member.title}</p>

                {/* Iconos sociales mejorados */}
                <div className="flex items-center justify-center space-x-4">
                  <a
                    target="_blank"
                    href={member.social.facebook}
                    className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-facebook text-blue-400 text-lg"></i>
                  </a>
                  <a
                    target="_blank"
                    href={member.social.telegram}
                    className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center hover:bg-cyan-500/30 transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-telegram text-cyan-400 text-lg"></i>
                  </a>
                  <a
                    target="_blank"
                    href={member.social.tiktok}
                    className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center hover:bg-pink-500/30 transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-tiktok text-pink-400 text-lg"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetTheTeam;
