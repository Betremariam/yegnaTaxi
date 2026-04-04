import 'package:flutter/material.dart';
import '../config/app_colors.dart';

/// Animated gradient background for consistent app-wide aesthetics
class GradientBackground extends StatelessWidget {
  final Widget child;
  final Gradient? gradient;
  final List<Color>? colors;

  const GradientBackground({
    super.key,
    required this.child,
    this.gradient,
    this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      decoration: BoxDecoration(
        gradient: gradient ??
            (colors != null
                ? LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: colors!,
                  )
                : (isDark
                    ? AppColors.backgroundGradient
                    : const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Color(0xFFF8FAFC),
                          Color(0xFFE2E8F0),
                        ],
                      ))),
      ),
      child: child,
    );
  }
}
