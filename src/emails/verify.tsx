import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "jsx-email";

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

type Props = {
  userFirstname: string;
  verifyUrl: string;
  logoUrl?: string;
  address?: string;
};

export const templateName = "Verify";

export const previewProps = {
  userFirstname: "John",
  verifyUrl: "https://example.com",
  logoUrl: "https://example.com/logo.png",
  address: "42 Wallaby Way, Sydney.",
} as Props;

export const Template = ({
  address,
  userFirstname,
  verifyUrl,
  logoUrl,
}: Props) => (
  <Html>
    <Head />
    <Preview>You're almost ready!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          {logoUrl && (
            <>
              <Img src={logoUrl} width="49" height="21" alt="" />
              <Hr style={hr} />
            </>
          )}
          <Text style={paragraph}>Welcome {userFirstname}!</Text>
          <Text style={paragraph}>
            We&apos;re excited to have you on board. Get started by verifying
            your account via the link below.
          </Text>
          <Button
            align="center"
            width={200}
            height={44}
            backgroundColor="#242429"
            borderRadius={3}
            textColor="#fff"
            href={verifyUrl}
          >
            Verify Account
          </Button>
          <Hr style={hr} />
          <Text style={paragraph}>— The Team</Text>
          <Hr style={hr} />
          {address && <Text style={footer}>{address}</Text>}
        </Section>
      </Container>
    </Body>
  </Html>
);
