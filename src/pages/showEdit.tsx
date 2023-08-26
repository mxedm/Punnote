import {  IonContent, IonIcon, IonSelect, IonSelectOption, IonHeader, IonPage, 
          IonTitle, IonToolbar, IonInput, IonButton, IonLabel, IonItem, 
          IonDatetime, IonModal, IonButtons, IonToggle } from '@ionic/react';
import { starOutline, star, playCircle, calendar } from 'ionicons/icons';
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
  const [showdate, setShowDate] = useState<string>(''); 
  const [setlength, setSetLength] = useState(0);
  const [compensation, setCompensation] = useState(0);
  const [mediaurl, setMediaURL] = useState('');
  const [type, setType] = useState('');
  const [setlist, setSetlist] = useState(0);
  const [rating, setRating] = useState(0);
  const [archive, setArchive] = useState(false);
  const [setlists, setSetlists] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
        setSetlist(fetchedShow.setlist);
        setRating(fetchedShow.rating);
        setArchive(fetchedShow.archive);
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
        const fetchedSetlist = fetchedSetlists.find(setlist => setlist.id === fetchedShow.setlist);
        setSetlists(fetchedSetlists);
        setSetlist(fetchedSetlist);
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
        setlist,
        archive, 
        rating,
      };
      await DatabaseService.editShow(updatedShow);
    }
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
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Title:</IonLabel>
              <IonInput
                aria-label="Show Title"
                className="inputText"
                type="text"
                value={title}
                onIonChange={e => setTitle(e.detail.value)}
              />
            </IonItem>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Venue:</IonLabel>
              <IonInput
                aria-label="Show Venue"
                className="inputText"
                type="text"
                value={venue}
                onIonChange={e => setVenue(e.detail.value)}
              />
            </IonItem>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Notes:</IonLabel>
              <IonInput
                aria-label="Show Notes"
                className="inputText"
                type="text"
                value={notes}
                onIonChange={e => setNotes(e.detail.value)}
              />
            </IonItem>
            <div className="rowContainer">
              <IonItem className="inputWrapper">
                <IonLabel className="inputLabel" position="floating">Date</IonLabel>
                <IonInput
                  aria-label='Date'
                  className='inputText'
                  position='floating'
                  type=''
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
                      : "N/A" 
                  }
                  readonly
                />
                <IonButton className="dateTimeButton" shape='round' color="primary" slot="end" onClick={() => setShowModal(true)}>
                  <IonIcon icon={calendar} />
                </IonButton>
              </IonItem>
            </div>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Set length</IonLabel>
              <IonInput
                aria-label="Set Length:"
                className="inputText"
                type="text"
                value={setlength}
                // onBlur={updateShow}
                onIonChange={e => setSetLength(e.detail.value)}
              />
            </IonItem>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Compensation:</IonLabel>
              <IonInput
                aria-label="Compensation:"
                className="inputText"
                type="text"
                value={compensation}
                onIonChange={e => setCompensation(e.detail.value)}
              />
            </IonItem>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Show Type:</IonLabel>
              <IonSelect
                aria-label="Show Type:"
                className="inputText inputSelect"
                value={type}
                onIonChange={e => setType(e.detail.value)}
              >
                <IonSelectOption value="Mic">Mic</IonSelectOption>
                <IonSelectOption value="Showcase">Showcase</IonSelectOption>
                <IonSelectOption value="Regular">Regular</IonSelectOption>
                <IonSelectOption value="Drop In">Drop In</IonSelectOption>
                <IonSelectOption value="Other">Other</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Setlist:</IonLabel>
              <IonSelect
                aria-label="Setlist:"
                className="inputText inputSelect"
                value={setlist}
                // onBlur={updateShow}
                onIonChange={e => setSetlist(e.detail.value)}
              >
                {setlists.map(setlist => (
                  <IonSelectOption key={setlist.id} value={setlist}>
                    {setlist.title}
                  </IonSelectOption>
                ))}
              </IonSelect>
              <IonButton
                className="setlistPlayButton"
                slot="end"
                size="default"
                shape="round"
                onClick={() => setlist && handlePlay(setlist.id)}
                disabled={!setlist || !setlist.id} 
              >
                <IonIcon icon={playCircle} />
              </IonButton>
            </IonItem>
              
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Rating:</IonLabel>
              <div className='inputText inputRating'>{renderRating()}</div>
            </IonItem>
            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="floating">Show Media:</IonLabel>
              <IonInput
                aria-label="Show Media:"
                className="inputText"
                type="text"
                value={mediaurl}
                // onBlur={updateShow}
                onIonChange={e => setMediaURL(e.detail.value)}
              />
            </IonItem>

            <IonItem className="inputWrapper">
              <IonLabel className="inputLabel" position="">
                <span className="archiveLabel">Show Archived</span>
              </IonLabel>
              <IonButtons className="toggleArchiveButton" slot="">
                <IonToggle 
                  labelPlacement="start"
                  label="Archive Show"
                  checked={archive} 
                  onIonChange={e => setArchive(e.detail.checked)} 
                />
              </IonButtons>
            </IonItem>
            <div className='buttonContainer'>
              <IonButton shape="round" color="success" onClick={updateShow}>Save</IonButton>
              <IonButton shape="round" color="warning" onClick={() => history.push('/showList')}>Close</IonButton>
            </div>

            <IonModal isOpen={showModal} cssClass='my-datetime-class'>
              <div className='datePickerModal'>
                <IonDatetime
                  displayFormat="MM DD YYYY"
                  value={showdate}
                  onIonChange={e => setShowDate(e.detail.value)}
                />
                <div className="modalButtons">
                  <IonButton shape="round" onClick={() => {
                    setShowModal(false);
                  }}>Save</IonButton>
                  <IonButton onClick={() => setShowModal(false)} shape="round">Close</IonButton>
                </div>
              </div>
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
