import React, { useState } from 'react';
import {
    Image,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from './styles';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

const Input = ({ label, placeholder, isPassword }) => {
    const [passwordShown, setPasswordShown] = useState(false);

    const onEyePress = () => {
        setPasswordShown(!passwordShown);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    secureTextEntry={isPassword && !passwordShown}
                    placeholder={placeholder}
                    style={styles.input}
                />

                {isPassword && (
                    <Pressable style={styles.eyeButton} onPress={onEyePress}>
                        <Image
                            style={styles.eyeIcon}
                            source={
                                passwordShown
                                    ? require('../../assets/view_709612.png')
                                    : require('../../assets/hide_2767146.png')
                            }
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export default Input;
