# Google Play Age Signals API - Investigation & Documentation

## Overview

This repository documents the implementation and investigation of Google's Play Age Signals API (beta) in an Expo React Native application.


## The Issue

### Error Encountered

```
Error: Age Signals Error: Not yet implemented.

Exception Type: java.lang.UnsupportedOperationException
Message: Not yet implemented.
Error Code: null
Cause: null
```

### Initial Confusion

The error message "Not yet implemented" is **NOT** documented in Google's [official error codes](https://developer.android.com/google/play/age-signals/use-age-signals-api#handle-error-codes). The documented error codes are:

- `-1` API_NOT_AVAILABLE
- `-2` PLAY_STORE_NOT_FOUND
- `-3` NETWORK_ERROR
- `-4` PLAY_SERVICES_NOT_FOUND
- `-5` CANNOT_BIND_TO_SERVICE
- `-6` PLAY_STORE_VERSION_OUTDATED
- `-7` PLAY_SERVICES_VERSION_OUTDATED
- `-8` CLIENT_TRANSIENT_ERROR
- `-9` APP_NOT_OWNED
- `-100` INTERNAL_ERROR

**None of these match our error.**

## The Investigation

### What I Discovered

Through debugging, I found the actual exception details:

```kotlin
Exception Type: java.lang.UnsupportedOperationException
Message: Not yet implemented.
Error Code: null
```

This is a `java.lang.UnsupportedOperationException` - a standard Java exception thrown when a method stub hasn't been implemented yet.

## Potential Direct Proof from Google

### Official Documentation Statement

From Google's [Age Signals API Overview](https://developer.android.com/google/play/age-signals/overview) (Last updated October 9, 2025):

> **"This documentation is being shared in advance of upcoming age verification bills in applicable US states going into effect on January 1, 2026 in Texas. The Play Age Signals API (beta) will return live responses for applicable users and the Age signals page will be available in Play Console after this date."**

From [Use Age Signals API](https://developer.android.com/google/play/age-signals/use-age-signals-api) (Last updated October 10, 2025):

> **"This documentation is being shared in advance of upcoming age verification bills in applicable US states going into effect on January 1, 2026 in Texas. The Play Age Signals API (beta) will return live responses for applicable users and the Age signals page will be available in Play Console after this date."**

### What i believe this means

1. **The library was released on October 8, 2025** - Available on Maven
2. **Documentation published October 9-10, 2025** - For developers to prepare
3. **Backend service NOT ACTIVE yet** - Potentially won't return real data until January 1, 2026?

## Implementation

### Gradle Dependency

```gradle
// modules/my-test-module/android/build.gradle
dependencies {
    implementation 'com.google.android.play:age-signals:0.0.1-beta01'
}
```

### Expo Config

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "extraMavenRepos": [
              "https://maven.google.com"
            ]
          }
        }
      ]
    ]
  }
}
```

### Kotlin Module Code

See `my-test-module/android/src/main/java/expo/modules/mytestmodule/MyTestModule.kt` for the full implementation.

Key function:
```kotlin
AsyncFunction("getAgeSignals") { promise: Promise ->
  // Log the function entry for debugging
  android.util.Log.d("MyTestModule", "getAgeSignals called")
  
  try {
    // ============================================================================
    // SECTION 1: Context Validation
    // ============================================================================
    // Get the React Native context - this is needed to create the AgeSignalsManager
    // The context provides access to Android system services and app information
    val context = appContext.reactContext
    android.util.Log.d("MyTestModule", "Context: $context")
    
    // Validate that context exists - without it, we cannot proceed
    // This can be null if the app is not fully initialized or has been destroyed
    if (context == null) {
      promise.reject("ERROR", "Context is null", null)
      return@AsyncFunction
    }

    // ============================================================================
    // SECTION 2: Age Signals Manager Creation
    // ============================================================================
    // Create the AgeSignalsManager using Google's factory method
    // This manager handles communication with Google Play Services
    android.util.Log.d("MyTestModule", "Creating AgeSignalsManager")
    val ageSignalsManager: AgeSignalsManager = AgeSignalsManagerFactory.create(context)
    android.util.Log.d("MyTestModule", "Manager created: $ageSignalsManager")
    
    // ============================================================================
    // SECTION 3: Timeout Mechanism Setup
    // ============================================================================
    // Track whether the promise has been resolved/rejected to prevent multiple calls
    // CRITICAL: Calling promise.resolve() or promise.reject() twice causes crashes
    var isResolved = false
    
    // Create a handler on the main (UI) thread to manage the timeout
    val handler = Handler(Looper.getMainLooper())
    
    // Define what happens when the request times out (after 5 seconds)
    // This prevents the app from hanging indefinitely if the API doesn't respond
    val timeoutRunnable = Runnable {
      if (!isResolved) {
        isResolved = true
        android.util.Log.d("MyTestModule", "Age Signals request timed out")
        
        // Reject the promise with a timeout error
        // NOTE: Currently this will likely fire because the API throws exceptions
        // immediately rather than hanging, but it's good practice to have it
        promise.reject("TIMEOUT", "Timed out", null)
      }
    }
    
    // Schedule the timeout to run after 5000ms (5 seconds)
    handler.postDelayed(timeoutRunnable, 5000)
    
    // ============================================================================
    // SECTION 4: Age Signals API Request
    // ============================================================================
    // Make the actual API request to Google Play Services
    // This returns a Task object that handles async callbacks
    ageSignalsManager
      .checkAgeSignals(AgeSignalsRequest.builder().build())
      
      // ----------------------------------------------------------------------------
      // SUCCESS HANDLER
      // ----------------------------------------------------------------------------
      // This callback is triggered if the API successfully returns age signals
      .addOnSuccessListener { ageSignalsResult ->
        // Check if we haven't already resolved/rejected the promise
        if (!isResolved) {
          isResolved = true
          
          // Cancel the timeout since we got a response
          handler.removeCallbacks(timeoutRunnable)
          
          android.util.Log.d("MyTestModule", "Age Signals success")
          
          // -----------------------------------------------------------------------
          // Build the result object to send back to JavaScript
          // -----------------------------------------------------------------------
          val result = mutableMapOf<String, Any?>(
            // User's verification status (VERIFIED, SUPERVISED, UNKNOWN, etc.)
            "userStatus" to ageSignalsResult.userStatus().toString(),
            
            // Unique ID for this user install (used for tracking parental approvals)
            "installId" to ageSignalsResult.installId(),
            
            // Add current timestamp for tracking when the data was retrieved
            "timestamp" to System.currentTimeMillis()
          )
          
          // -----------------------------------------------------------------------
          // Add optional age range fields (only present for supervised accounts)
          // -----------------------------------------------------------------------
          // Lower bound of user's age range (e.g., 13 in range 13-15)
          val ageLower = ageSignalsResult.ageLower()
          
          // Upper bound of user's age range (e.g., 15 in range 13-15)
          // Note: This is null if the user is 18+ even with a supervised account
          val ageUpper = ageSignalsResult.ageUpper()
          
          // Only add these fields if they're not null to avoid sending undefined to JS
          if (ageLower != null) result["ageLower"] = ageLower
          if (ageUpper != null) result["ageUpper"] = ageUpper
          
          // -----------------------------------------------------------------------
          // Add most recent approval date (for supervised accounts)
          // -----------------------------------------------------------------------
          // Date when parent last approved significant app changes
          // Only present for supervised accounts with approval status
          val approvalDate = ageSignalsResult.mostRecentApprovalDate()
          if (approvalDate != null) result["mostRecentApprovalDate"] = approvalDate
          
          // Resolve the promise and send the data back to JavaScript
          promise.resolve(result)
        }
      }
      
      // ----------------------------------------------------------------------------
      // FAILURE HANDLER
      // ----------------------------------------------------------------------------
      // This callback is triggered if the API request fails
      // CURRENTLY: This is being called with UnsupportedOperationException
      .addOnFailureListener { exception ->
        // Check if we haven't already resolved/rejected the promise
        if (!isResolved) {
          isResolved = true
          
          // Cancel the timeout since we got a response (even though it's an error)
          handler.removeCallbacks(timeoutRunnable)
          
          // -----------------------------------------------------------------------
          // Log comprehensive error information for debugging
          // -----------------------------------------------------------------------
          android.util.Log.e("MyTestModule", "Age Signals error - Full details:")
          
          // Log the exception class name (e.g., UnsupportedOperationException)
          android.util.Log.e("MyTestModule", "Exception type: ${exception.javaClass.name}")
          
          // Log the error message (currently: "Not yet implemented")
          android.util.Log.e("MyTestModule", "Exception message: ${exception.message}")
          
          // Log the underlying cause (currently null)
          android.util.Log.e("MyTestModule", "Exception cause: ${exception.cause}")
          
          // Log the full stack trace for detailed debugging
          android.util.Log.e("MyTestModule", "Exception stacktrace:", exception)
          
          // -----------------------------------------------------------------------
          // Attempt to extract Google's error code (if available)
          // -----------------------------------------------------------------------
          // Try to cast to ApiException to get Google's documented error codes
          // Error codes like -9 (APP_NOT_OWNED), -1 (API_NOT_AVAILABLE), etc.
          // Currently returns null because UnsupportedOperationException is not ApiException
          val errorCode = try {
            val apiException = exception as? com.google.android.gms.common.api.ApiException
            apiException?.statusCode
          } catch (e: Exception) {
            // If casting fails, just return null
            null
          }
          
          android.util.Log.e("MyTestModule", "Possible error code: $errorCode")
          
          // -----------------------------------------------------------------------
          // Build detailed error message for JavaScript
          // -----------------------------------------------------------------------
          // Create a comprehensive error message with all available information
          // This helps with debugging on the JavaScript side
          val errorMessage = """
            Exception Type: ${exception.javaClass.name}
            Message: ${exception.message}
            Error Code: $errorCode
            Cause: ${exception.cause}
          """.trimIndent()
          
          // Reject the promise with the error details
          // JavaScript will receive this as a rejected Promise
          promise.reject("AGE_SIGNALS_ERROR", errorMessage, exception)
        }
      }
    
  } catch (e: Exception) {
    // ============================================================================
    // SECTION 5: Catch-All Error Handler
    // ============================================================================
    // This catches any exceptions during setup (before the API call)
    // For example: if AgeSignalsManagerFactory.create() fails
    android.util.Log.e("MyTestModule", "Exception in getAgeSignals setup", e)
    
    // Reject the promise with setup error details
    promise.reject("ERROR", "Failed: ${e.javaClass.name}: ${e.message}", e)
  }
}
```
