import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { HomePage } from "./App";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import { LoanApplicationPage } from "./pages/LoanApplicationPage";
import { SanctionLetterPage } from "./pages/SanctionLetterPage";

// Root route — just an outlet
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Home route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Loan application route
const applyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apply",
  component: LoanApplicationPage,
});

// Admin login route
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

// Admin dashboard route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

// Sanction letter route
const sanctionLetterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sanction-letter",
  component: SanctionLetterPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
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
