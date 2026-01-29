import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { translate } from "@/context/language-context";

const resolveMessage = (message) => {
  if (typeof message === "string") return message;
  if (!message || typeof message !== "object") return String(message);
  if (typeof message.key === "string") return translate(message.key, message.vars || {});
  return String(message);
};

const notifySuccess = (message) =>
  toast.success(resolveMessage(message), {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

const notifyError = (message) =>
  toast.error(resolveMessage(message), {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

export { notifySuccess, notifyError };
