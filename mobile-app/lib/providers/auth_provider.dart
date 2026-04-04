import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthState {
  final User? user;
  final String? token;
  final bool isLoading;
  final String? error;

  AuthState({
    this.user,
    this.token,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    String? token,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  AuthNotifier() : super(AuthState()) {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final token = await _storageService.getToken();
    final user = await _storageService.getUser();
    if (token != null && user != null) {
      state = state.copyWith(token: token, user: user);
    }
  }

  Future<bool> login(String phone, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/login', {
        'phone': phone,
        'password': password,
      });

      if (response['success'] == true) {
        final data = response['data'];
        final user = User.fromJson(data['user']);
        final token = data['token'];

        await _storageService.saveToken(token);
        await _storageService.saveUser(user);

        state = state.copyWith(
          user: user,
          token: token,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Login failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> register(String name, String phone, String email,
      String password, String? photoUrl) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/register', {
        'name': name,
        'phone': phone,
        'email': email,
        'password': password,
        'photoUrl': photoUrl,
      });

      if (response['success'] == true) {
        final data = response['data'];
        final user = User.fromJson(data['user']);
        final token = data['token'];

        // Save to storage only if no verification is required or user is verified
        if (!data['requiresVerification'] || user.isVerified) {
          await _storageService.saveToken(token);
          await _storageService.saveUser(user);

          state = state.copyWith(
            user: user,
            token: token,
            isLoading: false,
          );
        } else {
          // For unverified users, we still save the token for OTP verification
          state = state.copyWith(
            user: user,
            token: token,
            isLoading: false,
          );
        }
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Registration failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> verifyOtp(String email, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/verify-otp', {
        'email': email,
        'otp': otp,
      });

      if (response['success'] == true) {
        final data = response['data'];
        final user = User.fromJson(data['user']);
        final token = data['token'];

        await _storageService.saveToken(token);
        await _storageService.saveUser(user);

        state = state.copyWith(
          user: user,
          token: token,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'OTP verification failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> resendOtp(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/resend-otp', {
        'email': email,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Failed to resend OTP',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> forgotPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/forgot-password', {
        'email': email,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Failed to send reset code',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> resetPassword(
      String email, String otp, String newPassword) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/reset-password', {
        'email': email,
        'otp': otp,
        'newPassword': newPassword,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Failed to reset password',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _storageService.clear();
    state = AuthState();
  }

  Future<bool> fetchProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.get('/auth/profile');

      if (response['success'] == true) {
        final user = User.fromJson(response['data']);

        await _storageService.saveUser(user);

        state = state.copyWith(
          user: user,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Failed to fetch profile',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> changePassword(
      String currentPassword, String newPassword) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/auth/change-password', {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Password change failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
