import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    // Save individual fields for easier access
    await prefs.setString('user_id', user.id);
    await prefs.setString('user_name', user.name);
    await prefs.setString('user_phone', user.phone);
    await prefs.setString('user_role', user.role);
    await prefs.setString('user_userId', user.userId);
    
    if (user.nationalId != null) {
      await prefs.setString('user_nationalId', user.nationalId!);
    }
    if (user.licensePlate != null) {
      await prefs.setString('user_licensePlate', user.licensePlate!);
    }
    if (user.carModel != null) {
      await prefs.setString('user_carModel', user.carModel!);
    }
    if (user.fermataId != null) {
      await prefs.setString('user_fermataId', user.fermataId!);
    }
    
    if (user.photoUrl != null) {
      await prefs.setString('user_photoUrl', user.photoUrl!);
    }
    await prefs.setBool('user_isFirstLogin', user.isFirstLogin);
    await prefs.setDouble('user_balance', user.balance);
    
    if (user.totalEarnings != null) {
      await prefs.setDouble('user_totalEarnings', user.totalEarnings!);
    }
  }

  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString('user_id');
    if (id == null) return null;

    return User(
      id: id,
      name: prefs.getString('user_name') ?? '',
      phone: prefs.getString('user_phone') ?? '',
      role: prefs.getString('user_role') ?? '',
      userId: prefs.getString('user_userId') ?? '',
      nationalId: prefs.getString('user_nationalId'),
      licensePlate: prefs.getString('user_licensePlate'),
      carModel: prefs.getString('user_carModel'),
      fermataId: prefs.getString('user_fermataId'),
      photoUrl: prefs.getString('user_photoUrl'),
      isFirstLogin: prefs.getBool('user_isFirstLogin') ?? false,
      balance: prefs.getDouble('user_balance') ?? 0.0,
      totalEarnings: prefs.getDouble('user_totalEarnings'),
    );
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    await prefs.remove('user_id');
    await prefs.remove('user_name');
    await prefs.remove('user_phone');
    await prefs.remove('user_role');
    await prefs.remove('user_userId');
    await prefs.remove('user_nationalId');
    await prefs.remove('user_licensePlate');
    await prefs.remove('user_carModel');
    await prefs.remove('user_fermataId');
    await prefs.remove('user_photoUrl');
    await prefs.remove('user_isFirstLogin');
    await prefs.remove('user_balance');
    await prefs.remove('user_totalEarnings');
  }
}
