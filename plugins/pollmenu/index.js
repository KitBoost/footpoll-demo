/**
 * Poll Menu
 
 Visitors to a space can vote with their feet.
 This plugin counts the number of visitors standing on each linked polling target.
 *
 * @license MIT
 * @author Joe Sandmeyer
 */
module.exports = class PollMenuPlugin extends BasePlugin {

  /** Plugin info */
  static get id()             { return 'pollmenu-plugin' }
  static get name()           { return 'Poll Menu' }    
  static get description()    { return 'Presents a menu to query poll results.' }

  /** Called on load */
  onLoad() {

    // Allow message to be configured
    this.menus.register({
      id: 'hud',
      title: 'hudmenu-label',
      text: 'hudmenu-text',
      section: 'overlay-top',
      panel: {
          iframeURL: this.paths.absolute('pollhud.html'),
          width: 500,
          height: 500
      }
    })

    // Create a button in the toolbar
    this.menus.register({
      id: 'menu-poll',
      icon: this.paths.absolute('pollmenu-btn.png'),
      text: 'Poll',
      action: () => this.onBtnTriggerPoll(),
      section: 'controls'
    })

    this.menus.register({
      id: 'menu-clubs',
      icon: this.paths.absolute('BtnClubs.png'),
      text: 'Clubs',
      action: () => this.onBtnClubs(),
    })

    this.menus.register({
      id: 'menu-diamonds',
      icon: this.paths.absolute('BtnDiamonds.png'),
      text: 'Diamonds',
      action: () => this.onBtnDiamonds(),
    })

    this.menus.register({
      id: 'menu-hearts',
      icon: this.paths.absolute('BtnHearts.png'),
      text: 'Hearts',
      action: () => this.onBtnHearts(),
    })

    this.menus.register({
      id: 'menu-spades',
      icon: this.paths.absolute('BtnSpades.png'),
      text: 'Spades',
      action: () => this.onBtnSpades(),
    })

  }// onLoad()
  
  onRevealPollResults(origThis) {
    const ctClubs = 1;
    const ctDiamonds = 3;
    const ctHearts = 5;
    const ctSpades = 7;
    const strPollResults = "Poll results: "
      + `${ctClubs} \u2663, ${ctDiamonds} \u2666, ${ctHearts} \u2665, ${ctSpades} \u2660`;
    const htmlPollResults = `<div style="color: black; background-color: #ffffff; font-size: 24px; ">&nbsp;${strPollResults};&nbsp;</div>`;
      
    console.log(htmlPollResults);
    
    origThis.menus.postMessage({ action: 'hud-set', src: htmlPollResults });
    
    /* --- *
    const toastID = this.menus.toast({
      icon: this.paths.absolute('pollmenu-btn.png'),
      text: strPollResults,
      textColor: '#2DCA8C',
      buttonColor: '#FFFFFF',
      buttonText: 'buttonText', // 'Enable'
      buttonAction: () => { console.log('clicked ack') },
      buttonCancelText: 'buttonCancelText', // 'Disable'
      buttonCancelAction: () => { console.log('clicked cancel') },
      duration: 5000
    });
    console.log(toastID); // => 7
    /* --- */
  }

  onBtnTriggerPoll() {
    this.user.getProperty('', 'choice').then(curChoice => {
      console.log(`onBtnTriggerPoll old choice ${curChoice}`);
    }).catch(err => {
      console.warn('Error fetching old user choice -- ', err)
    });

    //this.menus.alert("onBtnTriggerPoll")
    this.castVote_OfCurUser('');
    this.menus.postMessage({ action: 'hud-clear' });
    
    const toastID = this.menus.toast({
      icon: this.paths.absolute('pollmenu-btn.png'),
      text: '5 seconds to vote with your feet.',
      textColor: '#2DCA8C',
      buttonColor: '#FFFFFF',
      buttonText: ' ', // 'Enable'
      buttonAction: () => { console.log('clicked ack') },
      buttonCancelText: ' ', // 'Disable'
      buttonCancelAction: () => { console.log('clicked cancel') },
      duration: 5000
    });
    console.log(`toastID: ${toastID}`); // => 7
    
    const timeoutID = setTimeout(this.onRevealPollResults, 5000, this);
    console.log(`timeoutID: ${timeoutID}`);
  }

  onBtnClubs() {
    this.castVote_OfCurUser('clubs');
    this.menus.postMessage({ action: 'hud-set',
      src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&clubs;&nbsp;</div>'
    });
    
    let objUserOldPos = this.user.getPosition();
    console.dir(objUserOldPos);
    
    let objSetPosRet = this.user.setPosition(11,1,31,false);
    console.dir(objSetPosRet);
  }
  
  onBtnDiamonds() {
    this.castVote_OfCurUser('diamonds');
    this.menus.postMessage({ action: 'hud-set',
      src: '<div style="color: red; background-color: #ffffff; font-size: 64px; ">&nbsp;&diams;&nbsp;</div>'
    });
  }

  onBtnHearts() {
    this.castVote_OfCurUser('hearts');
    this.menus.postMessage({ action: 'hud-set',
      src: '<div style="color: red; background-color: #ffffff; font-size: 64px; ">&nbsp;&hearts;&nbsp;</div>'
    })
  }

  onBtnSpades() {
    this.castVote_OfCurUser('spades');
    this.menus.postMessage({ action: 'hud-set',
      src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&spades;&nbsp;</div>'
    })
  }
  
  castVote_OfCurUser(inChoice) {
    const choiceProp = { choice: inChoice };
  
    console.dir(choiceProp);
    this.user.setProperties(choiceProp);
  
    this.user.getID().then(inUserID => {
      var strCurUserId = inUserID;
      console.log(`CurUserId ${strCurUserId} Votes ${inChoice}`);
      
      this.user.getProperties('').then(inUserProps => {
        var strjsonCurUserProps = JSON.stringify(inUserProps);
        console.log(`CurUserProps ${strjsonCurUserProps}`);
        console.dir(inUserProps);
      }).catch(err => {
        console.warn('Error fetching cur user props -- ', err)
      })

      //console.dir(this.user.getProperties(strCurUserId));
      //console.dir(this.user.getProperties(''));
    }).catch(err => {
      console.warn('Error fetching cur user ID -- ', err)
    })
    
    /* --- *
    this.user.getProperties('').then(inUserProps => {
      var strjsonCurUserProps = JSON.stringify(inUserProps);
      console.log(`CurUserProps ${strjsonCurUserProps} Votes ${choice}`);
      console.log(inUserProps);
      console.dir(inUserProps);
    }).catch(err => {
      console.warn('Error fetching cur user props -- ', err)
    })
    /* --- */
  }

}// class PollMenuPlugin