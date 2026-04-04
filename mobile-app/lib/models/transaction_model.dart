class Transaction {
  final String id;
  final String userId;
  final String type;
  final double amount;
  final String? description;
  final String? relatedUserId;
  final String? relatedUserName;
  final DateTime createdAt;

  Transaction({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    this.description,
    this.relatedUserId,
    this.relatedUserName,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      type: json['type'] ?? '',
      amount: double.tryParse(json['amount'].toString()) ?? 0.0,
      description: json['description'],
      relatedUserId: json['relatedUserId'],
      relatedUserName: json['relatedUser']?['name'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

