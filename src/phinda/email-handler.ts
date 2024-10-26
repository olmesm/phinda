import type { Email } from "@phinda/email";
import { redirect } from "@phinda/lib";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export const sendEmail = process.env.NODE_ENV?.includes("prod")
  ? sendEmailProd
  : sendEmailLocal;

let transporter: nodemailer.Transporter<
  SMTPTransport.SentMessageInfo,
  SMTPTransport.Options
>;

/**
 * Configured to use [mailhog](https://github.com/mailhog/MailHog)
 *
 * ```bash
 * docker run --rm -it -p 8025:8025 -p 1025:1025 mailhog/mailhog
 * ```
 *
 */
async function sendEmailLocal(payload: Email): Promise<void> {
  try {
    transporter =
      transporter ??
      nodemailer.createTransport({
        host: "0.0.0.0",
        port: 1025,
        secure: false,
        logger: true,
      });

    await transporter.sendMail(payload);
  } catch (error) {
    redirect("/");
  }

  return;
}

async function sendEmailProd(payload: Email): Promise<void> {
  // Add your production email sending logic here
  return;
}
