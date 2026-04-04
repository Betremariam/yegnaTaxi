import 'package:flutter/material.dart';

/// App color constants for the modern UI design
class AppColors {
  // Primary Colors - Deep Blue Gradient
  static const Color primaryDark = Color(0xFF0A1128);
  static const Color primaryBase = Color(0xFF1E3A8A);
  static const Color primaryLight = Color(0xFF3B82F6);
  
  // Accent Colors - Vibrant Yellow/Orange
  static const Color accentYellow = Color(0xFFFBBF24);
  static const Color accentOrange = Color(0xFFF59E0B);
  static const Color accentAmber = Color(0xFFFFBF00);
  
  // Background Colors
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color backgroundMedium = Color(0xFF1E293B);
  static const Color backgroundLight = Color(0xFF334155);
  
  // Surface Colors (for cards, etc.)
  static const Color surfaceDark = Color(0xFF1E293B);
  static const Color surfaceLight = Color(0xFF475569);
  
  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFCBD5E1);
  static const Color textTertiary = Color(0xFF94A3B8);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  
  // Glassmorphism
  static const Color glassBackground = Color(0x1AFFFFFF);
  static const Color glassBorder = Color(0x33FFFFFF);
  
  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryBase, primaryLight],
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accentOrange, accentYellow],
  );
  
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [backgroundDark, backgroundMedium],
  );
  
  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
    stops: [0.0, 1.0],
  );
  
  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF059669), Color(0xFF10B981)],
  );
  
  static const LinearGradient warningGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
  );
}
