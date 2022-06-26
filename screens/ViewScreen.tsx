import React, {useEffect, useState, useRef} from 'react';
import { AsyncStorage, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator, Image, FlatList, ScrollView, SafeAreaView, Button, TextInput } from 'react-native';
import axios, {AxiosResponse} from 'axios';
import Toast from 'react-native-toast-message';
import Header from '../components/Header';
import {  NodePlayerView } from 'react-native-nodemediaclient';


import { Text, View } from '../components/Themed';

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
    'https://dfdkauczmutfqhxylsla.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZGthdWN6bXV0ZnFoeHlsc2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTYyMzIyMjksImV4cCI6MTk3MTgwODIyOX0.eO0nX3BP-w3WbEZraHbV6hi-YzY7Xsn0rC8PYuCM4hw',
    {
        localStorage: AsyncStorage,
    });


interface StreamViewProps {
    streamID: string,
    streamUrl: string,
}
function StreamView({streamID, streamUrl}: StreamViewProps) {
    const SIZE = 400;
    const streamRef = useRef(null);
    const [NFTUrl, setNFTUrl] = useState(null)

    // Initial fetch.
    useEffect(() => {
         (async () => {
            const res = await supabase.from('streams').select('*').match({id: streamID});
            if (res.data) {
                setNFTUrl((res.data[0] as any).current_nft);
            }
         })();
    }, [])
    // Repeated fetch.
    useEffect(() => {
        const id = setInterval(async () => {
            const res = await supabase.from('streams').select('*').match({id: streamID});
            if (res.data) {
                setNFTUrl((res.data[0] as any).current_nft);
            }
        }, 1000);
        return () => {
            clearInterval(id);
        }
    }, []);

    console.log(streamUrl);

    let innerContent = (
        <View style={{
            height: SIZE,
            width: SIZE,
            borderRadius: 10,
            overflow: 'hidden',
          }}>
        <NodePlayerView
            style={{width: SIZE, height: SIZE}}
            ref={streamRef}
            inputUrl='https://livepeercdn.com/hls/206593p9v05my6e9/index.m3u8'
            scaleMode={"ScaleAspectFill"}
            bufferTime={300}
            maxBufferTime={1000}
            autoplay={true}
            onStatus={console.log}
        />
        </View>
    )
    if (NFTUrl) {
        innerContent = (
            <>
                <Image 
                style={{
                    height: SIZE,
                    width: SIZE,
                    borderRadius: 15,
                }} 
                progressiveRenderingEnabled={true} 
                source={{
                    uri: NFTUrl,
                    width: SIZE,
                    height: SIZE,
                }} />
                <View style={{
                height: 120,
                width: 120,
                borderRadius: 10,
                position: 'absolute',
                bottom: 0,
                right: 0,
                overflow: 'hidden',
                }}>
                <NodePlayerView
                    style={{width: 120, height: 120}}
                    ref={streamRef}
                    inputUrl={streamUrl}
                    scaleMode={"ScaleAspectFill"}
                    bufferTime={300}
                    maxBufferTime={1000}
                    autoplay={true}
                />
                </View>
            </>
        ); 
    }

    return (
        <>
        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#10ac84'}}>$20</Text>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#10ac84', marginBottom: 20}}>Current Bid</Text>
        </View>
        
        <View style={{
            marginBottom: 20,
            width: SIZE,
            height: SIZE,
            position: 'relative',
            shadowColor: "black",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            borderRadius: 15,
          }}>
            {innerContent}
            
          </View>
          <View style={{display: 'flex', flexDirection: 'row', marginTop: 10,marginBottom: 50, paddingLeft: 20, paddingRight: 20, width: '100%', justifyContent: 'space-around'}}>
            <Image resizeMode='contain'source={require('../assets/images/like.png')} style={{width: 50, height: 50, marginRight: 50}} />
            <Image resizeMode='contain' source={require('../assets/images/heart.png')} style={{width: 50, height: 50, marginRight: 50}} />
            <Image resizeMode='contain'source={require('../assets/images/dislike.png')} style={{width: 50, height: 50, }} />
        </View>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <TextInput style={{width: 200, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#c8d6e5', marginRight: 20}} placeholder=''></TextInput>
          <TouchableOpacity style={styles.buttonStyle}><Text style={styles.buttonTextStyle}>Place Bid!</Text></TouchableOpacity>
        </View>
        </>
    )
}


export default function ViewScreen() {
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState<any[]>([]);
    const [selectedStream, setSelectedStream] = useState<any>(null);

  useEffect(() => {
      setLoading(true);
      (async () => {
          try {
            const res = await supabase.from('streams').select('*');
            setStreams(res.data as any);
            console.log(res.data);
          } catch (e) {
            console.log(e);
            Toast.show({
                type: 'error',
                text1: 'Unable to get streams',
                text2: (e as any).toString()
            })
          } finally {
            setLoading(false);
          }
      })();
  }, [selectedStream])

  const content = loading ? <ActivityIndicator size='large' /> : (
    <FlatList data={streams}
        numColumns={3}
        renderItem={({ item, index }) => {
            const asset = item as any;
            return <TouchableOpacity onPress={async () => {
                setSelectedStream(item);
            }}>
                <Image
                    key={asset.id}
                    style={styles.stream}
                    progressiveRenderingEnabled={true}
                    source={asset.current_nft ? {
                        uri: asset.current_nft,
                        width: 120,
                        height: 120,
                    } : require('../assets/images/placeholder.png')} />
            </TouchableOpacity>
        }}
        keyExtractor={asset => asset.image_url}
    />
)

        const backBtn = (
            <TouchableOpacity onPress={() => {
                setSelectedStream(null);
            }}>
                <Text style={{color: '#3399FF', fontSize: 16}}>Back</Text>
            </TouchableOpacity>
        )

  return (
      <>
        <Header leftElem={!selectedStream ? null : backBtn} />
        <View style={styles.container}>
            {!selectedStream ? content : <StreamView streamID={selectedStream.id} streamUrl={selectedStream.url} />}
        </View>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stream: {
    height: 120,
    width: 120,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
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
