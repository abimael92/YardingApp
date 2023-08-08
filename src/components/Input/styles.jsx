import { StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';

export const styles = StyleSheet.create({
    container: {
        marginBottom: 20
    },
    label: {
        paddingVertical: 8,
        color: colors.blue,
        fontSize: 14,
        fontWeight: '500'
        // textAlign: 'center',
        // color: colors.white
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: colors.grey,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center'
        // paddingVertical: 5
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        flex: 1
        // padding: 5
        // backgroundColor: colors.yellow
    },
    eyeButton: {
        paddingHorizontal: 10,
        alignItems: 'center', // Add this line
        justifyContent: 'center', // Add this line
        borderColor: colors.blue,
        borderWidth: 1,
        padding: 4,
        marginRight: 8
    },
    eyeIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        color: colors.blue // Add this line
    }
});
