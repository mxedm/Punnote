import React, { useState, useEffect, useRef } from 'react';
import { 
          IonContent, IonFab, IonFabButton, useIonViewWillLeave, IonIcon, 
          IonHeader, IonButton, useIonViewWillEnter, IonPage, IonTitle, 
          IonToolbar, IonItem } from '@ionic/react';
import { play, pause, refresh } from 'ionicons/icons';
import './setlistPlay.css';
import './standard.css';
import { useParams } from 'react-router-dom';
import DatabaseService, { Setlist } from './DatabaseService';
import { SetlistItem, Bit } from './DatabaseService';
import { KeepAwake } from '@capacitor-community/keep-awake';

const SetlistPlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [setlistItems, setSetlistItems] = useState<SetlistItem[]>([]);
  const [bits, setBits] = useState<Bit[]>([]);
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [playing, setPlaying] = useState(false);
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);
  
  useEffect(() => {
    return () => {
      if(timer !== null) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  useIonViewWillEnter(async () => {  
    await Promise.all([fetchBits(), fetchSetlistItems(), fetchSetlist()]);  
  });

  useIonViewWillLeave(() => {
    allowSleep();
  });

  const keepAwake = async () => {
    await KeepAwake.keepAwake();
  };

  const allowSleep = async () => {
    await KeepAwake.allowSleep();
  };

  const resetTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setSeconds(0);
    allowSleep();
    console.log('resetting timer');
    setPlaying(false);
  };

  const startTimer = () => {
    if (!timer) {
      const newTimer = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
      setTimer(newTimer);
    } else {
      clearInterval(timer);
      setTimer(null);
    }
    keepAwake();
    console.log('starting timer');
    setPlaying(!timer); 
  };

  const fetchBits = async () => {
    const fetchedBits = await DatabaseService.getBits();
    setBits(fetchedBits);
  };

  const fetchSetlist = async () => {
    const fetchedSetlist = await DatabaseService.getSetlist(Number(id));
    setSetlist(fetchedSetlist);
  };

  const fetchSetlistItems = async () => {
    const allSetlistItems = await DatabaseService.getSetlistItems();
    const filteredItems = allSetlistItems.filter(item => item.setlistID === Number(id));
    setSetlistItems(filteredItems);
  };

  const totalLength = setlistItems.reduce((total, item) => {
    const correspondingBit = bits.find(bit => bit.id === item.bitId);
    return total + (Number(correspondingBit?.length) || 0);
  }, 0);

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <IonPage className='playWindow'>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
              Play: {setlist ? setlist.title : 'Loading...'} ({formatTime(totalLength)})
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='playWindow'>
          {setlistItems
            .sort((a, b) => a.order - b.order)
            .map((item, index) => (
              <IonItem key={item.id} className={item.isPlaintext ? "playerPlaintext" : "playerBit"}>
                <h2>{ item.order }:&nbsp; 
                  {item.isPlaintext ? 
                    item.plaintext 
                    : 
                    bits.find(bit => bit.id === item.bitID)?.title
                  }
                </h2>
              </IonItem>
            ))}

      <IonFab vertical="bottom" horizontal="center" slot="fixed">
        <IonFabButton color={playing ? 'warning' : 'primary'} onClick={startTimer}>
          <IonIcon icon={playing ? pause : play} />
        </IonFabButton>
      </IonFab>
      <IonFab vertical="bottom" horizontal="start" slot="fixed">
        <IonFabButton color="secondary" onClick={resetTimer}>
          <IonIcon icon={refresh} />
        </IonFabButton>
      </IonFab>

      <div className="playElapsedTime">
        <h3>Timer <br /> {formatTime(seconds)}</h3>
      </div>
      </IonContent>

    </IonPage>
  );
};

export default SetlistPlay;
