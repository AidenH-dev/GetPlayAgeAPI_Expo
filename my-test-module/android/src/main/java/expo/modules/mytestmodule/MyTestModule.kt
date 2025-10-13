package expo.modules.mytestmodule

import android.os.Build
import android.os.Vibrator
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class MyTestModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyTestModule")

    Function("hello") {
      "Hello world! 👋"
    }

    Function("getDeviceInfo") {
      return@Function mapOf(
        "manufacturer" to Build.MANUFACTURER,
        "model" to Build.MODEL,
        "androidVersion" to Build.VERSION.RELEASE,
        "sdkVersion" to Build.VERSION.SDK_INT,
        "device" to Build.DEVICE
      )
    }

    Function("vibrate") { duration: Int ->
      val vibrator = appContext.reactContext?.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
      if (vibrator?.hasVibrator() == true) {
        @Suppress("DEPRECATION")
        vibrator.vibrate(duration.toLong())
        return@Function "Vibrated for $duration ms"
      } else {
        return@Function "No vibrator available"
      }
    }

    AsyncFunction("fetchDataAsync") { promise: Promise ->
      try {
        Thread.sleep(1000)
        val result = mapOf(
          "data" to "Some data from Android",
          "timestamp" to System.currentTimeMillis()
        )
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("ERROR", "Failed to fetch data", e)
      }
    }
  }
}