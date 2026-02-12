import { useEventListener } from "expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, TextInput, View } from "react-native";
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
    const [fontsLoaded] = useFonts({
        Nunito: require("../../assets/fonts/Nunito-Variable.ttf"),
    });
    const [showSplashOverlay, setShowSplashOverlay] = useState(true);
    const hasStartedPlaybackRef = useRef(false);
    const isFinishingRef = useRef(false);
    const hasAppliedGlobalTypographyRef = useRef(false);
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

    useEffect(() => {
        if (!fontsLoaded || hasAppliedGlobalTypographyRef.current) {
            return;
        }

        const textComponent = Text as any;
        const textInputComponent = TextInput as any;

        if (!textComponent.__nunitoPatched) {
            const originalTextRender = textComponent.render;
            textComponent.render = function patchedTextRender(...args: any[]) {
                const originElement = originalTextRender.call(this, ...args);
                if (!originElement || !originElement.props) {
                    return originElement;
                }

                return cloneElement(originElement, {
                    style: [{ fontFamily: "Nunito" }, originElement.props.style],
                });
            };
            textComponent.__nunitoPatched = true;
        }

        if (!textInputComponent.__nunitoDefaultStyleApplied) {
            textInputComponent.defaultProps = textInputComponent.defaultProps || {};
            textInputComponent.defaultProps.style = [
                { fontFamily: "Nunito" },
                textInputComponent.defaultProps.style,
            ];
            textInputComponent.__nunitoDefaultStyleApplied = true;
        }

        hasAppliedGlobalTypographyRef.current = true;
    }, [fontsLoaded]);

    return (
        <SafeAreaProvider>
            <View style={styles.root}>
                <Stack initialRouteName="onboarding" screenOptions={{ headerShown: false, animation: "none" }}>
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen
                        name="login"
                        options={{
                            animation: "slide_from_right",
                        }}
                    />
                    <Stack.Screen
                        name="register"
                        options={{
                            animation: "slide_from_right",
                        }}
                    />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                        name="notifications"
                        options={{
                            presentation: "transparentModal",
                            animation: "none",
                        }}
                    />
                    <Stack.Screen
                        name="notification-settings"
                        options={{
                            animation: "slide_from_right",
                        }}
                    />
                    <Stack.Screen
                        name="account-settings"
                        options={{
                            animation: "slide_from_right",
                        }}
                    />
                    <Stack.Screen name="index" />
                    <Stack.Screen name="splash" />
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
