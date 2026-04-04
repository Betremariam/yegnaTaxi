import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/transaction_provider.dart';
import 'package:intl/intl.dart';

class TransactionHistoryScreen extends ConsumerStatefulWidget {
  final String title;
  final String? filterType;

  const TransactionHistoryScreen({
    super.key,
    required this.title,
    this.filterType,
  });

  @override
  ConsumerState<TransactionHistoryScreen> createState() => _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends ConsumerState<TransactionHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(transactionProvider.notifier).fetchTransactions(type: widget.filterType);
    });
  }

  @override
  Widget build(BuildContext context) {
    final transactionState = ref.watch(transactionProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(transactionProvider.notifier).fetchTransactions(type: widget.filterType);
            },
          ),
        ],
      ),
      body: transactionState.isLoading && transactionState.transactions.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : transactionState.error != null && transactionState.transactions.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: ${transactionState.error}'),
                      ElevatedButton(
                        onPressed: () {
                          ref.read(transactionProvider.notifier).fetchTransactions(type: widget.filterType);
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : transactionState.transactions.isEmpty
                  ? const Center(child: Text('No transactions found'))
                  : ListView.builder(
                      itemCount: transactionState.transactions.length,
                      itemBuilder: (context, index) {
                        final transaction = transactionState.transactions[index];
                        final isNegative = transaction.amount < 0;
                        final formattedDate = DateFormat('MMM dd, yyyy HH:mm').format(transaction.createdAt);

                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _getTypeColor(transaction.type).withOpacity(0.1),
                              child: Icon(
                                _getTypeIcon(transaction.type),
                                color: _getTypeColor(transaction.type),
                              ),
                            ),
                            title: Text(
                              transaction.description ?? transaction.type,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(formattedDate),
                                if (transaction.relatedUserName != null)
                                  Text('With: ${transaction.relatedUserName}'),
                              ],
                            ),
                            trailing: Text(
                              '${isNegative ? "" : "+"}${transaction.amount.toStringAsFixed(2)} ETB',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isNegative ? Colors.red : Colors.green,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'FARE_PAYMENT':
        return Icons.directions_car;
      case 'TOP_UP':
        return Icons.account_balance_wallet;
      case 'COMMISSION':
        return Icons.monetization_on;
      case 'DEPOSIT':
        return Icons.add_circle;
      default:
        return Icons.swap_horiz;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'FARE_PAYMENT':
        return Colors.blue;
      case 'TOP_UP':
        return Colors.green;
      case 'COMMISSION':
        return Colors.orange;
      case 'DEPOSIT':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }
}
