package org.nasi.lemak.carrierservices

import android.annotation.TargetApi
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.telephony.euicc.DownloadableSubscription
import android.telephony.euicc.EuiccManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

val ACTION_DOWNLOAD_SUBSCRIPTION = "org.nasi.lemak.carrierservices.download_subscription"

@TargetApi(28) class ESimBridge constructor(
        context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    val manager: EuiccManager = context.getSystemService(EuiccManager::class.java)
    val executor = MainThreadExecutor()

    override fun getName() = "NLMESimBridge"

    @ReactMethod fun deviceSupportsESimInstallation(promise: Promise) =
            promise.resolve(manager.isEnabled)

    @ReactMethod fun installESimProfile(
            @Suppress("unused") __unused_address: String?,
            @Suppress("unused")  __unused_confirmationCode: String?,
            @Suppress("unused")  _unused_eid: String?,
            @Suppress("unused")  __unused_iccid: String?,
            @Suppress("unused")  __unused_matchingId: String?,
            @Suppress("unused")  __unused_oid: String?,
            profile: String,
            promise: Promise) {

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                executor.execute {
                    when (resultCode) {
                        EuiccManager.EMBEDDED_SUBSCRIPTION_RESULT_RESOLVABLE_ERROR -> {
                            manager.startResolutionActivity(
                                    reactApplicationContext.currentActivity,
                                    0,
                                    intent,
                                    PendingIntent.getBroadcast(
                                            reactApplicationContext.currentActivity,
                                            0,
                                            intent,
                                            PendingIntent.FLAG_UPDATE_CURRENT
                                    ))
                        }
                        EuiccManager.EMBEDDED_SUBSCRIPTION_RESULT_OK -> {
                            promise.resolve(ESimProfileStatus.SUCCESS.value)
                            reactApplicationContext.currentActivity!!.unregisterReceiver(this)
                        }
                        EuiccManager.EMBEDDED_SUBSCRIPTION_RESULT_ERROR -> {
                            promise.resolve(ESimProfileStatus.FAIL.value)
                            reactApplicationContext.currentActivity!!.unregisterReceiver(this)
                        }
                        else -> {
                            promise.resolve(ESimProfileStatus.UNKNOWN.value)
                            reactApplicationContext.currentActivity!!.unregisterReceiver(this)
                        }
                    }
                }
            }
        }

        val intent = Intent(ACTION_DOWNLOAD_SUBSCRIPTION)

        executor.execute {
            reactApplicationContext.currentActivity!!.registerReceiver(
                    receiver,
                    IntentFilter(ACTION_DOWNLOAD_SUBSCRIPTION))
            manager.downloadSubscription(
                    DownloadableSubscription.forActivationCode(profile),
                    false,
                    PendingIntent.getBroadcast(
                            reactApplicationContext.currentActivity,
                            0,
                            intent,
                            PendingIntent.FLAG_UPDATE_CURRENT))
        }

    }

}
