class AppConstants {
  static const String appName = 'Yegna Taxi';
  static const String appVersion = '1.0.0';

  // API Endpoints
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5000/api',
  );

  // Transaction Types
  static const String transactionTypeTopUp = 'TOP_UP';
  static const String transactionTypeFarePayment = 'FARE_PAYMENT';
  static const String transactionTypeCommission = 'COMMISSION';
  static const String transactionTypeDeposit = 'DEPOSIT';

  // User Roles
  static const String rolePassenger = 'PASSENGER';
  static const String roleDriver = 'DRIVER';
  static const String roleAgent = 'AGENT';
  static const String roleSubAdmin = 'SUB_ADMIN';
  static const String roleSuperAdmin = 'SUPER_ADMIN';

  // Payment Status
  static const String paymentStatusPending = 'PENDING';
  static const String paymentStatusPaid = 'PAID';

  // Date Formats
  static const String dateFormat = 'yyyy-MM-dd';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
}
