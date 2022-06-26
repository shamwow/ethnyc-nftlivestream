import React, {useState, ReactNode} from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

import { Text, View } from '../components/Themed';
import { useWalletConnect } from '@walletconnect/react-native-dapp';

const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`;
  }

interface HeaderProps {
    leftElem?: ReactNode,
}
export default function Header({leftElem}: HeaderProps) {
    const connector = useWalletConnect();

    const killSession = React.useCallback(() => {
        return connector.killSession();
      }, [connector]);

    return (
        <View style={{marginTop: 50, height: 50, paddingLeft: 20, paddingRight: 20, marginBottom: 20, alignContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{width: 100}}>{leftElem}</View>
            <View style={{width: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}>
                <Image source={require('../assets/images/logo-icon.png')} style={{height: 30, width: 30}} /></View>
            <TouchableOpacity style={{width: 100}} onPress={killSession}><Text >{shortenAddress(connector.accounts[0] || '0x2f861225f121b11d193d8e6649106b34caca865c')}</Text></TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    tabButtonSelectedStyle: {
      backgroundColor: '#3399FF',
    },
    buttonStyle: {
      backgroundColor: "#3399FF",
      borderWidth: 0,
      color: "#FFFFFF",
      borderColor: "#3399FF",
      height: 40,
      alignItems: "center",
      borderRadius: 30,
    },
    buttonTextStyle: {
      color: "#FFFFFF",
      paddingVertical: 10,
      paddingHorizontal: 15,
      fontSize: 16,
      fontWeight: "600",
    },
  });