import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';
import AuthHeader from '../../../components/AuthHeader';
import Input from '../../../components/Input';

function Signup() {
    return (
        <View style={styles.container}>
            <AuthHeader title={'Sign Up'} />
            <Input label={'Name'} placeholder={'John Doe'} />
            <Input label={'E-mail'} placeholder={'example@gmail.com'} />
            <Input isPassword label={'Password'} placeholder={'*******'} />
        </View>
    );
}

export default Signup;
