import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import { ContactPage } from "./pages/ContactPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { CustomerLogin } from "./pages/CustomerLogin";
import { HomePage } from "./pages/HomePage";
import { LoanApplicationPage } from "./pages/LoanApplicationPage";
import { SanctionLetterPage } from "./pages/SanctionLetterPage";
import { ServicesPage } from "./pages/ServicesPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: ServicesPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: CustomerLogin,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: CustomerDashboard,
});

const applyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apply",
  component: LoanApplicationPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const sanctionLetterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sanction-letter",
  component: SanctionLetterPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  servicesRoute,
  contactRoute,
  loginRoute,
  dashboardRoute,
  applyRoute,
  adminLoginRoute,
  adminRoute,
  sanctionLetterRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
