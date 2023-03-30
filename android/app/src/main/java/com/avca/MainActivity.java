package com.avca;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.voximplant.sdk.Voximplant;
import com.voximplant.sdk.client.ClientConfig;
import com.voximplant.sdk.client.IClient;
import com.voximplant.sdk.client.IPushTokenCompletionHandler;
import com.voximplant.sdk.client.PushTokenError;

import java.util.concurrent.Executors;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

//    FirebaseMessaging.getInstance().getToken()
//    .addOnCompleteListener(new OnCompleteListener<String>() {
//      @Override
//      public void onComplete(@NonNull Task<String> task) {
//        if (!task.isSuccessful()) {
//          System.out.println("Fetching FCM registration token failed");
//          return;
//        }
//
//        // Get new FCM registration token
//        String token = task.getResult();
//
//        // Log and toast
//        System.out.println("token is "+token);
////        Toast.makeText(MainActivity.this, "Your device registration token is " + token, Toast.LENGTH_SHORT).show();
//      }
//    });
  }
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  @Override
  protected String getMainComponentName() {
    return "avcA";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
    );
  }
}
