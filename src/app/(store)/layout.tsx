import { StoreShell } from "@modules/ecommerce";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StoreShell>{children}</StoreShell>;
}
