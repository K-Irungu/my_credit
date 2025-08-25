// utils/verifyRecaptcha.ts
interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  score?: number; // Only for reCAPTCHA v3
  action?: string; // Only for reCAPTCHA v3
}

export async function verifyRecaptcha(token: string): Promise<{
  success: boolean;
  error?: string;
  score?: number;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return { success: false, error: 'reCAPTCHA secret key not configured' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      const errorMessage = data['error-codes']?.join(', ') || 'Unknown error';
      return { success: false, error: `reCAPTCHA verification failed: ${errorMessage}` };
    }

    // For reCAPTCHA v3, check score (0.0 to 1.0, higher is better)
    if (data.score !== undefined) {
      const minScore = 0.5; // Adjust threshold as needed
      if (data.score < minScore) {
        return { 
          success: false, 
          error: `reCAPTCHA score too low: ${data.score}`,
          score: data.score 
        };
      }
    }

    return { 
      success: true, 
      score: data.score 
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, error: 'reCAPTCHA verification failed' };
  }
}