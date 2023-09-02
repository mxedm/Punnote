import {  IonContent, IonHeader, IonItem, label, 
  IonInput, IonPage, IonTitle, IonList, IonToolbar, 
  IonButton, IonToast, IonButtons, IonToggle,
  IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonAlert, IonIcon } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService, { Show } from './DatabaseService';
import { useHistory } from 'react-router-dom';
import './showList.css';
import './standard.css';
import { timeOutline } from 'ionicons/icons';

const showList: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);;
  const [showTitle, setShowTitle] = useState("");
  const [showToDelete, setShowToDelete] = useState<number | null>(null); 
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); 
  const [isAddingShow, setIsAddingShow] = useState(false);
  const [showToast, setShowToast] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchShows = async () => {
      const fetchedShows = await DatabaseService.getShows();
      setShows(fetchedShows);
    };
    fetchShows();
  }, [location.pathname]);

  const deleteShow = async (id: number) => {
    await DatabaseService.removeShow(id);
    setShows(bits => shows.filter(show => show.id !== id));
    setShowToDelete(null);
  };

  const handleAddShow = (title: string) => {
    if (isAddingShow) return;
    setIsAddingShow(true); 
    if (title.length === 0) {
      setToastMessage("Please enter a show title");
      setShowToast(true); 
      setIsAddingShow(false);
      return;
    } else {
      setIsLoading(true); 
      addShow(title).then(() => { 
        setIsLoading(false); 
        setIsAddingShow(false); 
      });
    }
  };

  const addShow = async (title: string) => {
    const newShow: Partial<Show> = {
      id: Date.now(),
      title: title,
      venue: "",
      notes: "",
      showdate: new Date(),
      setlength: 0,
      compensation: 0,
      mediaurl: "",
      type: "",
      setlist: 0,
      rating: 0, 
      archive: false,
    };
    await DatabaseService.addShow(newShow as Show);
    setShows(prevShows => [...prevShows, newShow as Show]);
    setShowTitle("");
  };  

  const editShow = (id: number) => {
    history.push(`/showEdit/${id}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Shows</IonTitle>
          <IonButtons className="toggleArchiveButton" slot="end">
            <span className="archiveLabel">List Archived</span> 
            <IonToggle 
              checked={showArchived} 
              onIonChange={e => setShowArchived(e.detail.checked)} 
            /> 
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <div className="inputRow">

          <div className="inputWrapper">
            <div className="customItem">
              <label className="inputLabel">Show Name</label>
              <input
                aria-label="Show Name"
                className="inputText inputTextListing"
                placeholder="Enter Show Name Here"
                value={showTitle}
                onChange={e => setShowTitle(e.target.value)}
              />
            </div>
          </div>


          <IonButton
            type="submit"
            className="addButton"
            disabled={isLoading || showTitle.trim() === ''} 
            onClick={() => handleAddShow(showTitle)}
          >
            {isLoading ? <IonIcon icon={ timeOutline } /> : "Add"}
          </IonButton>
        </div>

        <IonList class="mainList">
          {shows.slice().reverse().filter(show => showArchived ? true : !show.archive).map(show => (
            <IonCard key={show.id}>
              <IonCardHeader>
                <IonCardTitle>
                  {show.title} 
                  {show.venue ? ` at ${show.venue}` : ''}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
              <p>When: {show.showdate && !isNaN(new Date(show.showdate).getTime()) ? new Date(show.showdate).toLocaleString() : "No data."}</p>
                <div className="rowContainer cardContainer">
                  <IonButton 
                    fill="solid"
                    color="primary"
                    slot=""
                    onClick={() => editShow(show.id)}
                  >
                    edit
                  </IonButton>
                  <IonButton 
                      className=""
                      color="danger"
                      onClick={() => setShowToDelete(show.id)} 
                      >
                      delete
                    </IonButton>                
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>

        <IonAlert
          isOpen={showToDelete !== null}
          header={'Delete Show'}
          message={'Are you sure you want to delete this show? This action cannot be undone.'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => setShowToDelete(null) 
            },
            {
              text: 'Confirm',
              handler: () => showToDelete !== null && deleteShow(showToDelete) 
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default showList;
