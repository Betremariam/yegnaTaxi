import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import '../../widgets/modern_bottom_nav.dart';
import '../../widgets/gradient_background.dart';
import '../../config/app_colors.dart';
import 'driver_home.dart';
import 'driver_balance.dart';
import 'driver_profile.dart';
import '../shared/transaction_history_screen.dart';
import '../shared/ai_chat_screen.dart';

/// Main driver screen with GNav bottom navigation
class DriverMain extends ConsumerStatefulWidget {
  const DriverMain({super.key});

  @override
  ConsumerState<DriverMain> createState() => _DriverMainState();
}

class _DriverMainState extends ConsumerState<DriverMain> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    DriverHome(),
    TransactionHistoryScreen(title: 'My Trips', filterType: 'FARE_PAYMENT'),
    DriverBalance(),
    TransactionHistoryScreen(title: 'All Transactions'),
    DriverProfile(),
  ];

  final List<String> _titles = const [
    'Dashboard',
    'Trips',
    'Balance',
    'History',
    'Profile',
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      extendBody: true,
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GradientBackground(
        child: _screens[_selectedIndex],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AiChatScreen()),
          );
        },
        backgroundColor: AppColors.accentYellow,
        child: const Icon(Icons.chat_bubble_rounded, color: Colors.black),
      ),
      bottomNavigationBar: ModernBottomNav(
        gap: 6,
        iconSize: 20,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        selectedIndex: _selectedIndex,
        onTabChange: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        tabs: [
          GButton(
            icon: Icons.dashboard_rounded,
            text: 'Home',
            iconActiveColor: isDark ? AppColors.accentYellow : AppColors.primaryBase,
            iconColor: isDark ? AppColors.textTertiary : Colors.grey.shade600,
          ),
          GButton(
            icon: Icons.directions_car_rounded,
            text: 'Trips',
            iconActiveColor: isDark ? AppColors.accentYellow : AppColors.primaryBase,
            iconColor: isDark ? AppColors.textTertiary : Colors.grey.shade600,
          ),
          GButton(
            icon: Icons.account_balance_wallet_rounded,
            text: 'Balance',
            iconActiveColor: isDark ? AppColors.accentYellow : AppColors.primaryBase,
            iconColor: isDark ? AppColors.textTertiary : Colors.grey.shade600,
          ),
          GButton(
            icon: Icons.history_rounded,
            text: 'History',
            iconActiveColor: isDark ? AppColors.accentYellow : AppColors.primaryBase,
            iconColor: isDark ? AppColors.textTertiary : Colors.grey.shade600,
          ),
          GButton(
            icon: Icons.person_rounded,
            text: 'Profile',
            iconActiveColor: isDark ? AppColors.accentYellow : AppColors.primaryBase,
            iconColor: isDark ? AppColors.textTertiary : Colors.grey.shade600,
          ),
        ],
      ),
    );
  }
}
