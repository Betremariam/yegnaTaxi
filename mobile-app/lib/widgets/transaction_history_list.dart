import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/transaction_model.dart';
import '../services/api_service.dart';

class TransactionHistoryList extends StatefulWidget {
  final String? userId; // Optional: for admin to view specific user's transactions
  final bool scrollable;

  const TransactionHistoryList({
    super.key,
    this.userId,
    this.scrollable = true,
  });

  @override
  State<TransactionHistoryList> createState() => _TransactionHistoryListState();
}

class _TransactionHistoryListState extends State<TransactionHistoryList> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _error;
  List<Transaction> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchTransactions();
  }

  // Allow parent to refresh
  void refresh() {
    _fetchTransactions();
  }

  Future<void> _fetchTransactions() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final queryParams = <String, dynamic>{};
      if (widget.userId != null) {
        queryParams['userId'] = widget.userId;
      }

      final response = await _apiService.get(
        '/transactions/history',
        params: queryParams,
      );

      if (response['success'] == true) {
        final List<dynamic> data = response['data'];
        if (mounted) {
          setState(() {
            _transactions = data.map((json) => Transaction.fromJson(json)).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _error = response['message'] ?? 'Failed to load transactions';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error', style: const TextStyle(color: Colors.red)),
            ElevatedButton(
              onPressed: _fetchTransactions,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_transactions.isEmpty) {
      return const Center(
        child: Text(
          'No recent transactions',
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: !widget.scrollable,
      physics: widget.scrollable ? null : const NeverScrollableScrollPhysics(),
      itemCount: _transactions.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final tx = _transactions[index];
        final isNegative = tx.amount < 0;
        final formattedDate = DateFormat('MMM d, y HH:mm').format(tx.createdAt);

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: isNegative ? Colors.orange.withOpacity(0.1) : Colors.green.withOpacity(0.1),
            child: Icon(
              isNegative ? Icons.arrow_upward : Icons.arrow_downward,
              color: isNegative ? Colors.orange : Colors.green,
            ),
          ),
          title: Text(
            tx.type.replaceAll('_', ' '),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(formattedDate),
              if (tx.description != null)
                Text(
                  tx.description!,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
            ],
          ),
          trailing: Text(
            '${isNegative ? '' : '+'}${tx.amount.toStringAsFixed(2)} ETB',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isNegative ? Colors.black : Colors.green,
              fontSize: 16,
            ),
          ),
        );
      },
    );
  }
}
