import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withTiming,
    SharedValue,
    interpolateColor,
    interpolate
} from 'react-native-reanimated';

export default function SignupScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Entrance animations
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(30);

    // Interactive animations
    const usernameFocus = useSharedValue(0); // 0 to 1
    const emailFocus = useSharedValue(0);
    const passwordFocus = useSharedValue(0);
    const confirmPasswordFocus = useSharedValue(0);
    const signupBtnScale = useSharedValue(1);

    useEffect(() => {
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withSpring(1);
        formOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
        formTranslateY.value = withDelay(400, withSpring(0));
    }, []);

    // Animated styles
    const animatedLogoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }]
    }));

    const animatedFormStyle = useAnimatedStyle(() => ({
        opacity: formOpacity.value,
        transform: [{ translateY: formTranslateY.value }]
    }));

    const createInputStyle = (focusValue: SharedValue<number>) => {
        return useAnimatedStyle(() => {
            return {
                transform: [{ scale: interpolate(focusValue.value, [0, 1], [1, 1.02]) }],
                borderColor: interpolateColor(
                    focusValue.value,
                    [0, 1],
                    ['#38A3A5', '#2DD4BF']
                ),
                backgroundColor: interpolateColor(
                    focusValue.value,
                    [0, 1],
                    ['rgba(30, 50, 67, 0.7)', 'rgba(45, 212, 191, 0.1)']
                ),
                borderWidth: 2, // Constant width prevents jitter
            };
        });
    };

    const usernameAnimatedStyle = createInputStyle(usernameFocus);
    const emailAnimatedStyle = createInputStyle(emailFocus);
    const passwordAnimatedStyle = createInputStyle(passwordFocus);
    const confirmPasswordAnimatedStyle = createInputStyle(confirmPasswordFocus);

    const signupBtnAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: signupBtnScale.value }]
    }));

    const handleFocus = (focusValue: SharedValue<number>) => {
        focusValue.value = withTiming(1, { duration: 450 });
    };

    const handleBlur = (focusValue: SharedValue<number>) => {
        focusValue.value = withTiming(0, { duration: 450 });
    };

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword || !username) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert("Signup Failed", error.message);
            return;
        }

        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert([
                { id: data.user.id, username }
            ]);

            if (profileError) {
                console.error("Error creating profile:", profileError);
            }
        }

        Alert.alert(
            "Verify Your Email",
            "We've sent a verification link to your email address. Please confirm your email to activate your account.",
            [{ text: "OK", onPress: () => router.push('/auth/login') }]
        );
    };

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                source={require('../../assets/images/back.png')}
                style={styles.backgroundImage}
                contentFit="cover"
            />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.innerContainer}
                >
                    <Animated.View style={[styles.header, animatedLogoStyle]}>
                        <View style={styles.logoRow}>
                            <Text style={styles.logoText}>STHEN</Text>
                            <Image
                                source={require('../../assets/images/umjestoO.png')}
                                style={styles.logoImage}
                                contentFit="contain"
                            />
                            <Text style={styles.logoText}>S</Text>
                        </View>
                        <Text style={styles.subtitle}>Join the Forge.</Text>
                    </Animated.View>

                    <Animated.View style={[styles.formContainer, animatedFormStyle]}>
                        {/* Username Input */}
                        <Animated.View style={[styles.inputWrapper, usernameAnimatedStyle]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#819DA7"
                                value={username}
                                onChangeText={setUsername}
                                onFocus={() => handleFocus(usernameFocus)}
                                onBlur={() => handleBlur(usernameFocus)}
                                autoCapitalize="none"
                            />
                        </Animated.View>

                        {/* Email Input */}
                        <Animated.View style={[styles.inputWrapper, emailAnimatedStyle]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#819DA7"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => handleFocus(emailFocus)}
                                onBlur={() => handleBlur(emailFocus)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </Animated.View>

                        {/* Password Input */}
                        <Animated.View style={[styles.inputWrapper, passwordAnimatedStyle]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#819DA7"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => handleFocus(passwordFocus)}
                                onBlur={() => handleBlur(passwordFocus)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.toggleIcon}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={22}
                                    color="#2DD4BF"
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Confirm Password Input */}
                        <Animated.View style={[styles.inputWrapper, confirmPasswordAnimatedStyle]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#819DA7"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                onFocus={() => handleFocus(confirmPasswordFocus)}
                                onBlur={() => handleBlur(confirmPasswordFocus)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.toggleIcon}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                    size={22}
                                    color="#2DD4BF"
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Sign Up Button */}
                        <View style={styles.buttonCenterer}>
                            <Pressable
                                onPress={handleSignup}
                                onPressIn={() => signupBtnScale.value = withSpring(0.95)}
                                onPressOut={() => signupBtnScale.value = withSpring(1)}
                                style={({ pressed }) => [
                                    styles.signupButton,
                                    pressed && styles.signupButtonPressed
                                ]}
                            >
                                <Animated.View style={[styles.buttonContent, signupBtnAnimatedStyle]}>
                                    <Text style={styles.signupButtonText}>SIGN UP</Text>
                                    <Image
                                        source={require('../../assets/images/sword.png')}
                                        style={styles.swordIcon}
                                        contentFit="contain"
                                    />
                                </Animated.View>
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View style={[styles.footer, animatedFormStyle]}>
                        <Text style={styles.footerText}>
                            Already have an account?{' '}
                            <Text
                                style={styles.loginText}
                                onPress={() => router.push('/auth/login')}
                            >
                                Log In
                            </Text>
                        </Text>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E3243',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.25,
        zIndex: 0,
    },
    safeArea: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 40,
        justifyContent: 'center',
        zIndex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30, // Reduced to fit 4 fields well
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoText: {
        fontSize: 58,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    logoImage: {
        width: 62,
        height: 72,
        marginTop: 8,
        marginLeft: -4,
        marginRight: -16,
    },
    subtitle: {
        fontSize: 18,
        color: '#A0B2BC',
        fontWeight: '400',
        letterSpacing: 1,
    },
    formContainer: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 30,
        paddingHorizontal: 22,
        height: 60,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 17,
    },
    toggleIcon: {
        padding: 5,
    },
    buttonCenterer: {
        alignItems: 'center',
        marginTop: 10,
    },
    signupButton: {
        backgroundColor: '#38A3A5',
        borderRadius: 25,
        height: 54,
        width: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#38A3A5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    signupButtonPressed: {
        opacity: 0.9,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupButtonText: {
        color: '#1A2D3A',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginRight: 10,
    },
    swordIcon: {
        width: 30,
        height: 30,
        transform: [{ rotate: '45deg' }],
    },
    footer: {
        marginTop: 50,
        alignItems: 'center',
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    loginText: {
        color: '#38A3A5',
        fontWeight: 'bold',
    },
});
