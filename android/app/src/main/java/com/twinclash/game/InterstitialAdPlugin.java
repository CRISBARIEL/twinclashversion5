package com.twinclash.game;

import android.util.Log;
import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;

@CapacitorPlugin(name = "InterstitialAdPlugin")
public class InterstitialAdPlugin extends Plugin {
    private static final String TAG = "InterstitialAdPlugin";
    private InterstitialAd interstitialAd;
    private boolean isLoading = false;

    // IDs de AdMob
    // Test ID: ca-app-pub-3940256099942544/1033173712
    // Production ID: ca-app-pub-2140112688604592/1393094754
    private static final String TEST_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
    private static final String PRODUCTION_AD_UNIT_ID = "ca-app-pub-2140112688604592/1393094754";

    @PluginMethod
    public void loadAd(PluginCall call) {
        if (isLoading) {
            Log.d(TAG, "Ad is already loading");
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Ad is already loading");
            call.resolve(ret);
            return;
        }

        if (interstitialAd != null) {
            Log.d(TAG, "Ad already loaded");
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Ad already loaded");
            call.resolve(ret);
            return;
        }

        boolean testMode = call.getBoolean("testMode", false);
        String adUnitId = testMode ? TEST_AD_UNIT_ID : PRODUCTION_AD_UNIT_ID;

        Log.d(TAG, "Loading interstitial ad... (testMode: " + testMode + ")");
        Log.d(TAG, "Ad Unit ID: " + adUnitId);

        isLoading = true;

        getActivity().runOnUiThread(() -> {
            AdRequest adRequest = new AdRequest.Builder().build();

            InterstitialAd.load(
                getContext(),
                adUnitId,
                adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull InterstitialAd ad) {
                        Log.d(TAG, "✅ Ad was loaded successfully");
                        interstitialAd = ad;
                        isLoading = false;

                        // Configurar FullScreenContentCallback
                        setupFullScreenContentCallback();

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("message", "Ad loaded successfully");
                        call.resolve(ret);
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        Log.e(TAG, "❌ Ad failed to load: " + loadAdError.getMessage());
                        Log.e(TAG, "Error code: " + loadAdError.getCode());
                        Log.e(TAG, "Error domain: " + loadAdError.getDomain());

                        interstitialAd = null;
                        isLoading = false;

                        JSObject ret = new JSObject();
                        ret.put("success", false);
                        ret.put("message", loadAdError.getMessage());
                        ret.put("code", loadAdError.getCode());
                        call.resolve(ret);
                    }
                }
            );
        });
    }

    private void setupFullScreenContentCallback() {
        if (interstitialAd == null) return;

        interstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdDismissedFullScreenContent() {
                Log.d(TAG, "Ad was dismissed");
                interstitialAd = null;

                // Notificar a JavaScript
                JSObject ret = new JSObject();
                ret.put("event", "dismissed");
                notifyListeners("adEvent", ret);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                Log.e(TAG, "Ad failed to show: " + adError.getMessage());
                interstitialAd = null;

                // Notificar a JavaScript
                JSObject ret = new JSObject();
                ret.put("event", "failedToShow");
                ret.put("message", adError.getMessage());
                notifyListeners("adEvent", ret);
            }

            @Override
            public void onAdShowedFullScreenContent() {
                Log.d(TAG, "Ad showed fullscreen content");

                // Notificar a JavaScript
                JSObject ret = new JSObject();
                ret.put("event", "showed");
                notifyListeners("adEvent", ret);
            }

            @Override
            public void onAdImpression() {
                Log.d(TAG, "Ad recorded an impression");

                // Notificar a JavaScript
                JSObject ret = new JSObject();
                ret.put("event", "impression");
                notifyListeners("adEvent", ret);
            }

            @Override
            public void onAdClicked() {
                Log.d(TAG, "Ad was clicked");

                // Notificar a JavaScript
                JSObject ret = new JSObject();
                ret.put("event", "clicked");
                notifyListeners("adEvent", ret);
            }
        });
    }

    @PluginMethod
    public void showAd(PluginCall call) {
        if (interstitialAd == null) {
            Log.w(TAG, "Interstitial ad is not loaded yet");
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Ad not loaded");
            call.resolve(ret);
            return;
        }

        Log.d(TAG, "Showing interstitial ad...");

        getActivity().runOnUiThread(() -> {
            interstitialAd.show(getActivity());

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Ad shown");
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void isAdReady(PluginCall call) {
        boolean ready = interstitialAd != null;
        Log.d(TAG, "Is ad ready: " + ready);

        JSObject ret = new JSObject();
        ret.put("ready", ready);
        call.resolve(ret);
    }

    @PluginMethod
    public void destroyAd(PluginCall call) {
        Log.d(TAG, "Destroying ad");
        interstitialAd = null;
        isLoading = false;

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
