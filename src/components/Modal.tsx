import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'credential';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md', variant = 'default' }: ModalProps) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size variants
  const sizeClasses = {
    sm: 'w-full max-w-sm max-h-[50vh]',
    md: 'w-full max-w-md max-h-[60vh]',
    lg: 'w-full max-w-lg max-h-[70vh]',
    xl: 'w-full max-w-2xl max-h-[80vh]',
    full: 'w-full max-w-6xl max-h-[90vh]'
  };

  // Variant-specific styles
  const getVariantStyles = () => {
    if (variant === 'credential') {
      return {
        background: 'white',
        textColor: 'text-gray-500',
        // buttonClass: 'bg-gray-500 hover:bg-gray-600'
      };
    }

    return {
      background: 'linear-gradient(150deg, rgba(255, 222, 88, 0.04) 0%, rgba(255, 142, 108, 0.04) 50%, rgba(186, 73, 171, 0.04) 100%)',
      textColor: 'text-white',
      // buttonClass: 'hover:bg-white/10'
    };
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative ${variantStyles.textColor} ${sizeClasses[size]} flex flex-col`}
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          background: variantStyles.background,
          boxShadow: '0px 0px 22.7px 0px rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(3.5px)'
        }}
      >
        {title ? (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className={`text-xl font-semibold ${variantStyles.textColor}`}>{title}</h2>
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex justify-end p-2">
            <button
              onClick={onClose}
              className="  rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto px-4 py-2 ${variantStyles.textColor}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
