package com.twinclash.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.tiktok.appevents.TTAppEventLogger;
import com.tiktok.appevents.TTPCommonConstants;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Iterator;

@CapacitorPlugin(name = "TikTokEvents")
public class TikTokPlugin extends Plugin {

    @PluginMethod
    public void trackEvent(PluginCall call) {
        String eventName = call.getString("eventName");
        JSObject properties = call.getObject("properties");

        if (eventName == null) {
            call.reject("Event name is required");
            return;
        }

        try {
            JSONObject jsonProperties = new JSONObject();

            if (properties != null) {
                Iterator<String> keys = properties.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    jsonProperties.put(key, properties.get(key));
                }
            }

            TTAppEventLogger.trackEvent(eventName, jsonProperties);
            System.out.println("[TikTok] Event tracked: " + eventName);
            call.resolve();
        } catch (Exception e) {
            System.err.println("[TikTok] Error tracking event: " + e.getMessage());
            call.reject("Error tracking event: " + e.getMessage());
        }
    }

    @PluginMethod
    public void trackPurchase(PluginCall call) {
        String currency = call.getString("currency", "USD");
        Double value = call.getDouble("value", 0.0);
        String contentId = call.getString("contentId");

        if (contentId == null) {
            call.reject("Content ID is required");
            return;
        }

        try {
            JSONObject properties = new JSONObject();
            properties.put(TTPCommonConstants.CURRENCY, currency);
            properties.put(TTPCommonConstants.VALUE, value);
            properties.put(TTPCommonConstants.CONTENT_ID, contentId);
            properties.put(TTPCommonConstants.CONTENT_TYPE, "product");

            TTAppEventLogger.trackEvent("Purchase", properties);
            System.out.println("[TikTok] Purchase tracked: " + contentId + " - " + value + " " + currency);
            call.resolve();
        } catch (JSONException e) {
            System.err.println("[TikTok] Error tracking purchase: " + e.getMessage());
            call.reject("Error tracking purchase: " + e.getMessage());
        }
    }

    @PluginMethod
    public void trackRegistration(PluginCall call) {
        String method = call.getString("method", "email");

        try {
            JSONObject properties = new JSONObject();
            properties.put("registration_method", method);

            TTAppEventLogger.trackEvent("CompleteRegistration", properties);
            System.out.println("[TikTok] Registration tracked: " + method);
            call.resolve();
        } catch (JSONException e) {
            System.err.println("[TikTok] Error tracking registration: " + e.getMessage());
            call.reject("Error tracking registration: " + e.getMessage());
        }
    }

    @PluginMethod
    public void trackLevelComplete(PluginCall call) {
        Integer level = call.getInt("level");

        if (level == null) {
            call.reject("Level is required");
            return;
        }

        try {
            JSONObject properties = new JSONObject();
            properties.put("level", level);
            properties.put("success", true);

            TTAppEventLogger.trackEvent("AchieveLevel", properties);
            System.out.println("[TikTok] Level complete tracked: " + level);
            call.resolve();
        } catch (JSONException e) {
            System.err.println("[TikTok] Error tracking level: " + e.getMessage());
            call.reject("Error tracking level: " + e.getMessage());
        }
    }

    @PluginMethod
    public void trackContentView(PluginCall call) {
        String contentType = call.getString("contentType");
        String contentId = call.getString("contentId");

        if (contentType == null || contentId == null) {
            call.reject("Content type and ID are required");
            return;
        }

        try {
            JSONObject properties = new JSONObject();
            properties.put(TTPCommonConstants.CONTENT_TYPE, contentType);
            properties.put(TTPCommonConstants.CONTENT_ID, contentId);

            TTAppEventLogger.trackEvent("ViewContent", properties);
            System.out.println("[TikTok] Content view tracked: " + contentType + "/" + contentId);
            call.resolve();
        } catch (JSONException e) {
            System.err.println("[TikTok] Error tracking content view: " + e.getMessage());
            call.reject("Error tracking content view: " + e.getMessage());
        }
    }
}
