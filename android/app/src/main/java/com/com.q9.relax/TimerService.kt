package com.q9.relax

import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat

class TimerService : Service() {

    companion object {
        const val CHANNEL_ID = "meditation_timer_channel"
        const val NOTIFICATION_ID = 2001

        const val ACTION_START = "com.q9.relax.ACTION_START_TIMER"
        const val ACTION_STOP = "com.q9.relax.ACTION_STOP_TIMER"
        const val EXTRA_DURATION_SECONDS = "extra_duration_seconds"
        const val EXTRA_PLAY_BELL = "extra_play_bell"

        var isRunning: Boolean = false
            private set
        var remainingSeconds: Int = 0
            private set
        var totalDurationSeconds: Int = 0
            private set

        var onTickCallback: ((Int) -> Unit)? = null
        var onCompleteCallback: ((Int) -> Unit)? = null
        var onStopCallback: (() -> Unit)? = null
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private val handler = Handler(Looper.getMainLooper())
    private var targetTimeMillis: Long = 0L
    private var playBellOnComplete: Boolean = true
    private var mediaPlayer: MediaPlayer? = null

    private val countdownRunnable = object : Runnable {
        override fun run() {
            if (!isRunning) return

            val now = System.currentTimeMillis()
            val diff = targetTimeMillis - now
            val secondsLeft = Math.max(0, Math.ceil(diff / 1000.0).toInt())
            remainingSeconds = secondsLeft

            onTickCallback?.invoke(secondsLeft)

            if (secondsLeft <= 0) {
                completeTimer()
            } else {
                updateNotification(secondsLeft)
                handler.postDelayed(this, 1000L)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY

        when (action) {
            ACTION_START -> {
                val duration = intent.getIntExtra(EXTRA_DURATION_SECONDS, 120)
                val playBell = intent.getBooleanExtra(EXTRA_PLAY_BELL, true)
                startTimer(duration, playBell)
            }
            ACTION_STOP -> {
                stopTimer()
            }
        }

        return START_NOT_STICKY
    }

    private fun startTimer(durationSeconds: Int, playBell: Boolean) {
        totalDurationSeconds = durationSeconds
        remainingSeconds = durationSeconds
        playBellOnComplete = playBell
        targetTimeMillis = System.currentTimeMillis() + (durationSeconds * 1000L)
        isRunning = true

        acquireWakeLock()

        startForeground(NOTIFICATION_ID, buildNotification(durationSeconds, ongoing = true))

        handler.removeCallbacks(countdownRunnable)
        handler.post(countdownRunnable)
    }

    private fun completeTimer() {
        isRunning = false
        handler.removeCallbacks(countdownRunnable)
        val finishedDuration = totalDurationSeconds

        if (playBellOnComplete) {
            playBellAudio()
        }

        onCompleteCallback?.invoke(finishedDuration)

        // Show completion notification
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val completionNotification = buildCompletionNotification()
        notificationManager.notify(NOTIFICATION_ID, completionNotification)

        releaseWakeLock()

        // Stop foreground after 10 seconds
        handler.postDelayed({
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }, 8000L)
    }

    private fun stopTimer() {
        isRunning = false
        handler.removeCallbacks(countdownRunnable)
        releaseWakeLock()
        onStopCallback?.invoke()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun playBellAudio() {
        try {
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer.create(this, R.raw.bell)
            mediaPlayer?.setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                    .build()
            )
            mediaPlayer?.setOnCompletionListener {
                it.release()
                mediaPlayer = null
            }
            mediaPlayer?.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Meditation Timer",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows the active meditation timer and time remaining."
                setSound(null, null)
                enableVibration(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(secondsLeft: Int, ongoing: Boolean): Notification {
        val minutes = secondsLeft / 60
        val seconds = secondsLeft % 60
        val timeString = String.format("%02d:%02d", minutes, seconds)

        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openPendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, TimerService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Meditation in Progress")
            .setContentText("Time remaining: $timeString")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(openPendingIntent)
            .setOngoing(ongoing)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopPendingIntent)
            .build()
    }

    private fun updateNotification(secondsLeft: Int) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildNotification(secondsLeft, ongoing = true))
    }

    private fun buildCompletionNotification(): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openPendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Meditation Complete")
            .setContentText("Your session is finished. Take a gentle breath.")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(openPendingIntent)
            .setOngoing(false)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()
    }

    private fun acquireWakeLock() {
        if (wakeLock == null) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "Q9Relax:MeditationTimerWakeLock"
            )
        }
        if (wakeLock?.isHeld == false) {
            wakeLock?.acquire(3600 * 1000L) // Safety timeout 1 hour
        }
    }

    private fun releaseWakeLock() {
        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacks(countdownRunnable)
        releaseWakeLock()
        mediaPlayer?.release()
        mediaPlayer = null
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

