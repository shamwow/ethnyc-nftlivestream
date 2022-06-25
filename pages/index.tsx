import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import MuxVideo from '@mux-elements/mux-video-react';
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <MuxVideo
                    style={{ height: '100%', maxWidth: '100%' }}
                    playbackId="OZBWaPwa4GgwsTiAgrpuMGSbOGisXYCL01tiokxn00PFc"
                    metadata={{
                        video_id: 'video-id-123456',
                        video_title: 'Super Interesting Video',
                        viewer_user_id: 'user-id-bc-789',
                    }}
                    streamType="on-demand"
                    controls
                    autoPlay
                    muted
                />
            </main>

            <footer className={styles.footer}>

            </footer>
        </div>
    )
}

export default Home
