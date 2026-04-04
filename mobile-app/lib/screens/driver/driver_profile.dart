import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/balance_provider.dart';
import '../shared/change_password.dart';
import '../auth/login_screen.dart';
import 'driver_balance.dart';

class DriverProfile extends ConsumerStatefulWidget {
  const DriverProfile({super.key});

  @override
  ConsumerState<DriverProfile> createState() => _DriverProfileState();
}

class _DriverProfileState extends ConsumerState<DriverProfile> {
  @override
  void initState() {
    super.initState();
    // Fetch balance when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(balanceProvider.notifier).fetchBalance();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final balanceState = ref.watch(balanceProvider);
    final user = authState.user;

    // Get balance from API or fallback to user balance
    final earnings = balanceState.balance?.totalEarnings ?? 
                          (user?.totalEarnings ?? 0.0);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const CircleAvatar(
                      radius: 40,
                      child: Icon(Icons.person, size: 40),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user?.name ?? '',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'ID: ${user?.userId ?? ''}',
                      style: const TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      user?.phone ?? '',
                      style: const TextStyle(fontSize: 16),
                    ),
                    const Divider(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Plate Number:'),
                        Text(
                          user?.licensePlate ?? 'Not Assigned',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Assigned Stations:'),
                        Text(
                          user?.fermatas != null && user!.fermatas!.isNotEmpty
                              ? user.fermatas!.map((f) => f.name).join(', ')
                              : 'Not Assigned',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 16),
                    const Text(
                      'Earnings Summary',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Earnings:'),
                        Text(
                          '${user?.totalEarnings?.toStringAsFixed(2) ?? '0.00'} ETB',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.account_balance_wallet, color: Colors.green),
                    title: const Text('Total Earnings'),
                    subtitle: balanceState.isLoading
                        ? const Text('Loading...')
                        : Text('${earnings.toStringAsFixed(2)} ETB'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const DriverBalance()),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.lock),
                    title: const Text('Change Password'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const ChangePasswordScreen()),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.logout, color: Colors.red),
                    title: const Text('Logout',
                        style: TextStyle(color: Colors.red)),
                    onTap: () async {
                      final authNotifier = ref.read(authProvider.notifier);
                      await authNotifier.logout();
                      if (context.mounted) {
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const LoginScreen()),
                          (route) => false,
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
