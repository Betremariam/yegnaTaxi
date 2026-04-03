require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  webAdminUrl: process.env.WEB_ADMIN_URL || 'http://localhost:3000',
  mobileAppUrl: process.env.MOBILE_APP_URL || 'http://localhost',
};

