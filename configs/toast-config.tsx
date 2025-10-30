import { BaseToast, ErrorToast, ToastProps } from "react-native-toast-message";

export const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#4caf50", backgroundColor: "#e8f5e8" }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ color: "#2e7d32", fontWeight: "700" }}
      text2Style={{ color: "#2e7d32" }}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#ff5252", backgroundColor: "#fdecea" }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ color: "#b71c1c", fontWeight: "700" }}
      text2Style={{ color: "#b71c1c" }}
    />
  ),
};
