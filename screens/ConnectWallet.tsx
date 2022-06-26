import React, {useState} from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

import Header from '../components/Header';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import NFTScreen from './NFTScreen';
import ViewScreen from './ViewScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FooterProps {
    currentPage: number,
    onCurrentPageChange: (page: number) => void,
}
function Footer({currentPage, onCurrentPageChange}: FooterProps) {
    const images = [
        {
            selected: require('../assets/images/stream-white.png'),
            unselected: require('../assets/images/stream-grey.png'), 
        },
        {
            selected: require('../assets/images/watch-white.png'),
            unselected: require('../assets/images/watch-grey.png'), 
        },
    ]
    const textStyles = {
        selected: {
            color: 'white',
            fontWeight: 'bold',
            marginTop: 5,
        },
        unselected: {
            color: '#DADADA',
            fontWeight: 'bold',
            marginTop: 5,
        },
    }

    return (
            <View style={{
                alignContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                borderTopColor: '#c8d6e5',
                borderTopWidth: 1,
                //  height: 75,
                width: '100%',
                // marginBottom: 20,
            }}>
                <TouchableOpacity 
                    onPress={() => {onCurrentPageChange(0)}} 
                    style={[styles.tabButtonStyle, currentPage === 0 ? styles.tabButtonSelectedStyle : null]}
                    >
                    <Image source={images[0][currentPage === 0 ? 'selected' : 'unselected']} style={{height: 16, width: 18}} />
                    <Text style={textStyles[currentPage === 0 ? 'selected' : 'unselected']}>Stream</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {onCurrentPageChange(1)}} 
                    style={[styles.tabButtonStyle, currentPage === 1 ? styles.tabButtonSelectedStyle : null]}
                    >
                    <Image source={images[1][currentPage === 1 ? 'selected' : 'unselected']} style={{height: 16, width: 18}} />
                    <Text style={textStyles[currentPage === 1 ? 'selected' : 'unselected']}>Watch</Text>
                </TouchableOpacity>
            </View>
    )
}

export default function ConnectWallet() {
  const connector = useWalletConnect();
  const [currentPage, setCurrentPage] = useState(0);
  const [manualAddr, setManualAddr] = useState('');
  const [connectManual, setManual] = useState(false);


  const connectWallet = React.useCallback(() => {
    return connector.connect();
  }, [connector]);


  return (
    <View style={styles.container}>

      {(!connector.connected && !connectManual) && (
          <>
            <Image style={{marginBottom: 50,height: 100, width:200}} source={require('../assets/images/logo.png')} resizeMode="contain" />
            <TouchableOpacity onPress={connectWallet} style={styles.buttonStyle}>
                <Text style={styles.buttonTextStyle}>Connect a Wallet</Text>
            </TouchableOpacity>
            <TextInput value={manualAddr} onChangeText={setManualAddr} style={{marginTop: 30}} placeholder='Or Enter Manually'></TextInput>
            {manualAddr.length > 0 ? <TouchableOpacity onPress={() => setManual(true)} style={styles.buttonStyle}>
                <Text style={styles.buttonTextStyle}>Connect</Text>
            </TouchableOpacity> : null}
          </>
        
      )}
      {(!!connector.connected || connectManual) && (
          <View>
            {
                currentPage === 0 ? 
                    <NFTScreen address={connector.accounts[0] || manualAddr} /> :
                    <ViewScreen />
            }
            
            <Footer currentPage={currentPage} onCurrentPageChange={setCurrentPage} />
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  tabButtonStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 10,
    height: 75,
    flex: 1,
    width: '200%',
  },
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
