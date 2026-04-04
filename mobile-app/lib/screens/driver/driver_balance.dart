import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/balance_provider.dart';

class DriverBalance extends ConsumerStatefulWidget {
  const DriverBalance({super.key});

  @override
  ConsumerState<DriverBalance> createState() => _DriverBalanceState();
}

class _DriverBalanceState extends ConsumerState<DriverBalance> {
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
    final balanceState = ref.watch(balanceProvider);
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Balance'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(balanceProvider.notifier).fetchBalance();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Text(
                      'Current Earnings',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 8),
                    if (balanceState.isLoading)
                      const CircularProgressIndicator()
                    else if (balanceState.error != null)
                      Text(
                        'Error: ${balanceState.error}',
                        style: const TextStyle(color: Colors.red),
                      )
                    else
                      Text(
                        '${(balanceState.balance?.totalEarnings ?? user?.totalEarnings ?? 0.0).toStringAsFixed(2)} ETB',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 16),
                    const Text(
                      'Payment Status',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Pending Payment',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Next payment cycle: Every 3 days',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Recent Transactions',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Placeholder for transaction list
                    const Center(
                      child: Text(
                        'No recent transactions',
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
