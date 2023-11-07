import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
          IonContent, IonHeader, IonIcon, IonPage, IonTitle,
          IonToolbar, IonButton, IonSegmentButton, IonSegment,
          IonLabel, IonModal, IonText
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
  const [modified, setModified] = useState('');
  const [created, setCreated] = useState('');
  const [revision, setRevision] = useState(0)
  const [infoModal, setInfoModal] = useState(false);
  const history = useHistory();

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
  }, [bit]);

  useEffect(() => {
    autoResizeTextarea(titleRef.current);
    autoResizeTextarea(contentRef.current);
    autoResizeTextarea(notesRef.current);
  }, [title, content, notes]);

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
        setCreated(fetchedBit.created);
        setModified(fetchedBit.modified);
        setRevision(fetchedBit.revision);
      }
    };
    fetchBit(); 
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
          className='goldenStar'
          key={i}
          icon={i <= rating ? star : starOutline}
          onClick={() => setRating(i)}
        />
      );
    }
    return stars;
  };

  const autoGrow = (event) => {
    event.target.style.height = '35px'; // temporarily shrink to get the scroll height
    event.target.style.height = event.target.scrollHeight + 'px';
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
    }
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
              <div className='inputWrapper'>
                <div className='customItem'>
                <label className='inputLabel'>Title</label>
                  <textarea
                    ref={titleRef}
                    aria-label='Title'
                    className='inputTextarea'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onInput={autoGrow}
                    style={{ resize: 'none' }} // Prevent manual resizing
                  />
                </div>
              </div>
              <div className='inputWrapper'>
                <div className='customItem'>
                  <label className='inputLabel'>Content</label>
                  <textarea
                    ref={contentRef}
                    aria-label='Content'
                    className='inputTextarea'
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onInput={autoGrow}
                  />
                </div>
              </div>
              <div className='inputWrapper'>
                <div className='customItem'>
                  <label className='inputLabel'>Notes</label>
                  <textarea
                    ref={notesRef}
                    aria-label='Bit Notes'
                    className='inputTextarea'
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    onInput={autoGrow}
                    style={{ resize: 'none' }} // Prevent manual resizing
                  />
                </div>
              </div>
              <div className='flexParent'>
                <div className='inputWrapper halfWidth'>
                  <div className='customItem'>
                    <label className='inputLabel'>Length (seconds)</label>
                    <input
                      aria-label='Length'
                      className='inputText'
                      type='number'
                      value={length}
                      onChange={e => setLength(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className='inputWrapper halfWidth'>
                  <div className='customItem'>
                    <label className='inputLabel'>
                      Rating
                    </label>
                    <div className='inputText'>{renderRating()}</div>
                  </div>
                </div>
              </div>
              <div className='buttonContainer'>
                <IonButton shape='round' color='success' onClick={updateBit}>Save</IonButton> {/* Save button */}
                <IonButton shape='round' onClick={() => {
                  setInfoModal(true);
                }}>Info</IonButton>
                <IonButton shape='round' color='warning' className='hidden' onClick={() => history.push('/bitList')}>Close</IonButton>
              </div>
              <IonModal isOpen={infoModal} 
                className=''>
              <div className='inputWrapper'>
                <div className='customItem'>
                  <IonText>
                  <h2>Bit Info</h2>
                    <p className='infoTextModal'>Created: {created.toLocaleString()}</p>
                    <p className='infoTextModal'>Modified: {modified.toLocaleString()}</p>
                    <p className='infoTextModal'>Edits: {revision}</p>
                  <h2>Archive?</h2>
                    <p className='infoTextModal'>This is a toggle for the archive function. 
                      This will remove the item from the main list but will not delete it. Archived
                      items are always available by toggling the switch at the top of the respective
                      list screen(s).
                    </p>
                    <IonSegment
                      value={archive ? 'archived' : 'not-archived'}
                      onIonChange={(e) => setArchive(e.detail.value === 'archived')}
                    >
                      <IonSegmentButton value='archived'>
                        <IonLabel>Archived</IonLabel>
                      </IonSegmentButton>
                      <IonSegmentButton value='not-archived'>
                        <IonLabel>Not Archived</IonLabel>
                      </IonSegmentButton>
                    </IonSegment>
                  </IonText>
                </div>
              </div>
              <IonButton shape='round' onClick={() => {
                  setInfoModal(false);
              }}>close</IonButton>
            </IonModal>
            </div>
          </>
        )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default bitEdit;
