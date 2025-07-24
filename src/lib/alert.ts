import { toast } from "react-toastify";

const dissmissAlert = () => {
  try {
    toast.dismiss();
  } catch (e) {
    console.warn("Toast dismiss failed:", e);
  }
};

export const errorAlert = (message: string) => {
  dissmissAlert();
  toast.error(message);
};

export const successAlert = (message: string) => {
  dissmissAlert();
  toast.success(message);
};

export const infoAlert = (message: string) => {
  toast.info(message);
};

export const warnAlert = (message: string) => {
  dissmissAlert();
  toast.warn(message);
};

export const defaultAlert = (message: string) => {
  dissmissAlert();
  toast(message);
};
