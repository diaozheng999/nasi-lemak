package org.nasi.lemak.carrierservices

import android.os.Build
import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class CarrierPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext) = mutableListOf(
      when {
          Build.VERSION.SDK_INT >= Build.VERSION_CODES.P -> ESimBridge(context)
          else -> ESimBridgeFallback(context)
      }
    )

    override fun createViewManagers(
            @Suppress("unused") __unused_context: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()
}
