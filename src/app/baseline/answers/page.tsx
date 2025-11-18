import { cookies } from "next/headers";
import AnswersClient from "./AnswersClient";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user-session");

  let email = null;
  let date = null;

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      email = parsed.email;
      date = parsed.loginDate.split("T")[0]; // YYYY-MM-DD
    } catch (err) {
      console.error("Failed to parse cookie", err);
    }
  }

  return <AnswersClient email={email} date={date} />;
}
