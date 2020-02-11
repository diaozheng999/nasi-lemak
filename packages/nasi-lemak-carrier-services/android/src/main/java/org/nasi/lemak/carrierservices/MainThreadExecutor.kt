package org.nasi.lemak.carrierservices

import android.os.Handler
import android.os.Looper
import java.util.concurrent.Executor

/**
 * An executor on UI thread.
 *
 * This is used for:
 *   - BiometricPrompt callbacks
 *   - Creating of BiometricPrompt fragment
 */
class MainThreadExecutor : Executor {
    val handler = Handler(Looper.getMainLooper())

    override fun execute(runnable: Runnable) {
        handler.post(runnable)
    }
}
