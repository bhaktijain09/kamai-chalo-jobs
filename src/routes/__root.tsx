import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { UnreadMessagesProvider } from "@/hooks/use-unread-messages";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "BlueCollar — Find Jobs Near You Fast" },
      { name: "description", content: "Hire or get hired in minutes. India's fastest blue-collar job marketplace for delivery, driver, security, cook, helper jobs and more." },
      { name: "theme-color", content: "#f97316" },
      { property: "og:title", content: "BlueCollar — Find Jobs Near You Fast" },
      { property: "og:description", content: "Hire or get hired in minutes. India's fastest blue-collar job marketplace for delivery, driver, security, cook, helper jobs and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BlueCollar — Find Jobs Near You Fast" },
      { name: "twitter:description", content: "Hire or get hired in minutes. India's fastest blue-collar job marketplace for delivery, driver, security, cook, helper jobs and more." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d1498500-13df-4f69-ada1-0b0ee04f1f88/id-preview-4bff0c65--7c323a12-985d-465d-9c41-71d310b2d9d3.lovable.app-1776532875799.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d1498500-13df-4f69-ada1-0b0ee04f1f88/id-preview-4bff0c65--7c323a12-985d-465d-9c41-71d310b2d9d3.lovable.app-1776532875799.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UnreadMessagesProvider>
          <Outlet />
          <Toaster />
        </UnreadMessagesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
