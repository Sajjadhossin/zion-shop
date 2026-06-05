import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

/** Server-action sign-out. Drop into any server component. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        className="w-auto bg-neutral-900 px-4 hover:bg-neutral-800 focus-visible:ring-neutral-500"
      >
        Sign out
      </Button>
    </form>
  );
}
