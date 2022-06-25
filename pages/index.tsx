import {useRef, useEffect} from 'react';
import 'video.js/dist/video-js.css';

import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import MuxVideo from '@mux-elements/mux-video-react';
import styles from '../styles/Home.module.css'
import { useRouter } from "next/router";
import videojs from "video.js";

const videoJsOptions = {
    autoplay: false,
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    width: 720,
    height: 300,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: '//vjs.zencdn.net/v/oceans.mp4',
        type: 'video/mp4',
      },
    ],
  };

const Home: NextPage = () => {
    const { query } = useRouter();
    const video = useRef(null);
    const id = query.id;
    // if (!id || Array.isArray(query)) {
    //     return <div>No Video</div>
    // }

    useEffect(() => {
        if (video.current) {
          videojs(video.current, {
            sources: [
              {
                src: "https://livepeercdn.com/hls/103d10ykfppgs8ss/index.m3u8",
                type: "application/x-mpegURL"
              }
            ]
          });
        }
      });

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <video controls ref={video} className="video-js" />
            </main>
        </div>
    )
}

export default Home
