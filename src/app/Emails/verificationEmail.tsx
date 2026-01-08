import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
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
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section style={{ padding: '20px', textAlign: 'center' }}>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering! Please use the following verification code to complete your registration:
          </Text>
        </Row>
        <Row>
          <Text>
            <strong style={{ fontSize: '24px', color: '#0066cc', letterSpacing: '2px' }}>{otp}</strong>
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>
            ⚠️ This code expires in 10 minutes
          </Text>
        </Row>
        <Row>
          <Text style={{ fontSize: '14px', color: '#666' }}>
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
