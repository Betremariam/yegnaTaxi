import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

class QRState {
  final String? qrCode;
  final String? qrImage;
  final bool isLoading;
  final String? error;

  QRState({
    this.qrCode,
    this.qrImage,
    required this.isLoading,
    this.error,
  });

  QRState copyWith({
    String? qrCode,
    String? qrImage,
    bool? isLoading,
    String? error,
  }) {
    return QRState(
      qrCode: qrCode ?? this.qrCode,
      qrImage: qrImage ?? this.qrImage,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class QRNotifier extends StateNotifier<QRState> {
  final ApiService _apiService = ApiService();

  QRNotifier() : super(QRState(isLoading: false));

  Future<void> fetchMyQRCode() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.get('/qr/my-qr');

      if (response['success'] == true) {
        final data = response['data'];
        state = state.copyWith(
          qrCode: data['code'],
          qrImage: data['image'],
          isLoading: false,
        );
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to fetch QR code');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> scanQRCode(String qrCode) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.post('/qr/scan', {'qrCode': qrCode});

      if (response['success'] == true) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
            isLoading: false,
            error: response['message'] ?? 'Failed to scan QR code');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

final qrProvider = StateNotifierProvider<QRNotifier, QRState>((ref) {
  return QRNotifier();
});
