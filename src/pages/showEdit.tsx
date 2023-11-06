import {  IonContent, IonIcon, IonHeader, IonPage, 
          IonTitle, IonToolbar, IonButton, 
          IonDatetime, IonModal, IonSegment, 
          IonSegmentButton, IonLabel, IonText
         } from '@ionic/react';
import { starOutline, star, calendar, playCircle } from 'ionicons/icons';
import './showEdit.css';
import { useParams, useHistory } from 'react-router-dom';
import DatabaseService from './DatabaseService';
import { useEffect, useState } from 'react';

const ShowEdit: React.FC = () => {
  const { id } = useParams<{id: string}>(); 
  const [show, setShow] = useState(null); 
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [showdate, setShowDate] = useState(''); 
  const [setlength, setSetLength] = useState(0);
  const [compensation, setCompensation] = useState(0);
  const [mediaurl, setMediaURL] = useState('');
  const [type, setType] = useState('');
  const [setlistID, setSetlistID] = useState(0);
  const [rating, setRating] = useState(0);
  const [archive, setArchive] = useState(false);
  const [setlists, setSetlists] = useState([]);
  const [modified, setModified] = useState('');
  const [created, setCreated] = useState('');
  const [revision, setRevision] = useState(0)
  const [showModal, setShowModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);

  const history = useHistory();

  useEffect(() => {
  }, [show]);
  
  useEffect(() => {
    const fetchShow = async () => {
      const fetchedShows = await DatabaseService.getShows();
      const fetchedShow = fetchedShows.find(show => show.id === Number(id)); 
      if (fetchedShow) {
        setShow(fetchedShow);
        setTitle(fetchedShow.title);
        setVenue(fetchedShow.venue);
        setNotes(fetchedShow.notes);
        setShowDate(fetchedShow.showdate);
        setSetLength(fetchedShow.setlength);
        setCompensation(fetchedShow.compensation);
        setMediaURL(fetchedShow.mediaurl);
        setType(fetchedShow.type);
        setSetlistID(fetchedShow.setlistID);
        setRating(fetchedShow.rating);
        setArchive(fetchedShow.archive);
        setCreated(fetchedShow.created);
        setModified(fetchedShow.modified);
        setRevision(fetchedShow.revision);


      }
    };
    fetchShow(); 
  }, [id]); 

  useEffect(() => {
    const fetchData = async () => {
      const fetchedShows = await DatabaseService.getShows();
      const fetchedSetlists = await DatabaseService.getSetlists();
      const fetchedShow = fetchedShows.find(show => show.id === Number(id));
      if (fetchedShow) {
        setSetlists(fetchedSetlists);
        setSetlistID(fetchedShow.setlistID); // set this to the fetchedShow.setlistID, not the fetchedSetlist object
      }
    };
    fetchData();
  }, [id]);
  

  const renderRating = () => {
    let stars = [];
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

  const handlePlay = (setlistId: number) => {
    history.push(`/SetlistPlay/${setlistId}`); 
  };

  const updateShow = async () => {
    if (show) {
      const updatedShow = {
        ...show,
        title,
        venue,
        notes,
        showdate,
        setlength,
        compensation,
        mediaurl,
        type,
        setlistID,
        archive, 
        rating,
        created,
        modified,
        revision
      };
      await DatabaseService.editShow(updatedShow);
    }
  };  

  const goToSetlistPlay = () => {
    history.push(`/SetlistPlay/${setlistID}`);
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Show Editor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='editWindow'>
        {show && (
          <>
          <div>
            <div className='inputWrapper'>
              <div className='customItem'>
                <label className='inputLabel'>Title</label>
                <input
                  aria-label='Show Title'
                  className='inputText'
                  type='text'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div className='inputRow'>
              <div className='inputWrapper'>
                <div className='customItem inlineTextInput'>
                  <label className='inputLabel'>Date</label>
                  <input
                    aria-label='Date' 
                    className='inputText dateInput'
                    type='text'
                    value={
                      showdate
                        ? new Intl.DateTimeFormat('en-US', {
                            day: 'numeric',
                            month: 'numeric',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).format(new Date(showdate))
                        : 'N/A' 
                    }
                    readOnly
                  />
                </div>
                <IonButton
                    className='inlineButton'
                    onClick={() => {
                    setShowModal(true);
                }}>
                  <IonIcon 
                    icon={calendar}
                    >
                  </IonIcon>
                </IonButton>
              </div>
            </div>

            <div className='inputWrapper'>
              <div className='customItem'>
                <label className='inputLabel'>Venue</label>
                <input
                  aria-label='Show Venue'
                  className='inputText'
                  type='text'
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                />
              </div>
            </div>
            <div className='inputWrapper'>
              <div className='customItem'>
                <label className='inputLabel'>Notes</label>
                <input
                  aria-label='Show Notes'
                  className='inputText'
                  type='text'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className='flexParent'>
              <div className='inputWrapper halfWidth'>
                <div className='customItem'>
                  <label className='inputLabel'>Set Length</label>
                  <input
                    aria-label='Set Length'
                    className='inputText'
                    type='number'
                    value={setlength}
                    onChange={e => setSetLength(e.target.value)}
                  />
                </div>
              </div>
              <div className='inputWrapper halfWidth'>
                <div className='customItem'>
                  <label className='inputLabel'>Compensation</label>
                  <input
                    aria-label='Compensation'
                    className='inputText'
                    type='number'
                    value={compensation}
                    onChange={e => setCompensation(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className='flexParent'>
              <div className='inputWrapper halfWidth'>
                <div className='customItem'>
                  <label className='inputLabel'>Show Type</label>
                  <select
                    aria-label='Show Type'
                    className='inputText'
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    <option value=''>Not Set</option>
                    <option value='Mic'>Mic</option>
                    <option value='Showcase'>Showcase</option>
                    <option value='Regular'>Regular</option>
                    <option value='Drop In'>Drop In</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>
              </div>
              <div className='inputWrapper halfWidth'>
                <div className='customItem'>
                  <label className='inputLabel'>Rating</label>
                  <div className='inputText goldenStar'>
                    {renderRating()}
                  </div>
                </div>
              </div>
            </div>

            <div className='flexParent'>
              <div className='inputWrapper inlineTextInput'>
                <div className='customItem '>
                  <label className='inputLabel'>Setlist</label>
                  <select
                    aria-label='Setlist'
                    className='inputText'
                    value={setlistID}
                    onChange={e => setSetlistID(Number(e.target.value))}
                  >
                    <option value={0}>None</option>
                    {setlists.map(setlist => (
                      <option key={setlist.id} value={setlist.id}>
                        {setlist.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='inputWrapper inlineButton'>
                <div className='customItem '>
                  <IonButton
                    className=''
                    onClick={goToSetlistPlay}
                  >
                    <IonIcon 
                      icon={playCircle}>
                    </IonIcon>
                  </IonButton>
                </div>
              </div>
            </div>

            <div className='inputWrapper'>
              <div className='customItem'>
                <label className='inputLabel'>URL</label>
                <input
                  aria-label='Show URL'
                  className='inputText'
                  type='text'
                  value={mediaurl}
                  onChange={e => setMediaURL(e.target.value)}
                />
              </div>
            </div>

            <div className='buttonContainer'>
              <IonButton shape='round' color='success' onClick={updateShow}>Save</IonButton>
              <IonButton shape='round' onClick={() => {
                  setInfoModal(true);
              }}>Info</IonButton>
              <IonButton shape='round' className='hidden' color='warning' onClick={() => history.push('/showList')}>Close</IonButton>
            </div>

            <IonModal isOpen={showModal} 
                className='my-datetime-class'>
              <div className='datePickerModal'>
                <IonDatetime
                  displayFormat='MM DD YYYY'
                  value={showdate}
                  onIonChange={e => setShowDate(e.detail.value)}
                />
                <div className='modalButtons'>
                  <IonButton shape='round' onClick={() => {
                    setShowModal(false);
                  }}>Save</IonButton>
                </div>
              </div>
            </IonModal>


            <IonModal isOpen={infoModal} 
                className=''>
              <div className='inputWrapper'>
                <div className='customItem'>
                  <IonText>
                  <h2>Show Info</h2>
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

export default ShowEdit;
