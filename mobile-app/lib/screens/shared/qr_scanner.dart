import 'dart:async';
import 'package:yegna_taxi/providers/balance_provider.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/services.dart';
import '../../providers/user_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/user_model.dart';
import '../../config/app_colors.dart';

class QRScanner extends ConsumerStatefulWidget {
  final Function(String qrData)? onQRScanned;
  const QRScanner({super.key, this.onQRScanned});

  @override
  ConsumerState<QRScanner> createState() => _QRScannerState();
}

class _QRScannerState extends ConsumerState<QRScanner> {
  final MobileScannerController controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    // formats: [BarcodeFormat.qrCode], // Enable all formats for testing
  );
  
  StreamSubscription<BarcodeCapture>? _subscription;
  
  bool isProcessing = false;
  String? errorMessage;
  bool torchEnabled = false;

  @override
  void initState() {
    super.initState();
    _requestCameraPermission();
    _subscription = controller.barcodes.listen(_onDetect);
    debugPrint('Scanner Subscription initialized');
  }

  Future<void> _requestCameraPermission() async {
    try {
      PermissionStatus status = await Permission.camera.status;
      if (!status.isGranted) {
        status = await Permission.camera.request();
      }

      if (status.isGranted) {
        // Explicitly start the controller after permission is granted
        await controller.start();
        if (mounted) setState(() => errorMessage = null);
      } else if (status.isPermanentlyDenied) {
        if (mounted) setState(() => errorMessage = 'Camera permission permanently denied. Please enable it in settings.');
      } else {
        if (mounted) setState(() => errorMessage = 'Camera permission required to scan QR codes');
      }
    } catch (e) {
      if (mounted) setState(() => errorMessage = 'Error initializing camera: $e');
    }
  }

  void _onDetect(BarcodeCapture capture) async {
    if (isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? code = barcodes.first.rawValue;
    if (code == null) {
      debugPrint('Scan detected but rawValue is null');
      return;
    }

    debugPrint('QR Code Scanned: $code');
    setState(() => isProcessing = true);
    HapticFeedback.mediumImpact();

    if (widget.onQRScanned != null) {
      widget.onQRScanned!(code);
      setState(() => isProcessing = false);
      return;
    }

    try {
      final passenger = await ref.read(userProvider.notifier).getPassengerByQrCode(code);

      if (passenger != null) {
        if (mounted) {
          _showChargeSheet(passenger, code);
        }
      } else {
        if (mounted) {
          final error = ref.read(userProvider).error ?? 'Passenger not found';
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error), backgroundColor: Colors.red));
          _resumeScanning();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
        _resumeScanning();
      }
    }
  }

  void _resumeScanning() {
    if (mounted) setState(() => isProcessing = false);
  }

  void _showChargeSheet(User passenger, String qrCode) {
    final driver = ref.read(authProvider).user;
    final List<Fermata> allowedFermatas = driver?.fermatas ?? [];
    Fermata? selectedFermata = driver?.fermata ?? (allowedFermatas.isNotEmpty ? allowedFermatas.first : null);
    
    final amountController = TextEditingController(text: selectedFermata != null ? selectedFermata.fare.toStringAsFixed(2) : '0.00');
    bool isSubmitting = false;
    String fareType = 'Normal';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, borderRadius: const BorderRadius.vertical(top: Radius.circular(32))),
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 24),
              const Text('Charge Passenger', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              
              // Wrap content in SingleChildScrollView for bottom overflow fix
              Flexible(
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: AppColors.primaryBase.withOpacity(0.1),
                            child: Text(passenger.name[0].toUpperCase(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(passenger.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis, maxLines: 1),
                                Text('National ID: ${passenger.nationalId}', style: TextStyle(color: Colors.grey[600], fontSize: 13), overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [AppColors.primaryBase, AppColors.primaryBase.withOpacity(0.8)],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.white.withOpacity(0.2), width: 2), // Visible border
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryBase.withOpacity(0.3),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const Text(
                              'Enter Total Fare',
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: amountController,
                              readOnly: true, // Manual typing disabled to enforce cap
                              decoration: InputDecoration(
                                prefixText: 'ETB ',
                                prefixStyle: const TextStyle(color: Colors.white70, fontSize: 18, fontWeight: FontWeight.bold),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              style: const TextStyle(fontSize: 42, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.5),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Quick Fare Options (Locked to Max Fare)
                      const Align(alignment: Alignment.centerLeft, child: Text("Quick Adjustments", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey))),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildQuickButton(context, '-1', () {
                            final curr = double.tryParse(amountController.text) ?? 0;
                            if (curr >= 1) amountController.text = (curr - 1).toStringAsFixed(2);
                          }),
                          _buildQuickButton(context, '-2', () {
                            final curr = double.tryParse(amountController.text) ?? 0;
                            if (curr >= 2) amountController.text = (curr - 2).toStringAsFixed(2);
                          }),
                          _buildQuickButton(context, '-5', () {
                            final curr = double.tryParse(amountController.text) ?? 0;
                            if (curr >= 5) amountController.text = (curr - 5).toStringAsFixed(2);
                          }),
                          _buildQuickButton(context, '-10', () {
                            final curr = double.tryParse(amountController.text) ?? 0;
                            if (curr >= 10) amountController.text = (curr - 10).toStringAsFixed(2);
                          }),
                          _buildQuickButton(context, 'Reset', () {
                            // Reset to official station fare
                            amountController.text = selectedFermata != null ? selectedFermata.fare.toStringAsFixed(2) : '0.00';
                          }),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isSubmitting ? null : () async {
                    final amount = double.tryParse(amountController.text);
                    if (amount == null || amount <= 0) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid amount')));
                      return;
                    }
                    setSheetState(() => isSubmitting = true);
                    final success = await ref.read(userProvider.notifier).chargePassenger(qrCode, amount, stationId: selectedFermata?.id);
                    if (success) {
                      ref.read(balanceProvider.notifier).fetchBalance();
                      ref.read(transactionProvider.notifier).fetchTransactions();
                      ref.read(authProvider.notifier).fetchProfile();
                      if (context.mounted) {
                        Navigator.pop(context);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment Successful: $amount ETB'), backgroundColor: Colors.green, behavior: SnackBarBehavior.floating));
                      }
                    } else {
                      setSheetState(() => isSubmitting = false);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBase,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    shadowColor: AppColors.primaryBase.withOpacity(0.5),
                  ),
                  child: isSubmitting 
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3)) 
                    : const Text('Confirm Payment', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    ).then((_) => _resumeScanning());
  }

  Widget _buildQuickButton(BuildContext context, String label, VoidCallback onPressed, {bool isFixed = false}) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isFixed ? AppColors.primaryBase.withOpacity(0.1) : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isFixed ? AppColors.primaryBase.withOpacity(0.2) : Colors.grey[300]!, width: 1),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: isFixed ? AppColors.primaryBase : Colors.black87,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(torchEnabled ? Icons.flash_on : Icons.flash_off),
            onPressed: () {
              controller.toggleTorch();
              setState(() => torchEnabled = !torchEnabled);
            },
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      body: errorMessage != null
          ? Center(child: Text(errorMessage!))
          : Stack(
              children: [
                MobileScanner(
                  controller: controller,
                  onDetect: _onDetect,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error) {
                    return Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.white, size: 48),
                          const SizedBox(height: 16),
                          Text(
                            'Scanner Error: ${error.errorCode}',
                            style: const TextStyle(color: Colors.white),
                          ),
                          Text(
                            error.errorDetails?.message ?? 'Unknown error',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: () => _requestCameraPermission(),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  },
                  placeholderBuilder: (context) {
                    return const Center(child: CircularProgressIndicator(color: AppColors.primaryBase));
                  },
                ),
                // Simplified Overlay for better clarity
                _buildScannerOverlay(context),
                if (isProcessing)
                  Positioned.fill(
                    child: Container(color: Colors.black26, child: const Center(child: CircularProgressIndicator(color: AppColors.accentYellow))),
                  ),
              ],
            ),
    );
  }

  Widget _buildScannerOverlay(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final scanSize = size.width * 0.7;
    return Stack(
      children: [
        // Semi-transparent cutout
        ColorFiltered(
          colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.5), BlendMode.srcOut),
          child: Stack(
            children: [
              Container(decoration: const BoxDecoration(color: Colors.black, backgroundBlendMode: BlendMode.dstOut)),
              Align(
                alignment: Alignment.center,
                child: Container(
                  width: scanSize,
                  height: scanSize,
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32)),
                ),
              ),
            ],
          ),
        ),
        // Frame
        Align(
          alignment: Alignment.center,
          child: Container(
            width: scanSize,
            height: scanSize,
            decoration: BoxDecoration(border: Border.all(color: AppColors.accentYellow, width: 3), borderRadius: BorderRadius.circular(32)),
          ),
        ),
        Positioned(
          bottom: 120,
          left: 40,
          right: 40,
          child: const Text('Scanning Passenger National ID', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}
