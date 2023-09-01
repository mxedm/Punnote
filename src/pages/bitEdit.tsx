import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
          IonContent, IonHeader, IonIcon, IonPage, IonTitle,
          IonToolbar, IonInput, IonButton, IonLabel, IonItem,
          IonButtons, IonToggle, IonTextarea
} from '@ionic/react';
import { starOutline, star } from 'ionicons/icons';
import './bitEdit.css';
import './standard.css';
import DatabaseService from './DatabaseService';

const bitEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bit, setBit] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [length, setLength] = useState(0);
  const [rating, setRating] = useState(0);
  const [archive, setArchive] = useState(false);

  const history = useHistory();

  useEffect(() => {
  }, [bit]);

  useEffect(() => {
    const fetchBit = async () => {
      const fetchedBits = await DatabaseService.getBits();
      const fetchedBit = fetchedBits.find(bit => bit.id === Number(id));
      if (fetchedBit) {
        setBit(fetchedBit);
        setTitle(fetchedBit.title);
        setContent(fetchedBit.content); 
        setNotes(fetchedBit.notes);     
        setLength(fetchedBit.length);   
        setRating(fetchedBit.rating);   
        setArchive(fetchedBit.archive); 
      }
    };
    fetchBit(); // call the function
  }, [id]);
  

  const updateBit = async () => {
    if (bit) {
      const updatedBit = {
        ...bit,
        title,
        content,
        notes,
        length,
        rating,
        archive,
      };
        await DatabaseService.editBit(updatedBit);
    }
  };

  const renderRating = () => {
    let stars: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IonIcon
          key={i}
          icon={i <= rating ? star : starOutline}
          onClick={() => setRating(i)}
        />
      );
    }
    return stars;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Bit Edit</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <div className='editWindow'>
      {bit && (
          <>
            <div>
              <div className="inputWrapper">
                <div className="customItem">
                  <label className="inputLabel">Title</label>
                  <input
                    aria-label="Title"
                    className="inputText"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="inputWrapper">
                <div className="customItem">
                  <label className="inputLabel">Content</label>
                  <textarea
                    aria-label="Content"
                    className="inputTextarea"
                    rows="6"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                </div>
              </div>

              <div className="inputWrapper">
                <div className="customItem">
                  <label className="inputLabel">Notes</label>
                  <input
                    aria-label="Bit Notes"
                    className="inputText"
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="inputWrapper">
                <div className="customItem">
                  <label className="inputLabel">Length (seconds)</label>
                  <input
                    aria-label="Length"
                    className="inputText"
                    type="text"
                    value={length}
                    onChange={e => setLength(Number(e.target.value))}
                  />
                </div>
              </div>
         
              <IonItem className="inputWrapper">
                <IonLabel className="inputLabel" position="floating">Rating</IonLabel>
                <div className='inputText inputRating'>{renderRating()}</div>
              </IonItem>

              <IonItem className="inputWrapper">
                <IonLabel className="inputLabel" position="">
                    <span className="archiveLabel">Bit Archived</span>
                </IonLabel>
                <IonButtons className="toggleArchiveButton" slot="">
                  <IonToggle 
                    labelPlacement="start"
                    aria-label="Archive Bit"
                    checked={archive} 
                    // onBlur={updateBit}
                    onIonChange={e => setArchive(e.detail.checked)} 
                  />
                </IonButtons>
              </IonItem>








              <div className='buttonContainer'>
                <IonButton shape="round" color="success" onClick={updateBit}>Save</IonButton> {/* Save button */}
                <IonButton shape="round" color="warning" onClick={() => history.push('/bitList')}>Close</IonButton>
              </div>
            </div>
          </>
        )}
        </div>

      </IonContent>
    </IonPage>
  );
};

export default bitEdit;
