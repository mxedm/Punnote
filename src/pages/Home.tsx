import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonItem, IonSpinner } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService from './DatabaseService'; // Import the DatabaseService
import './Home.css';

const Home: React.FC = () => {

  const lines = [
    'Aww man, that is bogus!',
    'Oh, make sure you backup your jokes!',
    'OUCH! WHAT DO YOU DO?',
    'Oh no! My heel. -- Achilles',
    'This app will save lives.',
    'If you like this app, tell your boss to I want a comedy writing job. Works best when you work in a bank.',
    'There\'s only one rule that I know of, babies-"God damn it, you\'ve got to be kind."―Kurt Vonnegut',
    'Nini. I love you.',
    'You\'re funny.',
    'Trust women.',
    'Can I have a comedy writing job?',
    'Did you remember to backup your data?',
    'No. I won\'t poop your pants.',
    'Make jokes!',
    'Remember. Be safe out there.',
    'UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A B A SELECT START'
  ];

  //const lineCount = Number(lines.length) + 1;
  //const newLineToAdd = 'There are ' + lineCount + ' lines in this array.'
  //lines.push(newLineToAdd);

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
        console.error('Data fetching error:', error);
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
                <IonSpinner name='lines'></IonSpinner>
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
