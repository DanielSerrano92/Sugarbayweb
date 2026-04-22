import { getCurrentUser, getSessionUser } from "@/lib/auth/dal";
import { getCartForUser } from "@/lib/repositories/cart";

import HeaderClient from "./header-client";

export default async function SiteHeader() {
  const sessionUser = await getSessionUser();

  const [currentUser, cart] = await Promise.all([
    getCurrentUser(),
    sessionUser ? getCartForUser(sessionUser.userId) : Promise.resolve(null),
  ]);

  return (
    <HeaderClient
      cartCount={cart?.totalItems ?? 0}
      cart={cart}
      currentUser={
        currentUser
          ? {
              firstName: currentUser.firstName,
              email: currentUser.email,
            }
          : null
      }
    />
  );
}
