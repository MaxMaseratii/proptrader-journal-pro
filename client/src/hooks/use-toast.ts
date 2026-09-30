export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(toast: Toast) => void> = [];

export function useToast() {
  return {
    toast: (props: Omit<Toast, "id">) => {
      const id = genId();
      const toast = { ...props, id, open: true };

      listeners.forEach((listener) => {
        listener(toast);
      });
    },
    dismiss: (toastId?: string) => {
      listeners.forEach((listener) => {
        listener({ id: toastId || "", open: false });
      });
    },
  };
}
