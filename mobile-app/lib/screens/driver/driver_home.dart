// import 'package:yegna_taxi/screens/shared/qr_scanner.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../../providers/auth_provider.dart';
// import 'driver_balance.dart';
// import 'driver_profile.dart';
// import '../shared/transaction_history_screen.dart';

// class DriverHome extends ConsumerWidget {
//   const DriverHome({super.key});

//   @override
//   Widget build(BuildContext context, WidgetRef ref) {
//     final authState = ref.watch(authProvider);
//     final user = authState.user;

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Driver Dashboard'),
//         actions: [
//           IconButton(
//             icon: const Icon(Icons.account_circle),
//             onPressed: () {
//               Navigator.push(
//                 context,
//                 MaterialPageRoute(builder: (_) => const DriverProfile()),
//               );
//             },
//           ),
//         ],
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.stretch,
//           children: [
//             Card(
//               child: Padding(
//                 padding: const EdgeInsets.all(16.0),
//                 child: Column(
//                   children: [
//                     const Text(
//                       'Welcome,',
//                       style: TextStyle(fontSize: 16, color: Colors.grey),
//                     ),
//                     Text(
//                       user?.name ?? '',
//                       style: const TextStyle(
//                         fontSize: 24,
//                         fontWeight: FontWeight.bold,
//                       ),
//                     ),
//                     const SizedBox(height: 8),
//                     Text(
//                       'ID: ${user?.userId ?? ''}',
//                       style: const TextStyle(fontSize: 14, color: Colors.grey),
//                     ),
//                     const SizedBox(height: 16),
//                     Row(
//                       mainAxisAlignment: MainAxisAlignment.spaceEvenly,
//                       children: [
//                         Column(
//                           children: [
//                             const Text(
//                               'Today',
//                               style:
//                                   TextStyle(fontSize: 14, color: Colors.grey),
//                             ),
//                             Text(
//                               '0.00 ETB',
//                               style: const TextStyle(
//                                 fontSize: 16,
//                                 fontWeight: FontWeight.bold,
//                               ),
//                             ),
//                           ],
//                         ),
//                         Column(
//                           children: [
//                             const Text(
//                               'This Week',
//                               style:
//                                   TextStyle(fontSize: 14, color: Colors.grey),
//                             ),
//                             Text(
//                               '0.00 ETB',
//                               style: const TextStyle(
//                                 fontSize: 16,
//                                 fontWeight: FontWeight.bold,
//                               ),
//                             ),
//                           ],
//                         ),
//                         Column(
//                           children: [
//                             const Text(
//                               'Total',
//                               style:
//                                   TextStyle(fontSize: 14, color: Colors.grey),
//                             ),
//                             Text(
//                               '${user?.totalEarnings?.toStringAsFixed(2) ?? '0.00'} ETB',
//                               style: const TextStyle(
//                                 fontSize: 16,
//                                 fontWeight: FontWeight.bold,
//                               ),
//                             ),
//                           ],
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             const SizedBox(height: 24),
//             GridView.count(
//               crossAxisCount: 2,
//               shrinkWrap: true,
//               physics: const NeverScrollableScrollPhysics(),
//               crossAxisSpacing: 16,
//               mainAxisSpacing: 16,
//               children: [
//                 _buildFeatureCard(
//                   context,
//                   Icons.qr_code_scanner,
//                   'Scan QR Code',
//                   () async {
//                     await Navigator.push(
//                       context,
//                       MaterialPageRoute(
//                         builder: (_) => const QRScanner(),
//                       ),
//                     );
//                   },
//                 ),
//                 _buildFeatureCard(
//                   context,
//                   Icons.account_balance,
//                   'My Balance',
//                   () {
//                     Navigator.push(
//                       context,
//                       MaterialPageRoute(builder: (_) => const DriverBalance()),
//                     );
//                   },
//                 ),
//                 _buildFeatureCard(
//                   context,
//                   Icons.history,
//                   'Transaction History',
//                   () {
//                     Navigator.push(
//                       context,
//                       MaterialPageRoute(
//                         builder: (_) => const TransactionHistoryScreen(
//                           title: 'Transaction History',
//                         ),
//                       ),
//                     );
//                   },
//                 ),
//                 _buildFeatureCard(
//                   context,
//                   Icons.directions_car,
//                   'My Trips',
//                   () {
//                     Navigator.push(
//                       context,
//                       MaterialPageRoute(
//                         builder: (_) => const TransactionHistoryScreen(
//                           title: 'My Trips',
//                           filterType: 'FARE_PAYMENT',
//                         ),
//                       ),
//                     );
//                   },
//                 ),
//                 _buildFeatureCard(
//                   context,
//                   Icons.replay_circle_filled,
//                   'Refund',
//                   () => _handleRefund(context),
//                 ),
//               ],
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Future<void> _handleRefund(BuildContext context) async {
//     final amount = await _showAmountInputDialog(context);
//     if (amount == null || amount <= 0) return;

//     if (context.mounted) {
//       Navigator.push(
//         context,
//         MaterialPageRoute(
//           builder: (_) => QRScanner(
//             onQRScanned: (qrCode) {
//               // Close the scanner
//               Navigator.pop(context);

//               // Show success message (simulated refund)
//               ScaffoldMessenger.of(context).showSnackBar(
//                 SnackBar(
//                   content: Text(
//                     'Refund of ${amount.toStringAsFixed(2)} ETB for passenger initiated',
//                   ),
//                   backgroundColor: Colors.green,
//                   duration: const Duration(seconds: 3),
//                 ),
//               );
//             },
//           ),
//         ),
//       );
//     }
//   }

//   Future<double?> _showAmountInputDialog(BuildContext context) async {
//     final controller = TextEditingController();
//     return showDialog<double>(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: const Text('Enter Refund Amount'),
//         content: TextField(
//           controller: controller,
//           keyboardType: const TextInputType.numberWithOptions(decimal: true),
//           autofocus: true,
//           decoration: const InputDecoration(
//             labelText: 'Amount (ETB)',
//             hintText: '0.00',
//             prefixText: 'ETB ',
//             border: OutlineInputBorder(),
//           ),
//         ),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context),
//             child: const Text('Cancel'),
//           ),
//           ElevatedButton(
//             onPressed: () {
//               final amount = double.tryParse(controller.text);
//               Navigator.pop(context, amount);
//             },
//             child: const Text('Next'),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildFeatureCard(
//     BuildContext context,
//     IconData icon,
//     String title,
//     VoidCallback onTap,
//   ) {
//     return Card(
//       child: InkWell(
//         onTap: onTap,
//         borderRadius: BorderRadius.circular(8),
//         child: Padding(
//           padding: const EdgeInsets.all(16.0),
//           child: Column(
//             mainAxisAlignment: MainAxisAlignment.center,
//             children: [
//               Icon(icon, size: 40, color: Theme.of(context).primaryColor),
//               const SizedBox(height: 8),
//               Text(
//                 title,
//                 textAlign: TextAlign.center,
//                 style: const TextStyle(fontWeight: FontWeight.w500),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
import 'package:yegna_taxi/screens/shared/qr_scanner.dart';
import 'package:yegna_taxi/screens/shared/refund_scanner.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/balance_provider.dart';
import 'driver_balance.dart';
import 'driver_profile.dart';
import '../shared/transaction_history_screen.dart';

class DriverHome extends ConsumerStatefulWidget {
  const DriverHome({super.key});

  @override
  ConsumerState<DriverHome> createState() => _DriverHomeState();
}

class _DriverHomeState extends ConsumerState<DriverHome> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(balanceProvider.notifier).fetchBalance();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final balanceState = ref.watch(balanceProvider);
    final user = authState.user;
    
    final earnings = balanceState.balance?.totalEarnings ?? user?.totalEarnings ?? 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DriverProfile()),
              );
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
                      'Welcome,',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    Text(
                      user?.name ?? '',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildEarningColumn('Today', earnings),
                        _buildEarningColumn('This Week', earnings),
                        _buildEarningColumn('Total', earnings),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.directions_car, color: Colors.grey, size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          'Vehicle:',
                          style: TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          user?.fermatas != null && user!.fermatas!.isNotEmpty
                              ? user.fermatas!.first.name
                              : 'Not Assigned',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.grey, size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          'Station:',
                          style: TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            user?.fermata?.name ?? 'Not Assigned',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (user?.fermata != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${user?.fermata?.fare.toStringAsFixed(2)} ETB',
                              style: const TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildFeatureCard(
                  context,
                  Icons.qr_code_scanner_rounded,
                  'Scan National ID',
                  Colors.blue,
                  () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const QRScanner(),
                      ),
                    );
                  },
                ),
                _buildFeatureCard(
                  context,
                  Icons.account_balance_wallet_rounded,
                  'My Balance',
                  Colors.green,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DriverBalance()),
                    );
                  },
                ),
                _buildFeatureCard(
                  context,
                  Icons.receipt_long_rounded,
                  'Transaction History',
                  Colors.orange,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const TransactionHistoryScreen(
                          title: 'Transaction History',
                        ),
                      ),
                    );
                  },
                ),
                _buildFeatureCard(
                  context,
                  Icons.history_rounded,
                  'My Trips',
                  Colors.purple,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const TransactionHistoryScreen(
                          title: 'My Trips',
                          filterType: 'FARE_PAYMENT',
                        ),
                      ),
                    );
                  },
                ),
                _buildFeatureCard(
                  context,
                  Icons.replay_circle_filled_rounded,
                  'Refund',
                  Colors.red,
                  () async {
                    final amount = await _showAmountInputDialog(context);
                    if (amount == null || amount <= 0 || !context.mounted) {
                      return;
                    }

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RefundScanner(
                          prefilledAmount: amount,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningColumn(String label, double amount) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 14, color: Colors.grey),
        ),
        Text(
          '${amount.toStringAsFixed(2)} ETB',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Future<double?> _showAmountInputDialog(BuildContext context) async {
    final controller = TextEditingController();
    return showDialog<double>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter Refund Amount'),
        content: TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Amount (ETB)',
            hintText: '0.00',
            prefixText: 'ETB ',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(controller.text);
              Navigator.pop(context, amount);
            },
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(
    BuildContext context,
    IconData icon,
    String title,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 4,
      color: color, // Vibrant solid color background
      shadowColor: color.withOpacity(0.4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 30, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: Colors.white, // High-visibility white text
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
