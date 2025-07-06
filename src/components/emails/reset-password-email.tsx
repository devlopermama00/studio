
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
        <Heading style={heading}>Hi {userName},</Heading>
        <Text style={paragraph}>
          Someone recently requested a password change for your TourVista account.
          If this was you, you can set a new password here:
        </Text>
        <Section style={{ textAlign: 'center' }}>
            <Button style={button} href={resetUrl}>
                Reset Password
            </Button>
        </Section>
        <Text style={paragraph}>
          If you don't want to change your password or didn't request this, you can
          ignore and delete this message.
        </Text>
        <Text style={paragraph}>
          — The TourVista Team
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
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 20px',
  color: '#525f7f'
};

const button = {
    backgroundColor: '#21AEEB',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 20px',
};
