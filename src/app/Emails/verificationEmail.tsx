import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here's your verification code: {otp}</Preview>
      <Section style={{ padding: '20px', textAlign: 'center' }}>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering. Please use the following verification code to complete your registration:
          </Text>
        </Row>
        <Row>
          <Text>
            <strong style={{ fontSize: '18px', color: '#333' }}>{otp}</strong>
          </Text>
        </Row>
        <Row>
          <Text>If you did not request this code, please ignore this email.</Text>
        </Row>
        <Row>
          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/verify/${username}`}
            style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px' }}
          >
            Verify Here
          </Button>
        </Row>
      </Section>
    </Html>
  );
}
