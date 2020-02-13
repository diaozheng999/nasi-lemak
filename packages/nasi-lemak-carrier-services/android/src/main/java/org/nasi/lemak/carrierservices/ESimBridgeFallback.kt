package org.nasi.lemak.carrierservices

import com.facebook.react.bridge.*

class ESimBridgeFallback constructor(
        context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    override fun getName() = "NLMESimBridge"

    @ReactMethod fun deviceSupportsESimInstallation(promise: Promise) = promise.resolve(false)
    @ReactMethod fun installESimProfile(
            @Suppress("unused")  __unused_address: String?,
            @Suppress("unused")  __unused_confirmationCode: String?,
            @Suppress("unused")  __unused_eid: String?,
            @Suppress("unused")  __unused_iccid: String?,
            @Suppress("unused")  __unused_matchingId: String?,
            @Suppress("unused")  __unused_oid: String?,
            @Suppress("unused")  __unused_profile: String,
            promise: Promise) = promise.resolve(ESimProfileStatus.UNKNOWN.value)
}
