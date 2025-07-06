
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Button,
  Text,
  Link,
  Preview,
  Section
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password for TourVista Georgia</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Reset Your Password</Heading>
        <Text style={paragraph}>
          Hello {userName},
        </Text>
        <Text style={paragraph}>
          We received a request to reset the password for your TourVista account. 
          To proceed, please click the button below. This link is valid for one hour.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button style={button} href={resetUrl}>
                Reset Password
            </Button>
        </Section>
        <Text style={paragraph}>
          If you did not request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </Text>
        <Text style={{ ...paragraph, marginTop: '24px' }}>
          Thank you,
          <br />
          The TourVista Team
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  textAlign: 'center' as const,
  color: '#333'
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  color: '#525f7f'
};

const button = {
    backgroundColor: '#21AEEB',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 24px',
};
