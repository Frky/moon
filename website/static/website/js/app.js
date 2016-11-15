import React from "react";
import cookie from 'react-cookie';

import { Bar, Comptoir } from "./components";
import { HISTORY_RE_SYNC_NB_MESSAGE } from './config'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      windowFocused: true,
      comptoirs: {},
      messages: [],
      users: []
    };

    // Init socket connection (contains setState refresh)
    this._initSocketConnection();
    this._initHeartbeat();
    this._initWindowFocus();

    if (window.location.pathname == '/agora') {
        this.selectedComptoirs = cookie.load('opencmptrs');
        if (this.selectedComptoirs == undefined)
            this.selectedComptoirs = [];
        this.state.is_bar = true;
    } else {
        this.selectedComptoirs = [window.location.pathname.replace('/u/', '')];
        this.state.is_bar = false;
    }

    // Hack: TODO something dynamic
    this.state.comptoirs = this._initComptoirState(this.selectedComptoirs);
  }

  _initSocketConnection() {
    // Connection with the websocket
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    this.chatsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + "/chat");

    // OnOpen callback
    this.chatsock.onopen = event => {
      this.setState({
        connected: true
      });

    };

    // OnClose callback
    this.chatsock.onclose = event => {
      this.setState({
        connected: false
      })
    };

    this.chatsock.onmessage = (message) => {
      const data = JSON.parse(message.data);
      const comptoirs = JSON.parse(JSON.stringify(this.state.comptoirs)); // TODO optimisation
      const action = data.action;

      if (action == 'MSG') {
        comptoirs[data.comptoir].messages.push(data);
        comptoirs[data.comptoir].nbUnread++;

        this.setState({comptoirs: comptoirs});
      } else if (action == 'PRESENCE') {
        comptoirs[data.comptoir].users = data.users;

        this.setState({comptoirs: comptoirs});
        
        if (data.isJoin) {
          const historyMessages = comptoirs[data.comptoir].messages.slice() // TODO limit history

          this.sendMessage({
            action: 'SYNC_HISTORY',
            messages: historyMessages,
            comptoir: data.comptoir
          })
        }
      } else if (action == 'SYNC_HISTORY') {
      }
    };
  }

  _initComptoirState(comptoirs) {
    const output = {}
    for (let c of comptoirs) {
      output[c] = {messages: [], users: [], nbUnread: 0};
    }
    return output
  }

  _initHeartbeat() {
    setInterval(
      () => this.sendMessage({action: 'heartbeat'})
      , 30000);
  }

  _initWindowFocus() {
    window.onfocus = () => this.setState({windowFocused: true});
    window.onblur = () => this.setState({windowFocused: false});
  }

  _rebuildMessagesHistory(local, distant) {

  }

  sendMessage(msg) {
    try {
      this.chatsock.send(JSON.stringify(msg));
    } catch (e) {
      console.log(e);
    }
  }
  
  readMessages(comptoir) {
    const comptoirs = JSON.parse(JSON.stringify(this.state.comptoirs));
    comptoirs[comptoir].nbUnread = 0;
        
    this.setState({comptoirs: comptoirs});
  }

  nbAllUnread() {
    return Object.keys(this.state.comptoirs).map(d => this.state.comptoirs[d].nbUnread).reduce((a, b) => a + b);
  }

  joinComptoir(cmptr) {
    const comptoirs = JSON.parse(JSON.stringify(this.state.comptoirs));
    comptoirs[cmptr] = {messages: [], users: [], nbUnread: 0};

    this.setState({comptoirs: comptoirs});
  }

  leaveComptoir(cmptr) {
    this.sendMessage({
      action: 'LEAVE',
      comptoir: cmptr
    });
    delete this.state.comptoirs[cmptr];
    this.setState({});
  }

  updateTitle(nb) {
    document.title = `${nb > 0 ? `(${nb})` : ''} MOON ${this.state.connected ? '' : '(disconnected)'}`;
  }

  componentDidUpdate() {
    const nb = this.nbAllUnread();
    // big-moon-black : iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAArJJREFUWAntlzuIE0EYx/NOG0h3gqCFD87mBMHmOFC0EVFQECxFC5GEFKlEJMWBTcizEqxtPOGKA0HBZ3Gi2AgH5zWCeFolpk3OJP4+2Rk3u9ndmZxX6cDky3yv/3++mdmdjcX+9Ra3KUChUFhIJBIXx+PxIn0fsXPxeHyM/Mp4m//r9JVms/nRNK8RAYAvk3gZkMNRifEbQfJKo9FYifIVeyiBcrl8YDAYPAT4pEkyfHYAP0cFnhn6x1JBjsx6qd/vP8aep0uZQ8lKHmZ/2wb8d4z8eJuAo5NZpL22kPFWq9U6Agkha9wSXk8pOzqZuQ24zP6+Lbhg+wjImqOXsls19skLqwDHeYKA7HZnw1mVUXIlk8nPuyZACZedJJEbzguWy+V+enUmY10BZr9gcs6DknY6nf1BtjC9JiBPuDBHA9tZAx+fiybA7Bd9VjvF9UqlovOZhuoACMizfTdtvtvt3rRNoAkQOGcbPMW/ViqVTk3RB6rcBAKdTA1UMTMajZ4Ui8Vbpsuhjxun4BNAh0zBDPw28HlAf5rP57/0ej157xwcDoenkdfa7fZR5J+XEc+AbWbwNwnMk78uIBxREe72XA30EkDgjVLuteTIv1cYmgBrt6qUey2p9COFofeAKNg8mxgjbz0qeEa5wfofU7G6AqIA/I5jsH4ZqYQhUuW85/aZqIAYqMI6REyvYO5ckf/ZZ6+5tCy5HScqIIZMJnMV4du27qAZ//9IpVI3vLE+AtVqVd7rl+g7XudZx8y8D/iFWq225c3hIyAObJJXiDN0VQm1fmK2aoB36efr9frUYz6VgCAIiWw2e4Lgtwx9e8WQxbt0On087KZslFiuahAx+jBxiG3ysLkrHyfEhVbPiICardya5OLCKdGfZmID5DviG/0ld8M11vpDFLDE/W9SgV+e+tG+B5UYywAAAABJRU5ErkJggg==
    // big-moon-yellow : iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABC9JREFUWAntV2toFFcUPjOz2Y1Vw+oKNqnPah6akCKKkYoVIwY0QvqjaLH/pP4IkpAf+SUiKQ0IQt5FEMRfKrRNwUBFiOKbqIkhNGY1iYpUzUN0H2xim91kdzzfuHecTLK7M+o/PTB779zz+s655945S/Spk2QnARUVFetkWf5eVdUt/HzFulmSJKk8Puf3IZ7f4qe1qamp16pdSwDY8Q9suJad5KYyLMsUc7mie48dO96aShb8pACqq6tXRiKRs+x4E4TdGROUnz1Ma1aPkmfBa8qYP0Eqx9/1z3Jqu1gIkUnOUCln4CJerJAjkRBHvTUcDv/FfE/GvP/Vku/6pY3f/EtvM/5OCwBudK7WFjhLh+w4h9KsGYBz5iGKtLXZI7Sv7C65nFOQn0EDjxfTyd+/xfpgc3NzHoNATVimGRlA2uORp23e8JjKdvRy1Int3b23VGOy4xN2nUNRNpvGnvOaB5Gncg7dl/4MzQTXyRVtYvNnGgBUOwoOe460J4tc+PEHv9CmiqI8EWt2xmkAOIW1UEbBJdpzs/Fo9O3+uN3u2YvErGB61wFw9OtwznHUUO1WCUcR5PP5llnVMcrpAHDDgYFzbqeQl2YGhL0SMbEz6gA4+i1QxCVjhwpyR4T4zzU1Nbo9sZhq1BUYAO527YZLpWTkF+SM0CK+FZny/X5/uZFnZa4DYOEsKIg9taIMGVmOUWlxnxCvr6qqKhYvVkYjACvys8oU5A7T1qJB/i6ozlgsdqGysvKg1e0w3oTDbD0nNJZOixaOz+oo2WJpsVdjX7uT4+TJb3wqyvlkneR5u8fjeRoMBuHra0ma3M73zP5ffj21Bgo6AL4DhjiCHF9g7nsBwKW1e7uXViwJ0PnLBfQqMDef7TfACYPBECeZxv9zXRZvRgA3GMC2B4++pNxVLwTf9ojtWJs9Sn2DmdQ3kEnPRhYQsqooKkWjMkUmFZqacnYJwzoA3rtzvHjE+zCLykrwAbL1URP2tBGFWZg3pD2CEYtJVNuyUwPAgf4p1vUibGlp6eFtGAiG0qmTG4yPTT3eJTT22gWzXv5sdwv7OgAsMLLDGNuv56nhiJ4cLH0QTYQdqAuR0qNGY9MAcBZaOQu3Q+NzpLNtG7R2yyj8PnN0TH+cX8/Rp7Np6Tr7OGO0Mw0AGE6ncx8PvvsPM7U+DwY+hNraC+lev3bHBRwOxwGzLcW80NHRESwqKrrD6z89G16oDL1wa1XtUGJm0aTvE+E0On1uI3X3LeOClsLsfFdDQ0OPWSlhsxXvC1M2pWaDqPau3uV06WYeBUNz4NzPz4+JmtWEAGDYSlsOudCYi3yBefTg0WLCMYbjOHXylu6pq6tL2GAkBSCsoFXjKCz9MYnr9HN/caSxsRFFnbSKLAEwAJnx1ww8doKmAN+Sq9wb/l1fX9+dyjH0PhMy8AbBgJZtO6q8pwAAAABJRU5ErkJggg==
    this.updateTitle(nb);

    if (this.state.connected && nb == 0) {
      document.getElementById('favicon').href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABGpJREFUWAntV11Mm1UYfr+2/K6UUoRswIZkI5Ni2BYVRsLmvGDqTMYSuJgzbi4xEqP8JYxkxgtMjFcmBS5MuDJRMxU1Do1m2Uwks+ucqDNEhIRNGVCGk7JSOlta2/q8B79jP/szir3Tk5zvvOe8f8953/P3Ef3Xiz6VAJw+3VpfX19b4XB8O5OKXjJZQzIm8yKRiNLV1XVUocBrFA4XB4NZpXfTSYWvJBPu7u6uWF1dfQ8ytSyn0+lO9Pf3v5VMJ1WeLpFCR0fHo4FA4HvwhXO0s1ar9d1E8hsdjwugs7PzQDgcPovwmzMyQsK2oigftra2BjfqKJFeDADkewecfwKF7IYHr9PWLbdV3S9UIp2tBkBvb68uFAq9iZnn7aqao6aDY+RezhX+MjMzJ9LpWLWlAbC0tPQ0nDeYjL5I8+M/CBnv71mq7C2VSGerAQDD3Wz80CPjSk62mu6I8Gc0GpPuGCG0gY8EgFXfgNnfbzb5aU+1U5oy5fkF7fF4SuRgGgkJADYb2W4Ncq/ThaUL818AsDC3y8E0EhIAZn+A7VaWa1NdsW1RuAOAJwSR5o8EALvb2HZx0YrGRXXlvNpvGhoaSunuUBWTtRIAIlDMgnm5qxr50s3LVFTo5TuhzG63n9Qw09CRAGBLJD5CsYv9sf3jwhVAvNLT05OXBr/SRDQAEWvPSrZkqkRN1TyVl4oTscTn873DB5bK+7etNISzXuw91+1NcW0eOzJKudkBPhQOu1wuW7pARAP4ij1PXNscF4Al/w4db76iYIsyiHaA+Hgj6cBFZz516vl9qhMJgG8/HhyfKsGCi10HzNtevkjPPXlJUSOBdEy2t7c/u57dMTg4mIHD7nhOlt9pMIT/YHtcNJ5gbBILbWfLoatUt3taCMT7LC1vojNnH6IbzgLBRvrmQAzjwfIZ6nWTyTTv9Xo5UsV4U1SB34gJNqO/1aAPTdv63qgQivhonmRw/jLGPjh/8b7IbuuckpUpgaryouV0vHhihMYmSujcxWr6zWUsA+MF3KRcCenRyMOu7Eco8yXZAaGJADMQhctQ2GutvEnPtHxNSoxEtPoa7VzIF6n7ZeYecmMXre0khYy5fjLn+2j2ZgEFg+IM+2ZgYGAvIiIRaSLA5nDvH8M7cPSnqS2FwxdqqKlx7K4g+LDiGq8Mn6+hnwEMTt2wfTTaOcvHHK0Oh8NdV1d3BbynZucteuevZrJWLpBB//cFFc/RP8d8/gx6/9MHaHTsXmbxldrc19f3HXeiS8IAt7W1PQzBj1AL+YFycP+kUrvrBmYioxdtR9LhsI6ujpfS519WRzzeHExYWcHCPAznI1IoikgIgGX4WY5VfIbXBPf5rcCXU9WOBSosuEP8VlAoQit4Nd1aNNHUdBEWZhm5PWunKZzb9Xr9SZvNdo3145WkAFQFRKMFxl4FkJ3qWLIWsj+C/7rFYnkbJ2bS3K0LgOoMQPYgnEcAZB8q/yHxK0kHh/yImEE7gvYCfl7saP8v64rAn/xwjjTpNYaQAAAAAElFTkSuQmCC";
    } else if (!this.state.connected && nb == 0) {
      document.getElementById('favicon').href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAxhJREFUWAntVjuIE1EU3ZkkRLKwRFP4QbBbTCcaixBj4SqIjYoaEaxESSH5J9usRRabGAn5oGihYOkHsVkbP+CKaGJhKwgKilgIJkFTxJiP54bMZSY7v52k0wePee/e8849777PvJmZf73YzCYgkUgEfT7fDb/f/7tWq703O84IJxgB4vH47l6vdwW4g4IgvKpUKkGjMevxi3rgWCyW6vf7NQpOOFEUI3p4Kz7VJRgMBkKj0biD7yLFHRG/wOwpE1MtqgIQ/BqCX0CkAepwmZD+61j711ONDjJpdsyLtJ9F8IswcHByQsAqg6bYUAjIZDJbsOaVEb9ig0LA1ynGZSqFgHa7nYZnI3tlDbfb/UPWnVqTBUQikTnMktZdtbRaLbeqY0IjC0DwI1j7OS2+bre7Tcs3iZ0FgGRBjwji9uj5rfpYAALs1SOB/6ie36qPBYBgsw4J4g8O4VreqoOx5GIB2AObdBjoSG7AP2FZB2PJxQIww6YBA11M55AFvwFuXW4WgAx8MxhJWbDhonqEI7vdAGvazQKQgU9mRgFHe+V5MpmcN4NXw4CDb1kWAOBjNbCGbR73Qg3/jVMafk0zlpCW8bwEsEsNp9O50ul0+iN1rFDyj3+Bc6Pex3K8sdlsl71e77NwOPxnHEf9bDYr1uv1w2guYiPvx7uCT5MiUDQavQfSkBqJho3/mNhDP4F5ivoRlfZTH5WWayc4D+A7/McA9xDvipPoDwtngHqYyRJSexxNsivEkV+lMAZB6Bo/oYKRm3oOh+OS3KB4kFSr1ToenbMg2wcQz04+wGJ7yIXUXy0Wi3flHPJNOLQHAoElpOkJOjw7+QCLbVAKL4l7fPwaAaFQqAelpwF8NwKTeqtFGvvW5XIdI+5xojUCCFAqlZoejycI1Q/QnSQTNPMVcC3kcrnGeHDq65JjLwh0ZvFdRpWOjqm9gcBN1HS5XL6tFliy6QqQQOl0ehZ3BD1Uz0DILsmu8f2AJbyJe+VWPp//pYFhsykBjEYjlUrtwFENQgi9kKiKmOl3fL/Y7fbVQqHwGe3/xXQG/gKthQECivJdngAAAABJRU5ErkJggg==";
    } else if (this.state.connected && nb > 0) {
      document.getElementById('favicon').href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABC9JREFUWAntV2toFFcUPjOz2Y1Vw+oKNqnPah6akCKKkYoVIwY0QvqjaLH/pP4IkpAf+SUiKQ0IQt5FEMRfKrRNwUBFiOKbqIkhNGY1iYpUzUN0H2xim91kdzzfuHecTLK7M+o/PTB779zz+s655945S/Spk2QnARUVFetkWf5eVdUt/HzFulmSJKk8Puf3IZ7f4qe1qamp16pdSwDY8Q9suJad5KYyLMsUc7mie48dO96aShb8pACqq6tXRiKRs+x4E4TdGROUnz1Ma1aPkmfBa8qYP0Eqx9/1z3Jqu1gIkUnOUCln4CJerJAjkRBHvTUcDv/FfE/GvP/Vku/6pY3f/EtvM/5OCwBudK7WFjhLh+w4h9KsGYBz5iGKtLXZI7Sv7C65nFOQn0EDjxfTyd+/xfpgc3NzHoNATVimGRlA2uORp23e8JjKdvRy1Int3b23VGOy4xN2nUNRNpvGnvOaB5Gncg7dl/4MzQTXyRVtYvNnGgBUOwoOe460J4tc+PEHv9CmiqI8EWt2xmkAOIW1UEbBJdpzs/Fo9O3+uN3u2YvErGB61wFw9OtwznHUUO1WCUcR5PP5llnVMcrpAHDDgYFzbqeQl2YGhL0SMbEz6gA4+i1QxCVjhwpyR4T4zzU1Nbo9sZhq1BUYAO527YZLpWTkF+SM0CK+FZny/X5/uZFnZa4DYOEsKIg9taIMGVmOUWlxnxCvr6qqKhYvVkYjACvys8oU5A7T1qJB/i6ozlgsdqGysvKg1e0w3oTDbD0nNJZOixaOz+oo2WJpsVdjX7uT4+TJb3wqyvlkneR5u8fjeRoMBuHra0ma3M73zP5ffj21Bgo6AL4DhjiCHF9g7nsBwKW1e7uXViwJ0PnLBfQqMDef7TfACYPBECeZxv9zXRZvRgA3GMC2B4++pNxVLwTf9ojtWJs9Sn2DmdQ3kEnPRhYQsqooKkWjMkUmFZqacnYJwzoA3rtzvHjE+zCLykrwAbL1URP2tBGFWZg3pD2CEYtJVNuyUwPAgf4p1vUibGlp6eFtGAiG0qmTG4yPTT3eJTT22gWzXv5sdwv7OgAsMLLDGNuv56nhiJ4cLH0QTYQdqAuR0qNGY9MAcBZaOQu3Q+NzpLNtG7R2yyj8PnN0TH+cX8/Rp7Np6Tr7OGO0Mw0AGE6ncx8PvvsPM7U+DwY+hNraC+lev3bHBRwOxwGzLcW80NHRESwqKrrD6z89G16oDL1wa1XtUGJm0aTvE+E0On1uI3X3LeOClsLsfFdDQ0OPWSlhsxXvC1M2pWaDqPau3uV06WYeBUNz4NzPz4+JmtWEAGDYSlsOudCYi3yBefTg0WLCMYbjOHXylu6pq6tL2GAkBSCsoFXjKCz9MYnr9HN/caSxsRFFnbSKLAEwAJnx1ww8doKmAN+Sq9wb/l1fX9+dyjH0PhMy8AbBgJZtO6q8pwAAAABJRU5ErkJggg==";
    } else if (!this.state.connected && nb > 0) {
      document.getElementById('favicon').href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAArJJREFUWAntlzuIE0EYx/NOG0h3gqCFD87mBMHmOFC0EVFQECxFC5GEFKlEJMWBTcizEqxtPOGKA0HBZ3Gi2AgH5zWCeFolpk3OJP4+2Rk3u9ndmZxX6cDky3yv/3++mdmdjcX+9Ra3KUChUFhIJBIXx+PxIn0fsXPxeHyM/Mp4m//r9JVms/nRNK8RAYAvk3gZkMNRifEbQfJKo9FYifIVeyiBcrl8YDAYPAT4pEkyfHYAP0cFnhn6x1JBjsx6qd/vP8aep0uZQ8lKHmZ/2wb8d4z8eJuAo5NZpL22kPFWq9U6Agkha9wSXk8pOzqZuQ24zP6+Lbhg+wjImqOXsls19skLqwDHeYKA7HZnw1mVUXIlk8nPuyZACZedJJEbzguWy+V+enUmY10BZr9gcs6DknY6nf1BtjC9JiBPuDBHA9tZAx+fiybA7Bd9VjvF9UqlovOZhuoACMizfTdtvtvt3rRNoAkQOGcbPMW/ViqVTk3RB6rcBAKdTA1UMTMajZ4Ui8Vbpsuhjxun4BNAh0zBDPw28HlAf5rP57/0ej157xwcDoenkdfa7fZR5J+XEc+AbWbwNwnMk78uIBxREe72XA30EkDgjVLuteTIv1cYmgBrt6qUey2p9COFofeAKNg8mxgjbz0qeEa5wfofU7G6AqIA/I5jsH4ZqYQhUuW85/aZqIAYqMI6REyvYO5ckf/ZZ6+5tCy5HScqIIZMJnMV4du27qAZ//9IpVI3vLE+AtVqVd7rl+g7XudZx8y8D/iFWq225c3hIyAObJJXiDN0VQm1fmK2aoB36efr9frUYz6VgCAIiWw2e4Lgtwx9e8WQxbt0On087KZslFiuahAx+jBxiG3ysLkrHyfEhVbPiICardya5OLCKdGfZmID5DviG/0ld8M11vpDFLDE/W9SgV+e+tG+B5UYywAAAABJRU5ErkJggg==";
    }

    cookie.save('opencmptrs', JSON.stringify(Object.keys(this.state.comptoirs)));
  }

  render() {
    let comptoirsHTML;
    if (this.state.is_bar) {
      comptoirsHTML = (
        <Bar 
            sendMessage={this.sendMessage.bind(this)} 
            joinComptoir={this.joinComptoir.bind(this)}
            leaveComptoir={this.leaveComptoir.bind(this)}
            readMessages={this.readMessages.bind(this)}
            windowFocused={this.state.windowFocused}
            connected={this.state.connected}
            comptoirs={this.state.comptoirs}
        />
      );
    } else {
      const cmptr = window.location.pathname.replace('/u/', '');
      comptoirsHTML = (
        <Comptoir
          name={cmptr}
          connected={this.state.connected}
          windowFocused={this.state.windowFocused}
          sendMessage={this.sendMessage.bind(this)}
          readMessages={this.readMessages.bind(this)}
          {...this.state.comptoirs[cmptr]}
        />
      );
    }
    return (
      <div>
        {comptoirsHTML}
      </div>
    );
  }
}
