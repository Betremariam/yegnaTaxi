import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/balance_model.dart';
import '../services/api_service.dart';

class BalanceState {
  final Balance? balance;
  final bool isLoading;
  final String? error;

  BalanceState({
    this.balance,
    required this.isLoading,
    this.error,
  });

  BalanceState copyWith({
    Balance? balance,
    bool? isLoading,
    String? error,
  }) {
    return BalanceState(
      balance: balance ?? this.balance,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class BalanceNotifier extends StateNotifier<BalanceState> {
  final ApiService _apiService = ApiService();

  BalanceNotifier() : super(BalanceState(isLoading: false));

  Future<void> fetchBalance() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.get('/balance');

      if (response['success'] == true) {
        final data = response['data'];
        final balance = Balance.fromJson(data);
        state = state.copyWith(balance: balance, isLoading: false);
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to fetch balance');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> initializeDeposit(double amount) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService
          .post('/balance/deposit/initialize', {'amount': amount});

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        // Return checkout URL or other relevant data
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to initialize deposit');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> verifyDeposit(String txRef) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response =
          await _apiService.post('/balance/deposit/verify', {'txRef': txRef});

      if (response['success'] == true) {
        // Refresh balance after successful deposit
        await fetchBalance();
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to verify deposit');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

final balanceProvider =
    StateNotifierProvider<BalanceNotifier, BalanceState>((ref) {
  return BalanceNotifier();
});
