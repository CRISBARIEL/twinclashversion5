package com.twinclash.game;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    new Thread(
      () -> {
        MobileAds.initialize(this, initializationStatus -> {});
      }
    ).start();
  }
}
