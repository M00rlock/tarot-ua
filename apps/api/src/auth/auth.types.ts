export interface JwtUserPayload {
  sub: string;
  email: string;
  name: string;
  premiumTier: 'free' | 'premium';
}
