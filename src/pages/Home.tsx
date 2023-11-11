import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonItem, IonSpinner } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService from './DatabaseService'; // Import the DatabaseService
import './Home.css';

const Home: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [randomLine, setRandomLine] = useState('');

  const lines = [
    'Oh, make sure you back up your jokes!',
    'OUCH! WHAT DO YOU DO?',
    'If you like this app, tell your boss to I want a comedy writing job. Works best when you work in a bank.',
    'There\'s only one rule that I know of, babies-"God damn it, you\'ve got to be kind."<br />--Kurt Vonnegut',
    'No. I won\'t poop your pants.',
    'Make jokes!',
    'Be safe out there.',
    'YOUR JOKE HERE!<br /> <a href="http://www.patreon.com/queer_coded/">patreon.com/queer_coded</a>'
  ];

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

  function sanitizeHtml(html) {
    // First, remove all tags except <a> and <br>
    html = html.replace(/<(?!\/?a(?=>|\s.*>))\/?.*?>/gims, '');
    // Then remove any attributes from <a> tags except for href
    html = html.replace(/<a\s+([^>]*?)(href="[^"]+")[^>]*?>/gims, '<a $2>');
    // Finally, make sure <br> tags are self-closed to be XHTML compliant
    html = html.replace(/<br\s*([^\/>]*)(?<!\/)>/gims, '<br $1/>');
    return html;
  }

  // Usage
  useEffect(() => {
    const sanitizedLines = lines.map(line => sanitizeHtml(line));
    const randomIndex = Math.floor(Math.random() * sanitizedLines.length);
    setRandomLine(sanitizedLines[randomIndex]);
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
            <div className='homeSplashtext'>
              {loading ? (
                <IonSpinner name='lines'></IonSpinner>
              ) : (
                <div className='homeSplashtext' dangerouslySetInnerHTML={{ __html: randomLine }} />
              )}
            </div>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default Home;
