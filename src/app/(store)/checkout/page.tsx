import { auth } from "@core/auth";
import { CheckoutPageContent, getAddresses } from "@modules/ecommerce";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const addresses =
    session?.user?.id != null
      ? await getAddresses(session.user.id)
      : [];

  return <CheckoutPageContent addresses={addresses} />;
}
