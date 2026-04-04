class Balance {
  final String id;
  final String userId;
  final double currentBalance;
  final double? commissionBalance;
  final double? totalEarnings;
  final double? totalCommission;
  final DateTime createdAt;
  final DateTime updatedAt;

  Balance({
    required this.id,
    required this.userId,
    required this.currentBalance,
    this.commissionBalance,
    this.totalEarnings,
    this.totalCommission,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Balance.fromJson(Map<String, dynamic> json) {
    return Balance(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      currentBalance: double.tryParse(json['currentBalance'].toString()) ?? 0.0,
      commissionBalance: json['commissionBalance'] != null
          ? double.tryParse(json['commissionBalance'].toString())
          : null,
      totalEarnings: json['totalEarnings'] != null
          ? double.tryParse(json['totalEarnings'].toString())
          : null,
      totalCommission: json['totalCommission'] != null
          ? double.tryParse(json['totalCommission'].toString())
          : null,
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt:
          DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'currentBalance': currentBalance,
      'commissionBalance': commissionBalance,
      'totalEarnings': totalEarnings,
      'totalCommission': totalCommission,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
