import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/user_model.dart';
import '../../widgets/transaction_history_list.dart';

class UserDetailsScreen extends StatefulWidget {
  final String userId; // The database UUID
  final String userName;

  const UserDetailsScreen({
    super.key,
    required this.userId,
    required this.userName,
  });

  @override
  State<UserDetailsScreen> createState() => _UserDetailsScreenState();
}

class _UserDetailsScreenState extends State<UserDetailsScreen> {
  final ApiService _apiService = ApiService();
  User? _user;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUserDetails();
  }

  Future<void> _fetchUserDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _apiService.get('/users/${widget.userId}');

      if (response['success'] == true) {
        if (mounted) {
          setState(() {
            _user = User.fromJson(response['data']);
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _error = response['message'] ?? 'Failed to load user details';
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
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.userName),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: $_error'),
                      ElevatedButton(
                        onPressed: _fetchUserDetails,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // User Info Card
                      Card(
                        margin: const EdgeInsets.all(16),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 30,
                                child: Text(
                                  _user?.name[0].toUpperCase() ?? '',
                                  style: const TextStyle(fontSize: 24),
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                _user?.name ?? '',
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                _user?.role ?? '',
                                style: const TextStyle(color: Colors.grey),
                              ),
                              const SizedBox(height: 16),
                              _buildInfoRow('Phone', _user?.phone ?? ''),
                              _buildInfoRow('National ID', _user?.nationalId ?? 'N/A'),
                              if (_user?.role == 'DRIVER') ...[
                                _buildInfoRow('License Plate', _user?.licensePlate ?? 'N/A'),
                                _buildInfoRow('Car Model', _user?.carModel ?? 'N/A'),
                              ],
                              _buildInfoRow('User ID', _user?.userId ?? ''),
                              const Divider(),
                              const SizedBox(height: 8),
                              const Text(
                                'Current Balance',
                                style: TextStyle(color: Colors.grey),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_user?.balance.toStringAsFixed(2) ?? '0.00'} ETB',
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      // Transactions Section
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.0),
                        child: Text(
                          'Transactions',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Transaction List with specific userId
                      TransactionHistoryList(
                        userId: widget.userId,
                        scrollable: false, // Inside SingleChildScrollView
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
