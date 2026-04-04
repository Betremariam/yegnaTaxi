import 'package:flutter/material.dart';

class BalanceCard extends StatelessWidget {
  final String title;
  final double balance;
  final String currency;
  final Color? color;
  final VoidCallback? onTap;

  const BalanceCard({
    super.key,
    required this.title,
    required this.balance,
    this.currency = 'ETB',
    this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              Text(
                '$currency ${balance.toStringAsFixed(2)}',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
