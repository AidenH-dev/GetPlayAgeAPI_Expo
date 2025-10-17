# Google Play Age Signals API - Investigation & Documentation

## Overview

This repository documents the implementation and investigation of Google's Play Age Signals API (beta) in an Expo React Native application. It includes proof that the API is currently non-functional and won't be active until January 1, 2026.

## Project Details

- **Framework**: Expo (SDK 54)
- **Platform**: Android
- **Module**: Custom Expo module with Kotlin
- **API**: Google Play Age Signals API `age-signals:0.0.1-beta01`

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
  try {
    val context = appContext.reactContext
    if (context == null) {
      promise.reject("ERROR", "Context is null", null)
      return@AsyncFunction
    }

    val ageSignalsManager = AgeSignalsManagerFactory.create(context)
    
    ageSignalsManager
      .checkAgeSignals(AgeSignalsRequest.builder().build())
      .addOnSuccessListener { ageSignalsResult ->
        // Handle success
      }
      .addOnFailureListener { exception ->
        // Currently throws: UnsupportedOperationException: Not yet implemented
      }
  } catch (e: Exception) {
    promise.reject("ERROR", "Failed: ${e.message}", e)
  }
}
```
