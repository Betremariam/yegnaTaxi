// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'screens/auth/splash_screen.dart';
// import 'package:uni_links/uni_links.dart';

// void main() {
//   runApp(const ProviderScope(child: MyApp()));
// }

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Yegna Taxi',
//       theme: ThemeData(
//         primarySwatch: Colors.blue,
//         useMaterial3: true,
//         colorScheme: ColorScheme.fromSeed(
//           seedColor: Colors.blue,
//           primary: Colors.blue,
//           secondary: Colors.orange,
//         ),
//         inputDecorationTheme: const InputDecorationTheme(
//           errorStyle: TextStyle(color: Colors.redAccent),
//           focusedBorder: OutlineInputBorder(
//             borderSide: BorderSide(color: Colors.blue),
//           ),
//           enabledBorder: OutlineInputBorder(
//             borderSide: BorderSide(color: Colors.grey),
//           ),
//           errorBorder: OutlineInputBorder(
//             borderSide: BorderSide(color: Colors.redAccent),
//           ),
//         ),
//       ),
//       home: const SplashScreen(),
//       debugShowCheckedModeBanner: false,
//     );
//   }
import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app_links/app_links.dart';

import 'config/app_theme.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/wallet/payment_success_screen.dart';
import 'screens/wallet/payment_failed_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // For Web, detect query parameters on initial load
  if (kIsWeb) {
    final uri = Uri.base;
    if (uri.path == '/payment-success') {
      final amount =
          double.tryParse(uri.queryParameters['amount'] ?? '0') ?? 0.0;
      runApp(
        ProviderScope(
          child: MaterialApp(home: PaymentSuccessScreen(amount: amount)),
        ),
      );
      return;
    } else if (uri.path == '/payment-failed') {
      runApp(
        const ProviderScope(
          child: MaterialApp(home: PaymentFailedScreen()),
        ),
      );
      return;
    }
  }

  // Default app start
  runApp(const ProviderScope(child: MyApp()));
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  StreamSubscription? _sub;
  final AppLinks _appLinks = AppLinks();

  @override
  void initState() {
    super.initState();
    _handleIncomingLinks();
  }

  void _handleIncomingLinks() {
    if (!kIsWeb) {
      // Handle deep links when app is in background
      _sub = _appLinks.stringLinkStream.listen((String? link) {
        if (link == null) return;
        _handleLink(link);
      }, onError: (err) {
        debugPrint('Deep link error: $err');
      });

      // Handle deep links when app is cold started
      _appLinks.getInitialLink().then((Uri? uri) {
        if (uri != null) {
          _handleLink(uri.toString());
        }
      }).catchError((err) {
        debugPrint('Deep link initial error: $err');
      });
    }
  }

  void _handleLink(String link) {
    try {
      Uri uri = Uri.parse(link);
      if (uri.host == 'payment') {
        // Matching betre://payment
        final status =
            uri.queryParameters['status']; // captured from backend/chapa
        // Note: Chapa might not send amount back unless we put it in state or custom param
        // For now, we rely on the URL or default to 0.0
        final amount = uri.queryParameters['amount'];
        final amountDouble = double.tryParse(amount ?? '0') ?? 0.0;

        // We use the navigatorKey because context here is above MaterialApp
        if (uri.path == '/callback' || uri.host == 'payment') {
          // Be flexible
          if (status == 'success' || uri.toString().contains('success')) {
            navigatorKey.currentState?.push(
              MaterialPageRoute(
                builder: (_) => PaymentSuccessScreen(amount: amountDouble),
              ),
            );
          } else {
            navigatorKey.currentState?.push(
              MaterialPageRoute(
                builder: (_) => const PaymentFailedScreen(),
              ),
            );
          }
        }
      }
    } catch (e) {
      debugPrint('Error handling link: $e');
    }
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey, // Important!
      title: 'Yegna Taxi',
      theme: AppTheme.darkTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      home: const SplashScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
