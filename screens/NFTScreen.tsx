import React, { useEffect, useState } from 'react';
import { AsyncStorage, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator, Image, FlatList, ScrollView, SafeAreaView, Button } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import Toast from 'react-native-toast-message';
import { NodeCameraView } from 'react-native-nodemediaclient';
import { Camera } from 'expo-camera';
import { Text, View } from '../components/Themed';
import Header from '../components/Header';
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
    'https://dfdkauczmutfqhxylsla.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZGthdWN6bXV0ZnFoeHlsc2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTYyMzIyMjksImV4cCI6MTk3MTgwODIyOX0.eO0nX3BP-w3WbEZraHbV6hi-YzY7Xsn0rC8PYuCM4hw',
    {
        localStorage: AsyncStorage,
    });

interface ButtonProps {
    address: string,
    streamID: string | undefined,
    onStream: (stream: any) => void,
    selectedNFT: string | null,
}
function GoliveButton({ address, selectedNFT, streamID, onStream }: ButtonProps) {
    const [loading, setLoading] = useState(false);

    const goLive = async () => {
        if (streamID) {
            return;
        }
        setLoading(true);
        try {
            const res = await axios.request({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer 383fd02b-e908-4376-a744-e40ab691c1e5',
                },
                data: {
                    "name": address,
                    "profiles": [
                        {
                            "name": "480p",
                            "bitrate": 1000000,
                            "fps": 30,
                            "width": 400,
                            "height": 400
                        },
                    ]
                },
                url: 'https://livepeer.studio/api/stream',
            })


            await supabase.from('streams').insert({
                id: res.data.id,
                current_nft: selectedNFT,
                url: `https://livepeercdn.com/hls/${res.data.playbackId}/index.m3u8`,
            });
            onStream(res.data);


        } catch (e) {
            Toast.show({
                type: 'error',
                text1: 'Unable to start livestream',
                text2: (e as any).toString()
            });
            console.log(e);

        } finally {
            setLoading(false);
        }
    };

    const stop = async () => {
        console.log('STOP');
        if (!streamID) {
            return;
        }
        setLoading(true);
        try {
            // const res = await axios.request({
            //     method: 'PATCH',
            //     headers: {
            //         'content-type': 'application/json',
            //         'authorization': 'Bearer 383fd02b-e908-4376-a744-e40ab691c1e5',
            //     },
            //     data: {
            //         suspended: true,
            //     },
            //     url: `https://livepeer.studio/api/stream/${streamID}`,
            // })
            await supabase.from('streams').
                delete().
                match({
                    id: streamID,
                });

            onStream(null);

        } catch (e) {
            Toast.show({
                type: 'error',
                text1: 'Unable to stop livestream',
                text2: (e as any).toString()
            });
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    // // Clean up.
    // useEffect(() => {
    //   return () => {
    //     stop();
    //   }
    // }, []);

    return (
        <TouchableOpacity onPress={streamID ? stop : goLive} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: streamID ? '#e74c3c' : "#3399FF",
            padding: 5,
            paddingRight: 12,
            paddingLeft: 12,
            borderRadius: 30,
        }}>
            <Image source={require('../assets/images/live.png')} resizeMode="contain" style={{ width: 20, height: 20, marginRight: 5, }} />
            <Text style={{
                color: 'white',
                fontWeight: 'bold',
            }}>{loading ? 'Loading...' : (streamID ? 'Stop' : 'Go Live')}</Text>
        </TouchableOpacity>
    )
}

interface StreamProps {
    selectedNFT: any,
    address: string,
    stream: any,
}
function NFTStream({ selectedNFT, address, stream }: StreamProps) {
    const SIZE = 380;
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const cameraViewRef = React.useRef(null);
    const url = `rtmp://rtmp.livepeer.com/live/${stream?.streamKey}`;

    // Clean up.
    useEffect(() => {
        if (cameraViewRef && cameraViewRef.current) {
            if (stream) {
                (cameraViewRef.current as any).start();
            } else {
                (cameraViewRef.current as any).stop();
            }
        }
    }, [stream, cameraViewRef, cameraViewRef?.current]);

    useEffect(() => {
        (async () => {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(cameraStatus === 'granted');
        })();
    }, []);

    if (hasPermission === null) {
        return <ActivityIndicator size='large' />;
    }
    if (!hasPermission) {
        return <Text>
            Need camera permissions to livestream
        </Text>;
    }

    let innerContent = null;
    if (selectedNFT) {
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
                        uri: selectedNFT.image_url,
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
                    <NodeCameraView
                        style={{ width: 120, height: 120 }}
                        ref={cameraViewRef}
                        outputUrl={url}
                        camera={{
                            cameraId: 1,
                            cameraFrontMirror: false
                        }}
                        audio={{
                            bitrate: 128000,
                            profile: 1,
                            samplerate: 44100,
                        }}
                        video={{
                            preset: 4,
                            bitrate: 500000,
                            profile: 2,
                            fps: 30,
                            videoFrontMirror: true,
                        }}
                        autopreview={true}
                    />
                </View>
            </>
        )
    }
    if (!selectedNFT) {
        innerContent = (
            <View style={{
                height: SIZE,
                width: SIZE,
                borderRadius: 10,
                overflow: 'hidden',
            }}>
                <NodeCameraView
                    style={{ width: SIZE, height: SIZE }}
                    ref={cameraViewRef}
                    outputUrl={url}
                    camera={{
                        cameraId: 1,
                        cameraFrontMirror: false
                    }}
                    audio={{
                        bitrate: 128000,
                        profile: 1,
                        samplerate: 44100,
                    }}
                    video={{
                        preset: 4,
                        bitrate: 500000,
                        profile: 2,
                        fps: 30,
                        videoFrontMirror: true,
                    }}
                    autopreview={true}
                />
            </View>

        )
    }

    return (
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
    );
}

interface ScreenProps {
    address: string,
}
export default function NFTScreen({ address }: ScreenProps) {
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<any[]>([]);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [selectedNFTIdx, setSelectedNFTIdx] = useState(-1);
    const [stream, setStream] = useState<any>(null);

    async function fetchAssets() {
        setLoading(true);
        let cachedAssets: any[] = [];
        let initial = true;
        let error = false;
        let next = null;
        while ((!!next || initial) && !error) {
            initial = false;
            try {
                const res: AxiosResponse<any> = await axios.request({
                    method: 'GET',
                    url: 'https://api.opensea.io/api/v1/assets',
                    params: { owner: '0x2f861225f121b11d193d8e6649106b34caca865c', cursor: next },
                    headers: { 'X-API-KEY': '87e0899016db4adfa5ae6d5a301e6a23' }
                });
                const data = res.data;
                next = data.next;
                const filteredAssets = (data.assets as any[]).filter(asset => {
                    console.log(asset);
                    return !asset.image_url.includes('.svg') && !asset.image_url.includes('.mp4') && !asset.image_url.includes('.gif');
                });
                cachedAssets = [...cachedAssets, ...filteredAssets];
            } catch (e) {
                Toast.show({
                    type: 'error',
                    text1: 'Unable to get listings from opensea',
                    text2: (e as any).toString()
                });
                error = true;
            }
        }
        setAssets(cachedAssets);
        setLoading(false);

    }

    useEffect(() => {
        (async () => {
            await fetchAssets();
        })();
    }, [address]);

    const content = loading ? <ActivityIndicator size='large' /> : (
        <FlatList data={assets}
            style={{
                // width: '100%',
                // height: '100%',
            }}
            numColumns={3}
            renderItem={({ item, index }) => {
                const asset = item as any;
                return <TouchableOpacity onPress={async () => {
                    if (selectedNFTIdx === index) {
                        if (stream) {
                            await supabase.from('streams').
                                update({ current_nft: null }).
                                match({
                                    id: stream.id,
                                });
                        }

                        setSelectedNFT(null);
                        setSelectedNFTIdx(-1);

                    } else {
                        if (stream) {
                            await supabase.from('streams').
                                update({ current_nft: item.image_url }).
                                match({
                                    id: stream.id,
                                });
                        }
                        setSelectedNFT(item);
                        setSelectedNFTIdx(index);
                    }

                }}>
                    <Image
                        key={asset.image_url}
                        style={[styles.NFT, (selectedNFTIdx === index) ? styles.NFTSelected : null]}
                        progressiveRenderingEnabled={true}
                        source={{
                            uri: asset.image_url,
                            width: 120,
                            height: 120,
                        }} />
                </TouchableOpacity>
            }}
            keyExtractor={asset => asset.image_url}
        />
    )

    const selectNFTContent = stream || selectedNFT ? <NFTStream address={address} stream={stream} selectedNFT={selectedNFT} /> : null;

    return (
        <>
            <Header leftElem={<GoliveButton selectedNFT={(selectedNFT as any)?.image_url} address={address} streamID={stream?.id} onStream={stream => {
                setStream(stream);
            }} />} />
            <View style={styles.container}>
                {selectNFTContent}
                {content}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    NFT: {
        height: 120,
        width: 120,
        borderRadius: 15,
        marginRight: 10,
        marginBottom: 10,
    },
    NFTSelected: {
        // opacity: 0,
        borderColor: '#3399FF',
        borderWidth: 5,
    },
    container: {
        flex: 1,
        width: Dimensions.get('window').width,
        flexDirection: 'column',
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
    buttonStyle: {
        backgroundColor: "#3399FF",
        borderWidth: 0,
        color: "#FFFFFF",
        borderColor: "#3399FF",
        height: 40,
        alignItems: "center",
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 20,
        marginBottom: 20,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        fontWeight: "600",
    },
});
