import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ChapaService {
  static const String _baseUrl = 'https://api.chapa.co/v1';

  /// Launch Chapa payment URL in browser
  static Future<bool> launchPaymentUrl(String checkoutUrl) async {
    final uri = Uri.parse(checkoutUrl);
    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri);
    } else {
      return false;
    }
  }

  /// Verify payment status
  static Future<Map<String, dynamic>?> verifyPayment(
      String txRef, String secretKey) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/transaction/verify/$txRef'),
        headers: {
          'Authorization': 'Bearer $secretKey',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
