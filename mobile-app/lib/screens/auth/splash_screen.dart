import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/storage_service.dart';
import 'login_screen.dart';
import '../driver/driver_main.dart';
import '../admin/sub_admin_home.dart';
import '../passenger/passenger_home.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(seconds: 2));
    
    final storageService = StorageService();
    final token = await storageService.getToken();
    final user = await storageService.getUser();

    if (!mounted) return;

    if (token != null && user != null) {
      // Navigate based on role
      switch (user.role) {
        case 'DRIVER':
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const DriverMain()),
          );
          break;
        case 'SUB_ADMIN':
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const SubAdminHome()),
          );
          break;
        case 'PASSENGER':
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const PassengerHome()),
          );
          break;
        default:
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const LoginScreen()),
          );
      }
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.local_taxi,
              size: 100,
              color: Theme.of(context).primaryColor,
            ),
            const SizedBox(height: 20),
            const Text(
              'Yegna Taxi - Driver',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

