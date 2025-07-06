
'use server';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    
    if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Failed to get PayPal access token:", errorDetails);
        throw new Error("Could not retrieve PayPal access token.");
    }
    
    const data = await response.json();
    return data.access_token;
}

async function capturePayPalOrder(orderId: string) {
    const accessToken = await getPayPalAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('PayPal Order Capture Error:', error);
        throw new Error(error.message || 'Failed to capture PayPal order.');
    }
    
    return response.json();
}

export const paypal = {
    getAccessToken: getPayPalAccessToken,
    captureOrder: capturePayPalOrder,
};
