import {useState} from "react";
import {
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Platform,
    TextInput,
    TouchableOpacity, Image, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import {useRouter} from "expo-router";
import styles from "../../assets/styles/create.styles";
import {Ionicons} from "@expo/vector-icons";
import COLORS from "../../constants/colors";
// ----------------------------------------------------------------------

const Create = () => {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [rating, setRating] = useState(3);
    const [image, setImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const pickImage = async () => {
        try {
            // Request permission if needed
            if (Platform.OS !== "web") {
                const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission denied", "We need camera roll permission to upload an image");
                    return;
                }
            }

            // Launch image library
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaType: "images",
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // lower quality for smaller base64
                base64: true,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);

                // if base64 is provided, use it
                if (result.assets[0].base64) {
                    setImageBase64(result.assets[0].base64);
                } else {
                    // otherwise, convert to base64
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setImageBase64(base64);
                }
            }
        } catch (error) {
            console.error("Error picking image", error);
            Alert.alert("Error", "There was a problem selecting your image");
        }
    }

    const handleSubmit = async () => {

    }

    const renderRatingPicker = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setRating(i)}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={i <= rating ? 'star' : 'star-outline'}
                        size={32}
                        color={i <= rating ? "#f4b400" : COLORS.textSecondary}
                    />
                </TouchableOpacity>
            );
        }
        return <View style={styles.ratingContainer}>{stars}</View>
    }

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Book Recommendation</Text>
                        <Text style={styles.subtitle}>Share your favorite reads with others</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Book Title */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Book Title</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="book-outline"
                                    size={20}
                                    color={COLORS.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter book title"
                                    placeholderTextColor={COLORS.placeholderText}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>

                        {/* Rating */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Your Rating</Text>
                            {renderRatingPicker()}
                        </View>

                        {/* Image */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Your Rating</Text>
                            <TouchableOpacity
                                style={styles.imagePicker}
                                onPress={pickImage}
                            >
                                {image ? (
                                    <Image source={{uri: image}} style={styles.previewImage}/>
                                ) : (
                                    <View style={styles.placeholderContainer}>
                                        <Ionicons name="image-outline" size={40} color={COLORS.textSecondary}/>
                                        <Text style={styles.placeholderText}>Tap to select image</Text>
                                    </View>
                                )}

                            </TouchableOpacity>
                        </View>

                        {/* Caption */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Caption</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Write your review or thoughts about this book..."
                                placeholderTextColor={COLORS.placeholderText}
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white}/>
                            ) : (
                                <>
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={20}
                                        color={COLORS.white}
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.buttonText}>Share</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Create;
