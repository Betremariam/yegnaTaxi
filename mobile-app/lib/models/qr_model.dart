class QRCode {
  final String id;
  final String code;
  final String? userId;
  final bool isPrinted;
  final String? assignedToAgent;
  final DateTime createdAt;

  QRCode({
    required this.id,
    required this.code,
    this.userId,
    required this.isPrinted,
    this.assignedToAgent,
    required this.createdAt,
  });

  factory QRCode.fromJson(Map<String, dynamic> json) {
    return QRCode(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      userId: json['userId'],
      isPrinted: json['isPrinted'] ?? false,
      assignedToAgent: json['assignedToAgent'],
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'userId': userId,
      'isPrinted': isPrinted,
      'assignedToAgent': assignedToAgent,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
