import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/user_model.dart';
import 'user_details_screen.dart';
import '../auth/login_screen.dart';
import '../shared/ai_chat_screen.dart';

class SubAdminHome extends ConsumerStatefulWidget {
  const SubAdminHome({super.key});

  @override
  ConsumerState<SubAdminHome> createState() => _SubAdminHomeState();
}

class _SubAdminHomeState extends ConsumerState<SubAdminHome> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  List<User> _users = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers([String? query]) async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final params = <String, dynamic>{};
      if (query != null && query.isNotEmpty) {
        params['search'] = query;
      }

      final response = await _apiService.get('/users', params: params);

      if (response['success'] == true) {
        final List<dynamic> data = response['data'];
        if (mounted) {
          setState(() {
            _users = data.map((json) => User.fromJson(json)).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _error = response['message'] ?? 'Failed to fetch users';
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
        title: const Text('Sub Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology_outlined),
            tooltip: 'AI Assistant',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AiChatScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Search Users',
                hintText: 'Name, Phone, or ID',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _fetchUsers();
                  },
                ),
                border: const OutlineInputBorder(),
              ),
              onSubmitted: (value) => _fetchUsers(value),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Error: $_error',
                              style: const TextStyle(color: Colors.red),
                            ),
                            ElevatedButton(
                              onPressed: () => _fetchUsers(_searchController.text),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => _fetchUsers(_searchController.text),
                        child: ListView.separated(
                          itemCount: _users.length,
                          separatorBuilder: (context, index) => const Divider(),
                          itemBuilder: (context, index) {
                            final user = _users[index];
                            return ListTile(
                              leading: CircleAvatar(
                                child: Text(user.name[0].toUpperCase()),
                              ),
                              title: Text(user.name),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${user.role} • ${user.phone}'),
                                  Text(
                                    'ID: ${user.userId}',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                ],
                              ),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => UserDetailsScreen(
                                      userId: user.id,
                                      userName: user.name,
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
