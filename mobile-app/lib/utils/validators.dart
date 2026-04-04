class Validators {
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return 'Please enter $fieldName';
    }
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter email';
    }

    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter phone number';
    }

    // Ethiopian phone number validation (starts with +251 or 09 and has 9 digits after)
    final phoneRegex = RegExp(r'^(\+251|09)\d{8}$');
    if (!phoneRegex.hasMatch(value)) {
      return 'Please enter a valid Ethiopian phone number';
    }

    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter password';
    }

    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  }

  static String? validateAmount(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter amount';
    }

    final amount = double.tryParse(value);
    if (amount == null || amount <= 0) {
      return 'Please enter a valid amount';
    }

    return null;
  }

  static String? validateUserId(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter user ID';
    }

    // User ID validation (starts with P, D, A, SA, SUA followed by numbers)
    final idRegex = RegExp(r'^(P|D|A|SA|SUA)\d+$');
    if (!idRegex.hasMatch(value)) {
      return 'Please enter a valid user ID';
    }

    return null;
  }
}
