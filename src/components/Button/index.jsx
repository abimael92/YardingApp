import React from 'react';
import { Pressable, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

const Button = ({ title }) => {
    const handlePress = () => {
        console.log('Button Clicked!');
    };
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={handlePress}
            style={styles.container}>
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
};

export default Button;
