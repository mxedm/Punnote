import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonItem, IonSpinner } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService from './DatabaseService'; // Import the DatabaseService
import './Home.css';

const Home: React.FC = () => {

  const lines = [
    "Awe man, that is bogus!",
    "Ahh there is going to be a bunch of these.",
    "I'm not sure if I can think of any more.",
    "I'm not sure if I can think of any more, again.",
    "OUCH! WHAT DO YOU DO?",
    "Oh no! My heel. -- Achilles",
    "This app will save lives.",
    "Nini. I love you.",
    "You're funny.",
    "No. I won't poop your pants.",
    "SHIFT UNITS!",
    "Trust women.",
    "Remember. Have fun out there.",
    "UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A B A SELECT START",
    "Sometimes the add button doesn't work...",
    "BUY BUY BUY."
  ];

  const lineCount = Number(lines.length) + 1;
  const newLineToAdd = "There are " + lineCount + " lines in this array."
  lines.push(newLineToAdd);

  const [loading, setLoading] = useState(true);
  const [randomLine, setRandomLine] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * lines.length);
    setRandomLine(lines[randomIndex]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bits = await DatabaseService.getBits();
        const setlists = await DatabaseService.getSetlists();
        const setlistItems = await DatabaseService.getSetlistItems();
        const shows = await DatabaseService.getShows();
        setLoading(false);
      } catch (error) {
        console.error("Data fetching error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Punnote</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader>
        </IonHeader>
        <IonItem className='loader' color='black'>
            <>
            <div>
              {loading ? (
                <IonSpinner name="lines"></IonSpinner>
              ) : (
                <span className='homeSplashtext'>{randomLine}</span>
              )}
            </div>
          </>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default Home;
