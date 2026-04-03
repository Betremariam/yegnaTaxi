import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';
import useToastStore from '../../store/useToastStore';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`
              pointer-events-auto p-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md
              border backdrop-blur-md
              ${toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' 
                : toast.type === 'error'
                  ? 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400'
                  : 'bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400'
              }
            `}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-grow text-sm font-medium">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
