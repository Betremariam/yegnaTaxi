import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class UserState {
  final User? user;
  final List<User> users;
  final bool isLoading;
  final String? error;

  UserState({
    this.user,
    required this.users,
    required this.isLoading,
    this.error,
  });

  UserState copyWith({
    User? user,
    List<User>? users,
    bool? isLoading,
    String? error,
  }) {
    return UserState(
      user: user ?? this.user,
      users: users ?? this.users,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class UserNotifier extends StateNotifier<UserState> {
  final ApiService _apiService = ApiService();

  UserNotifier() : super(UserState(users: [], isLoading: false));

  Future<void> fetchUserProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.get('/auth/profile');

      if (response['success'] == true) {
        final data = response['data'];
        final user = User.fromJson(data);
        state = state.copyWith(user: user, isLoading: false);
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to fetch user profile');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> updateUserProfile(Map<String, dynamic> updates) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.put('/users/profile', updates);

      if (response['success'] == true) {
        // Refresh user profile after update
        await fetchUserProfile();
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to update profile');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> registerPassenger(
      String name, String phone, String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/users/register-passenger', {
        'name': name,
        'phone': phone,
        'email': email,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to register passenger');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> topUpPassenger(String passengerId, double amount) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/transactions/top-up', {
        'passengerId': passengerId,
        'amount': amount,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to top up passenger');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<User?> getPassengerByQrCode(String qrCode) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      print('DEBUG: Requesting passenger lookup for QR code: $qrCode');
      final response = await _apiService.post('/users/lookup-passenger', {
        'nationalId': qrCode,
      });
      print('DEBUG: Lookup response success: ${response['success']}');

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return User.fromJson(response['data']);
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to lookup passenger');
        return null;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }

  Future<bool> chargePassenger(String qrCode, double amount, {String? stationId}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/transactions/fare-payment', {
        'nationalId': qrCode,
        'amount': amount,
        'stationId': stationId,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to charge passenger');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> refundToPassenger(String qrCode, double amount) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/transactions/refund', {
        'nationalId': qrCode,
        'amount': amount,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to refund passenger');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

final userProvider = StateNotifierProvider<UserNotifier, UserState>((ref) {
  return UserNotifier();
});
