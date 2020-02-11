package org.nasi.lemak.carrierservices

import com.facebook.react.bridge.*

class CarrierBridgeFallback constructor(
        context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    override fun getName() = "NLMESimBridge"

    @ReactMethod fun deviceSupportsESimInstallation(promise: Promise) = promise.resolve(false)
    @ReactMethod fun installESimProfile(
            _address: String?,
            _confirmationCode: String?,
            _eid: String?,
            _iccid: String?,
            _matchingId: String?,
            _oid: String?,
            _profile: String,
            promise: Promise) = promise.resolve(ESimProfileStatus.UNKNOWN.value)
}
