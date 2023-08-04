import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import Button from '../../../components/Button';

export const Splash = () => {
    return (
        <>
            <View style={styles.container}>
                <Image
                    resizeMode="contain"
                    style={styles.image}
                    source={require('../../../assets/welcome.jpeg')}
                />
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>You'll Find </Text>
                    <Text style={[styles.title, styles.innerTitle]}>
                        All You Need
                    </Text>
                    <Text style={styles.title}> Here!</Text>
                </View>
                <Button title={'Sign Up'} />
                <Pressable hitSlop={20}>
                    <Text style={styles.footerText}>Sign In</Text>
                </Pressable>
            </View>
        </>
    );
};

export default Splash;
