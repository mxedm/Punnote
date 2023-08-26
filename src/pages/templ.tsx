
         <IonItem>
          {/*  Setup for new show title input field with 'add' button  */}
        <IonInput
          ref={titleRef}
          value={title}
          onIonChange={(e) => setTitle(e.detail.value)}
          placeholder="New Show Title"
        />
        <IonButton slot="end" fill="clear" size="small" shape="round" onClick={() => createShow(titleRef.current?.value)}>
          <IonIcon icon={add} />
        </IonButton>
        </IonItem>
        <IonList>
          {/* Mapping and displaying the list of shows sorted by their id  */}
          {shows
    .sort((a, b) => b.id - a.id)
    .map((show, key) => (
      <IonItemSliding key={show.id}> {/* Add the key prop here */}
        <IonItem>
          <IonLabel>
            <h2>{show.title || 'Untitled'}</h2>
            <p>
              {show.datetime ? new Date(show.datetime).toLocaleDateString() : 'No Date'},&nbsp;
              {show.datetime ? new Date(show.datetime).toLocaleTimeString() : 'No Time'}
            </p>
          </IonLabel>
          <IonButton onClick={() => openModal(show)} shape='round'>
            <IonIcon icon={pencil} />
          </IonButton>
        </IonItem>
      </IonItemSliding>
    ))}
        </IonList>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />




