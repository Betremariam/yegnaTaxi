class User {
  final String id;
  final String name;
  final String phone;
  final String role;
  final String userId;
  final bool isFirstLogin;
  final bool isVerified;
  final String? photoUrl; // URL for passenger profile photo
  final double balance;
  final double? totalEarnings;
  final String? nationalId;
  final String? licensePlate;
  final String? carModel;
  final List<Fermata>? fermatas;
  final String? fermataId;
  final Fermata? fermata;
 
   User({
     required this.id,
     required this.name,
     required this.phone,
     required this.role,
     required this.userId,
     required this.isFirstLogin,
     this.isVerified = false,
     this.photoUrl,
     this.balance = 0.0,
     this.totalEarnings,
     this.nationalId,
     this.licensePlate,
     this.carModel,
     this.fermatas,
     this.fermataId,
     this.fermata,
   });
 
   factory User.fromJson(Map<String, dynamic> json) {
     return User(
       id: json['id'] ?? '',
       name: json['name'] ?? '',
       phone: json['phone'] ?? '',
       role: json['role'] ?? '',
       userId: json['userId'] ?? '',
       isFirstLogin: json['isFirstLogin'] ?? false,
       isVerified: json['isVerified'] ?? false,
       photoUrl: json['photoUrl'],
       balance: json['balance'] is Map
           ? (double.tryParse(json['balance']['currentBalance'].toString()) ?? 0.0)
           : (double.tryParse(json['balance'].toString()) ?? 0.0),
       totalEarnings: json['totalEarnings'] != null
           ? double.tryParse(json['totalEarnings'].toString())
           : null,
       nationalId: json['nationalId'],
       licensePlate: json['licensePlate'],
       carModel: json['carModel'],
       fermatas: json['fermatas'] != null 
           ? (json['fermatas'] as List).map((i) => Fermata.fromJson(i)).toList() 
           : null,
       fermataId: json['fermataId'],
       fermata: json['fermata'] != null
           ? Fermata.fromJson(json['fermata'])
           : (json['fermatas'] != null && (json['fermatas'] as List).isNotEmpty
               ? Fermata.fromJson(json['fermatas'][0])
               : null),
     );
   }
 
   Map<String, dynamic> toJson() {
     return {
       'id': id,
       'name': name,
       'phone': phone,
       'role': role,
       'userId': userId,
       'isFirstLogin': isFirstLogin,
       'isVerified': isVerified,
       'photoUrl': photoUrl,
       'balance': balance,
       'totalEarnings': totalEarnings,
       'nationalId': nationalId,
       'licensePlate': licensePlate,
       'carModel': carModel,
       'fermatas': fermatas?.map((f) => f.toJson()).toList(),
       'fermataId': fermataId,
       'fermata': fermata?.toJson(),
     };
   }
 }

class Fermata {
  final String id;
  final String name;
  final double fare;

  Fermata({
    required this.id,
    required this.name,
    required this.fare,
  });

  factory Fermata.fromJson(Map<String, dynamic> json) {
    return Fermata(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      fare: double.tryParse(json['fare'].toString()) ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'fare': fare,
    };
  }
}
