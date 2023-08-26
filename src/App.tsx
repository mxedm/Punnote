import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { people, list, cube, settings  } from 'ionicons/icons';

import Home from './pages/Home';
import BitEdit from './pages/bitEdit';
import BitList from './pages/bitList';
import SetlistEdit from './pages/setlistEdit';
import SetlistPlay from './pages/setlistPlay';
import SetlistList from './pages/setlistList';
import Settings from './pages/settings';
import ShowEdit from './pages/showEdit';
import ShowList from './pages/showList';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
<IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/home" render={(props) => <Home key="/home" {...props} />} exact={true} />
          <Route path="/bitEdit/:id" render={(props) => <BitEdit key="/bitEdit/:id" {...props} />} exact={true} />
          <Route path="/bitList" render={(props) => <BitList key="/bitList" {...props} />} exact={true} />
          <Route path="/setlistEdit/:id" render={(props) => <SetlistEdit key="/setlistEdit/:id" {...props} />} exact={true} />
          <Route path="/setlistList" render={(props) => <SetlistList key="/setlistList" {...props} />} exact={true} />
          <Route path="/setlistPlay/:id" render={(props) => <SetlistPlay key="/setlistPlay/:id" {...props} />} exact={true} />
          <Route path="/showEdit/:id" render={(props) => <ShowEdit key="/showEdit/:id" {...props} />} exact={true} />
          <Route path="/showList" render={(props) => <ShowList key="/showList" {...props} />} exact={true} />
          <Route path="/settings" render={(props) => <Settings key="/settings" {...props} />} exact={true} />
          <Route path="/" render={() => <Redirect to="/home" />} exact={true} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="showList" href="/showList">
            <IonIcon icon={people} />
            <IonLabel>Shows</IonLabel>
          </IonTabButton>
          <IonTabButton tab="setlistList" href="/setlistList">
            <IonIcon icon={list} />
            <IonLabel>Setlists</IonLabel>
          </IonTabButton>
          <IonTabButton tab="bitList" href="/bitList">
            <IonIcon icon={cube} />
            <IonLabel>Bits</IonLabel>
          </IonTabButton>
          <IonTabButton tab="settings" href="/settings">
            <IonIcon icon={settings} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
