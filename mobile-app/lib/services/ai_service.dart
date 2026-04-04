import 'api_service.dart';

class AiService {
  final ApiService _apiService = ApiService();

  Future<String> getChatResponse(String message, [List<Map<String, String>>? history]) async {
    try {
      final response = await _apiService.post('/ai/chat', {
        'message': message,
        if (history != null) 'history': history,
      });

      if (response['success'] == true) {
        return response['data']['response'].toString();
      } else {
        throw Exception(response['message'] ?? 'Failed to get AI response');
      }
    } catch (e) {
      throw Exception('AI Error: $e');
    }
  }
}
