import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

const AuthHeader = ({ title, onBackPress }) => {
    return (
        <View style={styles.container}>
            <Pressable hitSlop={20} onPress={onBackPress}>
                <Image
                    source={require('../../assets/icons8-back-button-50.png')}
                />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

export default AuthHeader;
