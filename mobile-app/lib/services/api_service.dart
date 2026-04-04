import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String get baseUrl => AppConfig.apiBaseUrl;

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> get(String endpoint,
      {Map<String, dynamic>? params}) async {
    try {
      var uri = Uri.parse('$baseUrl$endpoint');
      if (params != null && params.isNotEmpty) {
        // Convert all values to strings as required by Uri.replace
        final stringParams = params.map((key, value) => MapEntry(key, value.toString()));
        final newQueryParameters = Map<String, String>.from(uri.queryParameters)
          ..addAll(stringParams);
        uri = uri.replace(queryParameters: newQueryParameters);
      }

      final response = await http.get(
        uri,
        headers: await _getHeaders(),
      );

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ??
            'Request failed with status ${response.statusCode}');
      }
    } on SocketException catch (e) {
      throw Exception('Connection error: Could not reach the server at $baseUrl. '
          'Please ensure the server is running and your device is on the same network. '
          'Details: ${e.message}');
    } on TimeoutException {
      throw Exception('Request timeout. Please check your network speed and try again.');
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> post(
      String endpoint, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      final data = json.decode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return data;
      } else {
        throw Exception(data['message'] ??
            'Request failed with status ${response.statusCode}');
      }
    } on SocketException catch (e) {
      throw Exception('Connection error: Could not reach the server at $baseUrl. '
          'Please ensure the server is running and your device is on the same network. '
          'Details: ${e.message}');
    } on TimeoutException {
      throw Exception('Request timeout. Please check your network speed and try again.');
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> put(
      String endpoint, Map<String, dynamic> body) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      final data = json.decode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return data;
      } else {
        throw Exception(data['message'] ??
            'Request failed with status ${response.statusCode}');
      }
    } on SocketException {
      throw Exception('No internet connection. Please check your network.');
    } on TimeoutException {
      throw Exception('Request timeout. Please try again.');
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }
}
