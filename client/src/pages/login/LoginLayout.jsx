import { Outlet } from "react-router-dom";
import { GlobalToastProvider } from "../../components/Toast";

function LoginLayout() {
  return (
    <GlobalToastProvider>
      <Outlet />
    </GlobalToastProvider>
  );
}

export default LoginLayout;
