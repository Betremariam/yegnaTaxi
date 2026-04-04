import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/transaction_model.dart';
import '../services/api_service.dart';

class TransactionState {
  final List<Transaction> transactions;
  final bool isLoading;
  final String? error;

  TransactionState({
    required this.transactions,
    required this.isLoading,
    this.error,
  });

  TransactionState copyWith({
    List<Transaction>? transactions,
    bool? isLoading,
    String? error,
  }) {
    return TransactionState(
      transactions: transactions ?? this.transactions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class TransactionNotifier extends StateNotifier<TransactionState> {
  final ApiService _apiService = ApiService();

  TransactionNotifier()
      : super(TransactionState(transactions: [], isLoading: false));

  Future<void> fetchTransactions(
      {String? type, String? startDate, String? endDate}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final Map<String, dynamic> queryParams = {};
      if (type != null) queryParams['type'] = type;
      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;

      final response = await _apiService.get('/transactions/history', params: queryParams);

      if (response['success'] == true) {
        final List<dynamic> data = response['data'];
        final transactions =
            data.map((item) => Transaction.fromJson(item)).toList();
        state = state.copyWith(transactions: transactions, isLoading: false);
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to fetch transactions');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final transactionProvider =
    StateNotifierProvider<TransactionNotifier, TransactionState>((ref) {
  return TransactionNotifier();
});
