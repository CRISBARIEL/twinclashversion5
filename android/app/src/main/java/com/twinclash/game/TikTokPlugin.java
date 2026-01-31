package com.twinclash.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
// TikTok SDK temporalmente deshabilitado - necesita configuración adicional
// import com.tiktok.appevents.TTAppEventLogger;
// import com.tiktok.appevents.TTPCommonConstants;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Iterator;

@CapacitorPlugin(name = "TikTokEvents")
public class TikTokPlugin extends Plugin {

    @PluginMethod
    public void trackEvent(PluginCall call) {
        // TikTok SDK temporalmente deshabilitado
        System.out.println("[TikTok] SDK disabled - Event not tracked");
        call.resolve();

        /* CÓDIGO ORIGINAL - Descomentar cuando TikTok esté configurado
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
        */
    }

    @PluginMethod
    public void trackPurchase(PluginCall call) {
        // TikTok SDK temporalmente deshabilitado
        System.out.println("[TikTok] SDK disabled - Purchase not tracked");
        call.resolve();
    }

    @PluginMethod
    public void trackRegistration(PluginCall call) {
        // TikTok SDK temporalmente deshabilitado
        System.out.println("[TikTok] SDK disabled - Registration not tracked");
        call.resolve();
    }

    @PluginMethod
    public void trackLevelComplete(PluginCall call) {
        // TikTok SDK temporalmente deshabilitado
        System.out.println("[TikTok] SDK disabled - Level complete not tracked");
        call.resolve();
    }

    @PluginMethod
    public void trackContentView(PluginCall call) {
        // TikTok SDK temporalmente deshabilitado
        System.out.println("[TikTok] SDK disabled - Content view not tracked");
        call.resolve();
    }
}
