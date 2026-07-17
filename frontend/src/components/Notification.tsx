import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ReactNode } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notify: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

const icons: Record<NotificationType, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <XCircle className="w-5 h-5 text-rose-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-indigo-500" />,
};

const bgStyles: Record<NotificationType, string> = {
  success: "bg-emerald-50 dark:bg-emerald-900/25 border-emerald-200 dark:border-emerald-800",
  error: "bg-rose-50 dark:bg-rose-900/25 border-rose-200 dark:border-rose-800",
  warning: "bg-amber-50 dark:bg-amber-900/25 border-amber-200 dark:border-amber-800",
  info: "bg-indigo-50 dark:bg-indigo-900/25 border-indigo-200 dark:border-indigo-800",
};

const textStyles: Record<NotificationType, string> = {
  success: "text-emerald-800 dark:text-emerald-200",
  error: "text-rose-800 dark:text-rose-200",
  warning: "text-amber-800 dark:text-amber-200",
  info: "text-indigo-800 dark:text-indigo-200",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const counterRef = useRef(0);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const add = useCallback((type: NotificationType, message: string, duration = 4000) => {
    const id = `notif-${++counterRef.current}`;
    setNotifications((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const notify: NotificationContextType["notify"] = {
    success: (message, duration) => add("success", message, duration),
    error: (message, duration) => add("error", message, duration),
    warning: (message, duration) => add("warning", message, duration),
    info: (message, duration) => add("info", message, duration),
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="fixed bottom-20 lg:bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <ToastItem key={n.id} item={n} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

function ToastItem({ item, onRemove }: { key?: string; item: NotificationItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (item.duration && item.duration > 0) {
      const timer = setTimeout(() => onRemove(item.id), item.duration);
      return () => clearTimeout(timer);
    }
  }, [item, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border shadow-lg backdrop-blur-md bg-white/95 dark:bg-slate-900/95 min-w-[280px] max-w-[360px] ${bgStyles[item.type]}`}
    >
      <span className="shrink-0 mt-0.5">{icons[item.type]}</span>
      <p className={`text-xs font-medium leading-snug flex-1 ${textStyles[item.type]}`}>
        {item.message}
      </p>
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
