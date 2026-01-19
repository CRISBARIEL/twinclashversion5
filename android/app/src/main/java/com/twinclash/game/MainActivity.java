package com.twinclash.game;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;

public class MainActivity extends BridgeActivity {
  private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1001;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Registrar plugin de notificaciones
    registerPlugin(NotificationPermissionPlugin.class);

    // Inicializar AdMob
    new Thread(
      () -> {
        MobileAds.initialize(this, initializationStatus -> {});
      }
    ).start();

    // Pedir permiso de notificaciones automáticamente (Android 13+)
    requestNotificationPermissionIfNeeded();
  }

  private void requestNotificationPermissionIfNeeded() {
    // Solo en Android 13 (API 33) o superior
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
          != PackageManager.PERMISSION_GRANTED) {

        // Pedir permiso automáticamente al abrir la app
        ActivityCompat.requestPermissions(
          this,
          new String[]{Manifest.permission.POST_NOTIFICATIONS},
          NOTIFICATION_PERMISSION_REQUEST_CODE
        );
      }
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        System.out.println("[MainActivity] Notification permission GRANTED");
      } else {
        System.out.println("[MainActivity] Notification permission DENIED");
      }
    }
  }
}
