"use client";
import {
  recoverPassword,
  validateRecoverPassword,
} from "@/api/account/security";
import NavbarMinimalist from "@/components/navbar-minimalist";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const ChangePassword = () => {
  const [currentForm, setCurrentForm] = useState("reset");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUserContext();
  const language = user.language;

  const handleFormChange = (formType: string) => {
    setCurrentForm(formType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await recoverPassword(email);
      setSuccessMessage(t("reset-password.section-one.success-message"));
      handleFormChange("additional");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.message,
        color: "white",
        background: "#0B1218",
        timer: 4000,
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.toLocaleUpperCase();
    setOtp(newOtp);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const otpCode = otp.join("");

    try {
      await validateRecoverPassword(email, otpCode, language);
      setSuccessMessage("Success");
      Swal.fire({
        icon: "success",
        title: t("reset-password.section-two.title-success"),
        text: t("reset-password.section-two.success-message"),
        color: "white",
        background: "#0B1218",
        willClose: () => {
          router.push("/login");
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setLoading(false);
    setError(null);
    setSuccessMessage(null);
    handleFormChange("reset");
  };

  return (
    <div className="min-h-screen bg-midnight">
      <NavbarMinimalist />
      
      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gaming-base-main rounded-full mb-6 shadow-2xl border border-gaming-primary-main/30">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gaming-primary-light mb-6">
            {currentForm === "reset" 
              ? t("reset-password.section-one.title")
              : t("reset-password.section-two.title")
            }
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {currentForm === "reset" 
              ? t("reset-password.section-one.sub-title")
              : t("reset-password.section-two.sub-title")
            }
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gaming-base-main/50 backdrop-blur-sm border border-gaming-base-light/30 rounded-2xl p-8 md:p-12 shadow-xl">
          {currentForm === "reset" ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-lg font-semibold text-gaming-primary-light">
                    {t("reset-password.section-one.var-mail")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("reset-password.section-one.var-mail-placeholder")}
                    className="w-full p-4 bg-gaming-base-dark/50 border border-gaming-primary-main/30 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-gaming-secondary-main focus:shadow-lg focus:shadow-gaming-secondary-main/20 transition-all duration-300"
                    required
                  />
                </div>
                
                {error && (
                  <div className="bg-gaming-status-error/20 border border-gaming-status-error/50 rounded-xl p-4">
                    <p className="text-gaming-status-error font-medium">{error}</p>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-gaming-status-success/20 border border-gaming-status-success/50 rounded-xl p-4">
                    <p className="text-gaming-status-success font-medium">{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark hover:from-gaming-primary-light hover:to-gaming-primary-main text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gaming-primary-main/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading
                    ? t("reset-password.section-one.btn.send")
                    : t("reset-password.section-one.btn.txt")
                  }
                </button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="bg-gaming-secondary-main/10 border border-gaming-secondary-main/30 rounded-xl p-6">
                  <p className="text-gaming-secondary-main font-medium text-center">
                    {t("reset-password.section-two.disclaimer")}
                  </p>
                </div>
                
                <div className="flex justify-center space-x-3">
                  {otp.map((value, index) => (
                    <input
                      key={index}
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-bold text-white bg-gaming-base-dark/50 border border-gaming-primary-main/30 rounded-xl focus:outline-none focus:border-gaming-secondary-main focus:shadow-lg focus:shadow-gaming-secondary-main/20 transition-all duration-300"
                      placeholder="-"
                    />
                  ))}
                </div>
                
                {error && (
                  <div className="bg-gaming-status-error/20 border border-gaming-status-error/50 rounded-xl p-4">
                    <p className="text-gaming-status-error font-medium text-center">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark hover:from-gaming-primary-light hover:to-gaming-primary-main text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gaming-primary-main/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                  >
                    {loading
                      ? t("reset-password.section-two.btn.send")
                      : t("reset-password.section-two.btn.txt")
                    }
                  </button>

                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="w-full py-4 bg-gaming-base-light/50 hover:bg-gaming-base-light/70 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gaming-base-light/20"
                  >
                    {t("reset-password.section-two.btn.return")}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Security Features Section */}
        <div className="mt-12">
          <div className="bg-gaming-base-main/50 backdrop-blur-sm border border-gaming-base-light/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gaming-primary-light text-center mb-8">
              🔒 Características de Seguridad
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gaming-primary-main/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gaming-primary-main/30 group-hover:border-gaming-secondary-main transition-colors duration-300">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h4 className="text-lg font-semibold text-gaming-primary-light mb-2">
                  Encriptación Segura
                </h4>
                <p className="text-gray-300 text-sm">
                  Tus datos están protegidos con encriptación de nivel militar
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gaming-secondary-main/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gaming-secondary-main/30 group-hover:border-gaming-primary-main transition-colors duration-300">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-lg font-semibold text-gaming-secondary-main mb-2">
                  Verificación Rápida
                </h4>
                <p className="text-gray-300 text-sm">
                  Proceso de recuperación optimizado y seguro
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gaming-status-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gaming-status-success/30 group-hover:border-gaming-primary-main transition-colors duration-300">
                  <span className="text-2xl">✅</span>
                </div>
                <h4 className="text-lg font-semibold text-gaming-status-success mb-2">
                  Acceso Garantizado
                </h4>
                <p className="text-gray-300 text-sm">
                  Recupera tu cuenta de forma segura y confiable
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progreso de Seguridad</span>
                <span className="text-sm text-gaming-primary-light font-semibold">100%</span>
              </div>
              <div className="w-full bg-gaming-base-dark rounded-full h-2">
                <div className="bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main h-2 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="mt-8 bg-gaming-base-dark/50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gaming-secondary-main mb-4 text-center">
                💡 Consejos de Seguridad
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-gaming-primary-main">•</span>
                  <span>Usa contraseñas únicas y complejas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gaming-primary-main">•</span>
                  <span>Habilita la autenticación de dos factores</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gaming-primary-main">•</span>
                  <span>No compartas tus credenciales</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gaming-primary-main">•</span>
                  <span>Actualiza regularmente tu contraseña</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
