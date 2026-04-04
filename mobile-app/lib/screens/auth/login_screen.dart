import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../driver/driver_main.dart';
import '../admin/sub_admin_home.dart';
import '../passenger/passenger_home.dart';
import '../shared/change_password.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authProvider.notifier);
    final success = await authNotifier.login(
      _phoneController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;

    if (success) {
      final authState = ref.read(authProvider);
      final user = authState.user;

      // if (user?.role != 'DRIVER') {
      //   // App is currently only for drivers
      //   await authNotifier.logout();
      //   if (!context.mounted) return;
      //   ScaffoldMessenger.of(context).showSnackBar(
      //     const SnackBar(
      //       content: Text('Unauthorized role. This app is for drivers only.'),
      //       backgroundColor: Colors.redAccent,
      //       duration: Duration(seconds: 3),
      //     ),
      //   );
      //   return;
      // }

      if (user?.isFirstLogin == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const ChangePasswordScreen(isFirstLogin: true),
          ),
        );
        return;
      }

      // Navigate based on role
      if (user?.role == 'DRIVER') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DriverMain()),
        );
      } else if (user?.role == 'PASSENGER') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const PassengerHome()),
        );
      }
    } else {
      final authState = ref.read(authProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authState.error ?? 'Login failed'),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                Icon(
                  Icons.local_taxi,
                  size: 80,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(height: 20),
                const Text(
                  'Yegna Taxi - Driver',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 40),
                TextFormField(
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone),
                    border: OutlineInputBorder(),
                    errorStyle: TextStyle(color: Colors.redAccent),
                  ),
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your phone number';
                    }
                    if (!RegExp(r'^\+?251[0-9]{9}$|^09[0-9]{8}$')
                        .hasMatch(value)) {
                      return 'Please enter a valid Ethiopian phone number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock),
                    border: OutlineInputBorder(),
                    errorStyle: TextStyle(color: Colors.redAccent),
                  ),
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: authState.isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: authState.isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Login'),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
