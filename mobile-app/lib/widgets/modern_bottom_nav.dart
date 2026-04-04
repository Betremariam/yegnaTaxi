import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import '../config/app_colors.dart';

/// Modern bottom navigation component using GNav
class ModernBottomNav extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onTabChange;
  final List<GButton> tabs;
  final Color? backgroundColor;
  final Color? activeColor;
  final Color? inactiveColor;
  final EdgeInsetsGeometry? padding;
  final double? gap;
  final double? iconSize;

  const ModernBottomNav({
    super.key,
    required this.selectedIndex,
    required this.onTabChange,
    required this.tabs,
    this.backgroundColor,
    this.activeColor,
    this.inactiveColor,
    this.padding,
    this.gap,
    this.iconSize,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ??
            (isDark ? AppColors.surfaceDark : Colors.white),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.1),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: GNav(
            selectedIndex: selectedIndex,
            onTabChange: onTabChange,
            gap: gap ?? 8,
            activeColor: activeColor ??
                (isDark ? AppColors.textPrimary : AppColors.primaryBase),
            color: inactiveColor ??
                (isDark ? AppColors.textTertiary : Colors.grey.shade600),
            iconSize: iconSize ?? 24,
            padding: padding ?? const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            duration: const Duration(milliseconds: 400),
            tabBackgroundColor: (activeColor ?? AppColors.primaryLight)
                .withOpacity(isDark ? 0.2 : 0.1),
            tabBorderRadius: 12,
            curve: Curves.easeInOut,
            tabs: tabs,
          ),
        ),
      ),
    );
  }
}
