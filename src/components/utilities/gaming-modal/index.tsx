"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface GamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  onConfirm?: () => void;
  showCloseButton?: boolean;
}

const GamingModal: React.FC<GamingModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "¡Comenzar Aventura!",
  onConfirm,
  showCloseButton = true,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border-2 border-gaming-primary-main/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gaming-primary-main to-gaming-secondary-main rounded-full flex items-center justify-center shadow-lg shadow-gaming-primary-main/50">
                <span className="text-3xl">⚔️</span>
              </div>
              <h2 className="text-3xl font-bold text-gaming-primary-light font-cinzel text-center">
                {title}
              </h2>
            </div>
            
            {/* Content */}
            <div className="text-center">
              <p className="text-lg text-gray-200 leading-relaxed mb-8 px-4">
                {description}
              </p>
              
              {/* Image */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img 
                    src="https://static.wixstatic.com/media/5dd8a0_87f6b8f5c91343c3823fd351dcc8798d~mv2.webp" 
                    alt="Símbolo WoW" 
                    className="w-36 h-36 rounded-2xl shadow-2xl shadow-gaming-primary-main/40 border-2 border-gaming-primary-main/30"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/60"></div>
                </div>
              </div>
              
              {/* Highlight Box */}
              <div className="bg-gaming-primary-main/10 border-l-4 border-gaming-primary-main rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 text-gaming-primary-light">
                  <span className="text-2xl">✨</span>
                  <span className="text-lg font-semibold">¡Tu aventura épica está a punto de comenzar!</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main hover:from-gaming-primary-main/90 hover:to-gaming-secondary-main/90 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gaming-primary-main/40 relative overflow-hidden group"
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 text-lg">{buttonText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamingModal;
