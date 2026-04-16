import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom"

import RootLayout from "./pages/Root";
import ErrorPage from "./pages/Error";
import PortalErrorPage from "./pages/PortalError";
import DashboardPage, { dashboardLoader } from "./pages/Dashboard";
import ProfilePage, { profileLoader, profileAction } from "./pages/Profile";
import PasswordResetPage from "./pages/PasswordReset";

import LoginLayout from "./pages/login/LoginLayout";
import LoginPage, { loginAction, loginLoader } from "./pages/Login";

import ProductsPage, { loader as ProductsLoader } from "./pages/products/Products";
import ProductDetailPage, { ProductDetailLoader } from "./pages/products/ProductDetail";
import EditProductPage from "./pages/products/EditProduct";
import NewProductPage from "./pages/products/NewProduct";
import { action as manipulateProductAction } from "./components/ProductForm";

import CustomersPage, { loader as CustomersLoader} from "./pages/customers/Customers";
import CustomerDetailPage, { CustomerDetailLoader } from "./pages/customers/CustomerDetail";
import NewCustomerPage from "./pages/customers/NewCustomer";
import EditCustomerPage from "./pages/customers/EditCustomer";
import { action as manipulateCustomerAction } from "./components/CustomerForm";

import SalesPage, { loader as SalesLoader } from "./pages/sales/Sales";
import SaleDetailPage, { SaleDetailLoader } from "./pages/sales/SaleDetail";
import NewSalePage from "./pages/sales/NewSale";
import EditSalePage from "./pages/sales/EditSale";
import { action as manipulateSaleAction } from "./components/SaleForm";

import PaymentsPage, { loader as PaymentsLoader } from "./pages/payments/Payments";
import PaymentDetailPage, { PaymentDetailLoader } from "./pages/payments/PaymentDetail";
import NewPaymentPage from "./pages/payments/NewPayment";
import EditPaymentPage from "./pages/payments/EditPayment";
import { action as manipulatePaymentAction } from "./components/PaymentForm";

import UsersPage, { loader as UsersLoader } from "./pages/users/Users";
import UserDetailPage, { UserDetailLoader } from "./pages/users/UserDetail";
import NewUserPage from "./pages/users/NewUser";
import EditUserPage from "./pages/users/EditUser";
import { action as manipulateUserAction } from "./components/UserForm";

// Customer portal
import PortalLayout from "./pages/portal/PortalLayout";
import PortalProductsPage, { loader as PortalProductsLoader } from "./pages/portal/PortalProducts";
import PortalProductDetailPage, { loader as PortalProductDetailLoader } from "./pages/portal/PortalProductDetail";
import PortalSalesPage, { loader as PortalSalesLoader } from "./pages/portal/PortalSales";
import PortalSaleDetailPage, { loader as PortalSaleDetailLoader } from "./pages/portal/PortalSaleDetail";
import PortalRewardsPage, { loader as PortalRewardsLoader } from "./pages/portal/PortalRewards";

import { getAuthUser } from "./utils/auth";

/**
 * Admin/Owner root loader: requires authentication AND admin/owner role.
 * Customers get redirected to /portal.
 */
async function adminRootLoader() {
  const user = await getAuthUser();
  if (!user) return redirect("/login");
  if (user.role === "customer") return redirect("/portal");
  return user;
}

/**
 * Customer portal loader: requires authentication AND customer role.
 */
async function portalRootLoader() {
  const user = await getAuthUser();
  if (!user) return redirect("/login");
  if (user.role !== "customer") return redirect("/");
  return user;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
        loader: loginLoader,
        action: loginAction,
      },
    ],
  },
  {
    path: "/password-reset",
    element: <PasswordResetPage />,
  },
  // ─── Customer portal ───
  {
    path: "/portal",
    element: <PortalLayout />,
    errorElement: <PortalErrorPage />,
    id: "portal-root",
    loader: portalRootLoader,
    children: [
      {
        index: true,
        element: <PortalProductsPage />,
        loader: PortalProductsLoader,
      },
      {
        path: "products/:productId",
        element: <PortalProductDetailPage />,
        loader: PortalProductDetailLoader,
      },
      {
        path: "sales",
        element: <PortalSalesPage />,
        loader: PortalSalesLoader,
      },
      {
        path: "sales/:saleId",
        element: <PortalSaleDetailPage />,
        loader: PortalSaleDetailLoader,
      },
      {
        path: "rewards",
        element: <PortalRewardsPage />,
        loader: PortalRewardsLoader,
      },
    ],
  },
  // ─── Admin/Owner dashboard ───
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    id: "root",
    loader: adminRootLoader,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        loader: dashboardLoader,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
        loader: profileLoader,
        action: profileAction,
      },
      {
        path: "/sales",
        element: <SalesPage />,
        loader: SalesLoader
      },
      {
        path: "/sales/new",
        element: <NewSalePage />,
        action: manipulateSaleAction
      },
      {
        path: "/sales/:saleId",
        id: "sale-detail",
        loader: SaleDetailLoader,
        children: [
          {
            index: true,
            element: <SaleDetailPage />,
            action: manipulateSaleAction
          },
          {
            path: "edit",
            element: <EditSalePage />,
            action: manipulateSaleAction
          }
        ]
      },
      {
        path: "/payments",
        element: <PaymentsPage />,
        loader: PaymentsLoader
      },
      {
        path: "/payments/new",
        element: <NewPaymentPage />,
        action: manipulatePaymentAction
      },
      {
        path: "/payments/:paymentId",
        id: "payment-detail",
        loader: PaymentDetailLoader,
        children: [
          {
            index: true,
            element: <PaymentDetailPage />,
            action: manipulatePaymentAction
          },
          {
            path: "edit",
            element: <EditPaymentPage />,
            action: manipulatePaymentAction
          }
        ]
      },
      {
        path: "/customers",
        element: <CustomersPage />,
        loader: CustomersLoader
      },
      {
        path: "/customers/new",
        element: <NewCustomerPage />,
        action: manipulateCustomerAction
      },
      {
        path: "/customers/:customerId",
        id: "customer-detail",
        loader: CustomerDetailLoader,
        children: [
          {
            index: true,
            element: <CustomerDetailPage />,
            action: manipulateCustomerAction
          },
          {
            path: "edit",
            element: <EditCustomerPage />,
            action: manipulateCustomerAction
          }
        ]
      },
      {
        path: "/products",
        element: <ProductsPage />,
        loader: ProductsLoader
      },
      {
        path: "/products/new",
        element: <NewProductPage />,
        action: manipulateProductAction
      },
      {
        path: "/products/:productId",
        id: "product-detail",
        loader: ProductDetailLoader,
        children: [
          {
            index: true,
            element: <ProductDetailPage />,
            action: manipulateProductAction
          },
          {
            path: "edit",
            element: <EditProductPage />,
            loader: ProductDetailLoader,
            action: manipulateProductAction
          }
        ]
      },
      {
        path: "/users",
        element: <UsersPage />,
        loader: UsersLoader
      },
      {
        path: "/users/new",
        element: <NewUserPage />,
        action: manipulateUserAction
      },
      {
        path: "/users/:userId",
        id: "user-detail",
        loader: UserDetailLoader,
        children: [
          {
            index: true,
            element: <UserDetailPage />,
            action: manipulateUserAction
          },
          {
            path: "edit",
            element: <EditUserPage />,
            loader: UserDetailLoader,
            action: manipulateUserAction
          }
        ]
      }
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
