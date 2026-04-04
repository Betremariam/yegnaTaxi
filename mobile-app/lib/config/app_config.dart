class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL',
      //defaultValue: 'https://yegna-taxi.onrender.com/api',
      //defaultValue: 'http://localhost:5000/api',
      defaultValue: 'http://192.168.43.237:5000/api'
      //defaultValue: 'http://10.139.23.18:5000/api' 
    
  );

  static const String appName = 'Yegna Taxi';
}
