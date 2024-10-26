import { sendEmail } from "../src/phinda/email-handler";
import { config } from "./config";
import { render } from "jsx-email";

export type Email = {
  html: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
};

export const renderEmail = async (
  email: JSX.Element
): Promise<{ html: string; text: string }> => {
  const [html, text] = await Promise.all([
    render(email),
    render(email, { plainText: true }),
  ]);

  return { html, text };
};

export async function sendVerificationMail(
  emailAddress: string,
  emailData: { html: string; text: string }
): Promise<void> {
  await sendEmail({
    ...emailData,
    from: config.email.from,
    to: emailAddress,
    subject: "Please verify your account",
  });

  return;
}
