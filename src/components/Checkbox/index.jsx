import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

const Checkbox = ({ checked, onCheck }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => onCheck(!checked)}
            style={styles.container}>
            {checked && (
                <View style={styles.innerContainer}>
                    <Image
                        style={styles.checkIcon}
                        source={require('../../assets/icons8-check-50.png')}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default React.memo(Checkbox);
