import { useEventListener } from "expo";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";

const SPLASH_VIDEO_SOURCE = require("../../assets/splash-screen-rukun-app.mp4");
const SPLASH_PLAYBACK_RATE = 1.35;
const HARD_TIMEOUT_MS = 15000;
const ERROR_FALLBACK_DELAY_MS = 4000;
const END_THRESHOLD_SECONDS = 0.06;
const SLIDE_UP_DURATION_MS = 520;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RootLayout() {
    const [showSplashOverlay, setShowSplashOverlay] = useState(true);
    const hasStartedPlaybackRef = useRef(false);
    const isFinishingRef = useRef(false);
    const translateY = useRef(new Animated.Value(0)).current;

    const player = useVideoPlayer(SPLASH_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.loop = false;
        videoPlayer.muted = true;
        videoPlayer.playbackRate = SPLASH_PLAYBACK_RATE;
        videoPlayer.timeUpdateEventInterval = 0.1;
        videoPlayer.pause();
    });

    const finishSplash = useCallback(() => {
        if (!showSplashOverlay || isFinishingRef.current) {
            return;
        }

        isFinishingRef.current = true;
        player.pause();

        Animated.timing(translateY, {
            toValue: -SCREEN_HEIGHT,
            duration: SLIDE_UP_DURATION_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setShowSplashOverlay(false);
        });
    }, [player, showSplashOverlay, translateY]);

    useEventListener(player, "playToEnd", () => {
        finishSplash();
    });

    useEventListener(player, "statusChange", ({ status }) => {
        if (status === "readyToPlay" && !hasStartedPlaybackRef.current) {
            hasStartedPlaybackRef.current = true;
            player.playbackRate = SPLASH_PLAYBACK_RATE;
            player.play();
            return;
        }

        if (status === "error") {
            setTimeout(finishSplash, ERROR_FALLBACK_DELAY_MS);
        }
    });

    useEventListener(player, "timeUpdate", ({ currentTime }) => {
        const duration = player.duration;
        if (duration <= 0) {
            return;
        }

        if (currentTime >= duration - END_THRESHOLD_SECONDS) {
            finishSplash();
        }
    });

    useEffect(() => {
        if (!showSplashOverlay) {
            return;
        }

        const timeoutId = setTimeout(finishSplash, HARD_TIMEOUT_MS);
        return () => clearTimeout(timeoutId);
    }, [finishSplash, showSplashOverlay]);

    return (
        <SafeAreaProvider>
            <View style={styles.root}>
                <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false, animation: "none" }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="index" />
                    <Stack.Screen name="splash" />
                    <Stack.Screen name="auth" />
                </Stack>

                {showSplashOverlay ? (
                    <Animated.View
                        pointerEvents="auto"
                        style={[styles.splashOverlay, { transform: [{ translateY }] }]}
                    >
                        <StatusBar hidden />
                        <VideoView
                            style={styles.splashVideo}
                            player={player}
                            nativeControls={false}
                            contentFit="cover"
                            allowsFullscreen={false}
                            allowsPictureInPicture={false}
                        />
                    </Animated.View>
                ) : null}
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    splashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#FFFFFF",
        zIndex: 100,
    },
    splashVideo: {
        flex: 1,
    },
});
