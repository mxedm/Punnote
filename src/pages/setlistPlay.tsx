import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent, IonFabButton, useIonViewWillLeave, IonIcon,
  IonHeader, IonPage, IonTitle,
  IonToolbar, IonItem, IonButtons, IonToggle, IonText
} from '@ionic/react';
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
  const [autoScroll, setAutoScroll] = useState(true);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [playing, setPlaying] = useState(false);
  const itemListRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef(null);

  const fetchData = async (currentId: string) => {
    try {
      const fetchedBits = await DatabaseService.getBits();
      const allSetlistItems = await DatabaseService.getSetlistItems();
      const fetchedSetlist = await DatabaseService.getSetlist(Number(currentId));
      const filteredItems = allSetlistItems.filter(item => item.setlistID === Number(currentId));
      setBits(fetchedBits);
      setSetlistItems(filteredItems);
      setSetlist(fetchedSetlist);
      resetTimer();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(id);
  }, [id]);

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
    //console.log('resetting timer');
    setPlaying(false);
  };

  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const startTimer = async () => {
    if (!timer) {
      const newTimer = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
      setTimer(newTimer);
      if (autoScroll) {
        if (contentRef.current && setlist?.goalLength) {
          const goalLengthInSeconds = Number(setlist.goalLength) * 60;
          const numberOfIntervals = 100;
          const timeInterval = goalLengthInSeconds / numberOfIntervals;
          const scrollElement = await contentRef.current.getScrollElement();
          const distanceToBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
          const scrollStep = distanceToBottom / numberOfIntervals;
          let currentInterval = 0;
          scrollInterval.current = setInterval(() => {
            if (currentInterval >= numberOfIntervals) {
              clearInterval(scrollInterval.current!);
              return;
            }
            scrollElement.scrollBy(0, scrollStep);
            currentInterval++;
          }, timeInterval * 1000);
        }
      }
    } else {
      clearInterval(timer);
      setTimer(null);
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = null;
      }
    }
    keepAwake();
    setPlaying(!timer);
  };  

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
              Play: {setlist ? setlist.title : 'Loading...'} ({id})
          </IonTitle>
          <IonButtons slot='end' className='toggleArchiveButton'>
          <span className='archiveLabel'>Auto-Scroll</span>
          <IonToggle 
            checked={autoScroll} 
            onIonChange={e => setAutoScroll(e.detail.checked)} 
          />
        </IonButtons>
      </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='playWindow' ref={contentRef}>
        <div id='itemList' ref={itemListRef}>
            {setlistItems
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <IonItem key={item.id}>  {/* Move key here */}
                  <IonText color={item.isPlaintext ? 'tertiary' : 'dark'}> <h2>
                    { item.order }:&nbsp; 
                    {item.isPlaintext ? 
                      item.plaintext 
                      : 
                      `${bits.find(bit => bit.id === item.bitID)?.title} ${
                        (bits.find(bit => bit.id === item.bitID)?.length > 0) 
                          ? `(${formatTime(bits.find(bit => bit.id === item.bitID)?.length)})` 
                          : ''
                      }`
                    }
                  </h2>
                  </IonText>
                </IonItem>
              ))
            }
          </div>
        <IonToolbar class='bottom-toolbar'>
          <IonFabButton className='PlayButtons' slot='start' color={playing ? 'warning' : 'primary'} onClick={startTimer}>
            <IonIcon icon={playing ? pause : play} />
          </IonFabButton>
          <div className='playElapsedTime'>
            <h3 className='ion-text-center'>
              Timer: {formatTime(seconds)} {setlist?.goalLength ? `/ ${setlist?.goalLength}:00` : ''}
            </h3>
          </div>
          <IonFabButton className='PlayButtons' color='secondary' slot='end' onClick={resetTimer}>
            <IonIcon icon={refresh} />
          </IonFabButton>
        </IonToolbar>
      </IonContent>
    </IonPage>
  );
};

export default SetlistPlay;
