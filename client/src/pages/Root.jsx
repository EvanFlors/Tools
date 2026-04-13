import { Outlet } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";
import { GlobalToastProvider } from "../components/Toast";

function RootLayout() {
  return (
    <GlobalToastProvider>
      <div className="min-h-screen bg-neutral-100 text-neutral-800">
        <header>
          <MainNavigation />
        </header>
        <main className="pt-12">
          <Outlet />
        </main>
      </div>
    </GlobalToastProvider>
  );
}

export default RootLayout;
