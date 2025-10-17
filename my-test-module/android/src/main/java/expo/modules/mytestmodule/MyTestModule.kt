package expo.modules.mytestmodule

import android.os.Build
import android.os.Vibrator
import android.os.Handler
import android.os.Looper
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.google.android.play.agesignals.AgeSignalsManager
import com.google.android.play.agesignals.AgeSignalsManagerFactory
import com.google.android.play.agesignals.AgeSignalsRequest

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

    AsyncFunction("getAgeSignals") { promise: Promise ->
      android.util.Log.d("MyTestModule", "getAgeSignals called")
      
      try {
        val context = appContext.reactContext
        android.util.Log.d("MyTestModule", "Context: $context")
        
        if (context == null) {
          promise.reject("ERROR", "Context is null", null)
          return@AsyncFunction
        }
    
        android.util.Log.d("MyTestModule", "Creating AgeSignalsManager")
        val ageSignalsManager: AgeSignalsManager = AgeSignalsManagerFactory.create(context)
        android.util.Log.d("MyTestModule", "Manager created: $ageSignalsManager")
        
        var isResolved = false
        val handler = Handler(Looper.getMainLooper())
        
        val timeoutRunnable = Runnable {
          if (!isResolved) {
            isResolved = true
            android.util.Log.d("MyTestModule", "Age Signals request timed out")
            promise.reject("TIMEOUT", "Timed out", null)
          }
        }
        
        handler.postDelayed(timeoutRunnable, 5000)
        
        ageSignalsManager
          .checkAgeSignals(AgeSignalsRequest.builder().build())
          .addOnSuccessListener { ageSignalsResult ->
            if (!isResolved) {
              isResolved = true
              handler.removeCallbacks(timeoutRunnable)
              
              android.util.Log.d("MyTestModule", "Age Signals success")
              
              val result = mutableMapOf<String, Any?>(
                "userStatus" to ageSignalsResult.userStatus().toString(),
                "installId" to ageSignalsResult.installId(),
                "timestamp" to System.currentTimeMillis()
              )
              
              val ageLower = ageSignalsResult.ageLower()
              val ageUpper = ageSignalsResult.ageUpper()
              
              if (ageLower != null) result["ageLower"] = ageLower
              if (ageUpper != null) result["ageUpper"] = ageUpper
              
              val approvalDate = ageSignalsResult.mostRecentApprovalDate()
              if (approvalDate != null) result["mostRecentApprovalDate"] = approvalDate
              
              promise.resolve(result)
            }
          }
          .addOnFailureListener { exception ->
            if (!isResolved) {
              isResolved = true
              handler.removeCallbacks(timeoutRunnable)
              
              android.util.Log.e("MyTestModule", "Age Signals error - Full details:")
              android.util.Log.e("MyTestModule", "Exception type: ${exception.javaClass.name}")
              android.util.Log.e("MyTestModule", "Exception message: ${exception.message}")
              android.util.Log.e("MyTestModule", "Exception cause: ${exception.cause}")
              android.util.Log.e("MyTestModule", "Exception stacktrace:", exception)
              
              val errorCode = try {
                val apiException = exception as? com.google.android.gms.common.api.ApiException
                apiException?.statusCode
              } catch (e: Exception) {
                null
              }
              
              android.util.Log.e("MyTestModule", "Possible error code: $errorCode")
              
              val errorMessage = """
                Exception Type: ${exception.javaClass.name}
                Message: ${exception.message}
                Error Code: $errorCode
                Cause: ${exception.cause}
              """.trimIndent()
              
              promise.reject("AGE_SIGNALS_ERROR", errorMessage, exception)
            }
          }
        
      } catch (e: Exception) {
        android.util.Log.e("MyTestModule", "Exception in getAgeSignals setup", e)
        promise.reject("ERROR", "Failed: ${e.javaClass.name}: ${e.message}", e)
      }
    }

    Function("isAgeSignalsAvailable") {
      try {
        val context = appContext.reactContext
        return@Function context != null
      } catch (e: Exception) {
        return@Function false
      }
    }
  }
}