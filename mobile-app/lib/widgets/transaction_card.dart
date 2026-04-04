import 'package:flutter/material.dart';

class TransactionCard extends StatelessWidget {
  final String title;
  final String description;
  final double amount;
  final DateTime date;
  final bool isCredit;
  final VoidCallback? onTap;

  const TransactionCard({
    super.key,
    required this.title,
    required this.description,
    required this.amount,
    required this.date,
    required this.isCredit,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        title: Text(title),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(description),
            Text(
              '${date.day}/${date.month}/${date.year}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        trailing: Text(
          '${isCredit ? '+' : '-'}${amount.toStringAsFixed(2)} ETB',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isCredit ? Colors.green : Colors.red,
          ),
        ),
      ),
    );
  }
}
