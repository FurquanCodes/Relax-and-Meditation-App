package com.q9.relax

import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class TimerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MeditationTimer"

    init {
        TimerService.onTickCallback = { secondsLeft ->
            val params = Arguments.createMap().apply {
                putInt("remainingSeconds", secondsLeft)
                putInt("totalDuration", TimerService.totalDurationSeconds)
            }
            sendEvent("onTimerTick", params)
        }

        TimerService.onCompleteCallback = { completedDuration ->
            val params = Arguments.createMap().apply {
                putInt("completedDuration", completedDuration)
            }
            sendEvent("onTimerComplete", params)
        }

        TimerService.onStopCallback = {
            sendEvent("onTimerStopped", Arguments.createMap())
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        }
    }

    @ReactMethod
    fun startTimer(durationSeconds: Double, playBell: Boolean, promise: Promise) {
        try {
            val intent = Intent(reactContext, TimerService::class.java).apply {
                action = TimerService.ACTION_START
                putExtra(TimerService.EXTRA_DURATION_SECONDS, durationSeconds.toInt())
                putExtra(TimerService.EXTRA_PLAY_BELL, playBell)
            }
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TIMER_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopTimer(promise: Promise) {
        try {
            val intent = Intent(reactContext, TimerService::class.java).apply {
                action = TimerService.ACTION_STOP
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TIMER_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        val map = Arguments.createMap().apply {
            putBoolean("isRunning", TimerService.isRunning)
            putInt("remainingSeconds", TimerService.remainingSeconds)
            putInt("totalDuration", TimerService.totalDurationSeconds)
        }
        promise.resolve(map)
    }

    @ReactMethod
    fun playBell(promise: Promise) {
        try {
            val mediaPlayer = MediaPlayer.create(reactContext, R.raw.bell)
            mediaPlayer.setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                    .build()
            )
            mediaPlayer.setOnCompletionListener {
                it.release()
            }
            mediaPlayer.start()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("BELL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native event emitter
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Required for React Native event emitter
    }
}

