package com.twinclash.game;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
import com.google.android.play.core.tasks.Task;

@CapacitorPlugin(name = "InAppReview")
public class InAppReviewPlugin extends Plugin {

    private static final String PACKAGE_NAME = "com.twinclash.game";

    @PluginMethod
    public void requestReview(PluginCall call) {
        ReviewManager reviewManager = ReviewManagerFactory.create(getContext());
        Task<ReviewInfo> request = reviewManager.requestReviewFlow();

        request.addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                ReviewInfo reviewInfo = task.getResult();
                Task<Void> flow = reviewManager.launchReviewFlow(getActivity(), reviewInfo);

                flow.addOnCompleteListener(flowTask -> {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("message", "Review flow completed");
                    call.resolve(result);
                });
            } else {
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("message", "Could not launch in-app review");
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void openPlayStore(PluginCall call) {
        try {
            // Intentar abrir directamente la app de Google Play
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("market://details?id=" + PACKAGE_NAME + "&pcampaignid=web_share"));
            intent.setPackage("com.android.vending");
            getActivity().startActivity(intent);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Opened Play Store");
            call.resolve(result);
        } catch (ActivityNotFoundException e) {
            // Si la app de Google Play no está instalada, abrir en el navegador
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse("https://play.google.com/store/apps/details?id=" + PACKAGE_NAME + "&pcampaignid=web_share"));
                getActivity().startActivity(intent);

                JSObject result = new JSObject();
                result.put("success", true);
                result.put("message", "Opened Play Store in browser");
                call.resolve(result);
            } catch (Exception ex) {
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("message", "Could not open Play Store: " + ex.getMessage());
                call.reject("Could not open Play Store", ex);
            }
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("message", "Error opening Play Store: " + e.getMessage());
            call.reject("Error opening Play Store", e);
        }
    }
}
