/**
 * Poll Menu
 
 Visitors to a space can vote with their feet.
 This plugin counts the number of visitors standing on each linked polling target.
 *
 * @license MIT
 * @author Joe Sandmeyer
 */


function isValidPollChoiceName(inName){
  let isSatisfied = false;
  
  do {
    if (typeof(inName)!=='string') break;
    
    let cleanString = inName.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanString.length < 1) break;
    if (cleanString !== inName) break;
  } while(false);
  
  return isSatisfied;
}// isValidPollChoiceName


class VoterStatus {

  constructor(inUserID){
    console.log(`VoterStatus constructor inUserID ${inUserID}`);

    this.userID = inUserID;
    //this.pollChoice   = '';
    this.resetPollChoice();
  }// constructor()
  
  get userID(){
    return this._userID;
  }

  set userID(inUserID){
    console.log(`VoterStatus constructor set userID ${inUserID}`);

    this._userID = inUserID;
  }

  get pollChoice(){
    return this._pollChoice;
  }

  set pollChoice(pollChoice){
    this._pollChoice = pollChoice;
  }

  resetPollChoice(){
    this.pollChoice   = '';
  }
  
}// class VoterStatus


class PollStatus {

  constructor(inChoices, inCatchAllKey = null){
    this.catchAllKey          = inCatchAllKey;
    this.isUsingCatchAll      = isValidPollChoiceName(inCatchAllKey);
    this.tally                = new Object;
    this.recentPublishedTally = null;

    let needToAddCatchAll = this.isUsingCatchAll;
    
    for (let index in inChoices) {
      let key = inChoices[index]
      
      this.tally[key] = 0;
      
      if (key == inCatchAllKey){
        needToAddCatchAll = false;
      }
    }
    
    if (needToAddCatchAll){
      this.tally[inCatchAllKey] = 0;
    }
    
    this.resetForNextPoll();
    console.log('eo Pollstatus.constructor');
  }// constructor()
  
  resetForNextPoll(){
    this.pollsterUserID      = null;
    //
    //this.isTallyInProgress   = false;
    //this.isPollRequested     = false;
    //this.didIRequestPoll     = false;
    //
    //this.amIPollster         = false;
    //this.isMyBallotSubmitted = false;
    
    for (let key in this.tally) {
      this.tally[key] = 0;
    }

    console.log('eo Pollstatus.resetForNextPoll');
    console.dir(this);
  }
  
  isPollInProgress(){
    return !! this.pollsterUserID;
  }
  
  hearAboutNewPoll(inPollsterUserID){
    if (! this.pollsterUserID || (inPollsterUserID < this.pollsterUserID)){
      // I've either not yet logged a pollster or new one outranks. 
      this.pollsterUserID = inPollsterUserID;
    }
  }// hearAboutNewPoll
  
  hearAboutCleanup(){
    this.resetForNextPoll();
  }// hearAboutCleanup
  
  amIThePollster(inMyUserID) {
    console.log('eo Pollstatus.amIThePollster');
    console.dir(this);
    return (inMyUserID == this.pollsterUserID);
  }
  
  get catchAllKey(){
    return this._catchAllKey;
  }
  
  set catchAllKey(inCatchAllKey){
    this._catchAllKey = inCatchAllKey;
  }
  
  get isUsingCatchAll(){
    return this._isUsingCatchAll;
  }
  
  set isUsingCatchAll(inIsUsingCatchAll){
    this._isUsingCatchAll = inIsUsingCatchAll;
  }
  
  incrementCountForSpecificChoice(inChoice){
    //console.log(`I am ${thisPollster.myVoterStatus.userID} in pollsterRequestBallots()`);
    console.log(`begin incrementCountForSpecificChoice()`);
    console.dir(this);
    //
    let foundKeyMatch = false;
      
    for (let key in this.tally) {
      if (inChoice == key) {
        this.tally[key]++;
        foundKeyMatch = true;
        break;
      }
    }
    
    if (! foundKeyMatch && this.isUsingCatchAll){
      this.tally[this.catchAllKey]++;
    }
  }// incrementCountForSpecificChoice()
  
  getCountForSpecificChoice(inChoice){
    let foundKeyMatch = false;
    let retVal = 0;
    //  
    for (let key in this.tally) {
      if (inChoice == key) {
        retVal = this.tally[key];
        foundKeyMatch = true;
        break;
      }
    }
    //
    // Return catchall count only when isUsingCatchAll and exact match to catchall key.
    if (! foundKeyMatch){
      throw 'Invalid choice.';
    }
    //
    return retVal;
  }// getCountForSpecificChoice()

  getCountForCatchall(){
    if (this.isUsingCatchAll){
      return getCountForSpecificChoice(catchAllKey);
    }
    return 0;
  }// getCountForSpecificChoice()

  getCountForPublishedChoice(inChoice){
    let foundKeyMatch = false;
    let retVal = 0;
    //  
    for (let key in this.recentPublishedTally) {
      if (inChoice == key) {
        retVal = this.recentPublishedTally[key];
        foundKeyMatch = true;
        break;
      }
    }
    //
    // Return catchall count only when isUsingCatchAll and exact match to catchall key.
    if (! foundKeyMatch){
      throw 'Invalid choice.';
    }
    //
    return retVal;
  }// getCountForPublishedChoice()

  importPublshedTally_FromJsonString(inTallyJsonString) {
    this.recentPublishedTally = JSON.parse(inTallyJsonString);
  }

  exportTally_AsJsonString() {
    return JSON.stringify(this.tally);
  }
}// class PollStatus


module.exports = class PollMenuPlugin extends BasePlugin {

  // Plugin info
  static get id()             { return 'pollmenu-plugin' };
  static get name()           { return 'Poll Menu' };
  static get description()    { return 'Presents a menu to query poll results.' };
  
  // Client instance properties
  padList       = [];   // List of pads that trigger a poll choice when near.
  myVoterStatus = null; // My status as a voter.
  myPollStatus  = null; // Status of current or recent poll.
  
  onLoad() {
    this.myPollStatus = new PollStatus(
      ['clubs', 'diamonds', 'hearts', 'spades'], 'abstentions');
    //
    // Who am I?
    this.user.getID().then(inUserID => {
      this.myVoterStatus = new VoterStatus(inUserID);
      console.log(`I am ${this.myVoterStatus.userID}`);
    }).catch(err => {
      console.warn('Error fetching this.user.getID() in onLoad() -- ', err)
    })
    //
    // Prepare a HUD display.
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
    });
    //
    // Create buttons in the toolbar.
    this.menus.register({
      id: 'menu-poll',
      icon: this.paths.absolute('pollmenu-btn.png'),
      text: 'Poll',
      adminOnly: true,
      action: () => this.onBtnTriggerPoll(),
      section: 'controls'
    });
    this.menus.register({
      id: 'menu-clubs',
      icon: this.paths.absolute('BtnClubs.png'),
      text: 'Clubs',
      action: () => this.onBtnClubs(),
    });
    this.menus.register({
      id: 'menu-diamonds',
      icon: this.paths.absolute('BtnDiamonds.png'),
      text: 'Diamonds',
      action: () => this.onBtnDiamonds(),
    });
    this.menus.register({
      id: 'menu-hearts',
      icon: this.paths.absolute('BtnHearts.png'),
      text: 'Hearts',
      action: () => this.onBtnHearts(),
    });
    this.menus.register({
      id: 'menu-spades',
      icon: this.paths.absolute('BtnSpades.png'),
      text: 'Spades',
      action: () => this.onBtnSpades(),
    });
    this.menus.register({
      id: 'menu-nudge',
      icon: this.paths.absolute('pollmenu-btn.png'),
      text: 'Nudge',
      adminOnly: true,
      action: () => this.onBtnTriggerNudge(),
      section: 'controls'
    })
  }// onLoad()
  
  onMessage(data) {
    console.log(`I am ${this.myVoterStatus.userID} hearing message ${JSON.stringify(data)}`);
    //
    if (data.action === 'announcing-poll') {
      this.myPollStatus.hearAboutNewPoll(data.pollster);
      const toastID = this.menus.toast({
        icon: this.paths.absolute('pollmenu-btn.png'),
        text: '5 seconds to vote with your feet.',
        textColor: '#2DCA8C',
        duration: 5000
      });
      // console.log(`toastID: ${toastID}`); // toastID is a promise
    } else if (data.action === 'requesting-ballots') {
      this.user.getProperty('', 'choice').then(curChoice => {
        console.log(`onMessage requesting-ballots send choice ${curChoice} to ${data.pollster}`);
        this.messages.send({ action:'sending-ballot', choice: curChoice }, true, data.pollster);
      }).catch(err => {
        console.warn('Error fetching user choice -- onMessage requesting-ballots', err)
      });
    } else if (data.action === 'sending-ballot') {
      // This message was addressed directly to a pollster.
      console.log(`onMessage increment choice ${data.choice}`);
      this.myPollStatus.incrementCountForSpecificChoice(data.choice);
    } else if (data.action === 'publishing-results') {
      console.log(`onMessage publishing-results`);
      this.onResultsReceived(data.tally);
    } else if (data.action === 'cleanup-after-poll') {
      console.log(`onMessage cleanup`);
      this.myPollStatus.hearAboutCleanup();
    } else {
      console.log(`onMessage unrecognized action ${data.action}`);
    }
  }// onMessage

  pollsterRequestBallots(thisInstance) {
    // thisInstance param is a workaround for 'this' context getting lost from setTimeout() callback.
    console.log(`I am ${thisInstance.myVoterStatus.userID} in pollsterRequestBallots()`);
    //
    thisInstance.messages.send({ action:'requesting-ballots', pollster: thisInstance.myVoterStatus.userID }, true);
  }// onRequestPollResults
  
  pollsterTally(thisInstance) {
    // thisInstance param is a workaround for 'this' context getting lost from setTimeout() callback.
    console.log(`begin pollsterTally() thisInstance obj follows:`);
    console.dir(thisInstance);
    
    let amIThePollster = thisInstance.myPollStatus.amIThePollster( thisInstance.myVoterStatus.userID );
    
    console.log(`step pollsterTally() amIThePollster ${amIThePollster}`);
    if (! amIThePollster) return;
    
    thisInstance.messages.send({ action:'publishing-results', tally: thisInstance.myPollStatus.exportTally_AsJsonString() }, true);
  
    /* --- *
    const ctClubs     = thisInstance.myPollStatus.getCountForSpecificChoice('clubs');
    const ctDiamonds  = thisInstance.myPollStatus.getCountForSpecificChoice('diamonds');
    const ctHearts    = thisInstance.myPollStatus.getCountForSpecificChoice('hearts');
    const ctSpades    = thisInstance.myPollStatus.getCountForSpecificChoice('spades');
    
    const strPollResults = "Poll results:<br>"
      + `${ctClubs} \u2663<br>${ctDiamonds} \u2666<br>${ctHearts} \u2665<br>${ctSpades} \u2660`;
    const htmlPollResults = `<div style="color: black; background-color: #ffffff; font-size: 24px; ">${strPollResults}</div>`;
  
    console.log(`I am ${thisInstance.myVoterStatus.userID} in pollsterTally()`);

    console.log(htmlPollResults);
    
    thisInstance.menus.postMessage({ action: 'hud-set', src: htmlPollResults });
    /* --- */
  }// pollsterTally()
  
  onResultsReceived(inPublishedTally) {
    console.log(`onResultsReceived by ${this.myVoterStatus.userID}`);
    console.dir(inPublishedTally);
    //
    this.myPollStatus.importPublshedTally_FromJsonString(inPublishedTally);
  
    const ctClubs     = this.myPollStatus.getCountForPublishedChoice('clubs');
    const ctDiamonds  = this.myPollStatus.getCountForPublishedChoice('diamonds');
    const ctHearts    = this.myPollStatus.getCountForPublishedChoice('hearts');
    const ctSpades    = this.myPollStatus.getCountForPublishedChoice('spades');
    
    const strPollResults = "Poll results:<br>"
      + `${ctClubs} \u2663<br>${ctDiamonds} \u2666<br>${ctHearts} \u2665<br>${ctSpades} \u2660`;
    const htmlPollResults = `<div style="color: black; background-color: #ffffff; font-size: 24px; ">${strPollResults}</div>`;
  
    console.log(`I am ${this.myVoterStatus.userID} in onResultsReceived()`);

    console.log(htmlPollResults);
    
    this.menus.postMessage({ action: 'hud-set', src: htmlPollResults });
  }// onResultsReceived()

  onBtnTriggerPoll() {
    console.log(`onBtnTriggerPoll by ${this.myVoterStatus.userID}`);
    
    // Only one poll at a time.
    if (this.myPollStatus.isPollInProgress()){
      console.error('Poll request denied. Gotta clean up the old one first.');
      return;
    }
    
    /* --- *
    this.user.getProperty('', 'choice').then(curChoice => {
      console.log(`onBtnTriggerPoll old choice ${curChoice}`);
    }).catch(err => {
      console.warn('Error fetching old user choice -- ', err)
    });
    //this.castVote_OfCurUser('');
    //this.menus.postMessage({ action: 'hud-clear' });
    /* --- */
    
    // T+0 sec: Pollster broadcast 'announcing-poll' so all users can start moving toward a choice.
    this.messages.send({ action:'announcing-poll', pollster: this.myVoterStatus.userID }, true)
    
    // T+5 sec: Pollster broadcast 'requesting-ballots' for all to immediately reply to pollster return address.
    const timeoutID_RequestBallots = setTimeout(this.pollsterRequestBallots, 5000, this);
    
    // 5< T <10: Each user has a chance to reply via 'sending-ballot' message with ballot or abstension.
    // Pollster counts the ballots as they arrive
      
    // T+10 sec: Pollster finalizes tally.
    const timeoutID_Tally = setTimeout(this.pollsterTally, 10000, this);
    
    // 10 < T sec: Cleanup and relinquish.
    // this.messages.send({ action:'cleanup-after-poll' }, true);  
    
    //console.log(`timeoutID: ${timeoutID_RequestBallots}`);
    //console.log(`timeoutID: ${timeoutID_Tally}`);
  }// onBtnTriggerPoll
  
  onBtnTriggerNudge() {
    this.myPollStatus.hearAboutCleanup();
  }

  onBtnClubs() {
    this.castVote_OfCurUser('clubs');
    this.menus.postMessage({ action: 'hud-set',
      src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&clubs;&nbsp;</div>'
    });
    
    // let objUserOldPos = this.user.getPosition();
    // console.dir(objUserOldPos); // promise
    // let objSetPosRet = this.user.setPosition(11,1,31,false);
    // console.dir(objSetPosRet); // promise
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
    });
  }

  onBtnSpades() {
    this.castVote_OfCurUser('spades');
    this.menus.postMessage({ action: 'hud-set',
      src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&spades;&nbsp;</div>'
    });
  }
  
  castVote_OfCurUser(inChoice) {
    const choiceProp = { choice: inChoice };
  
    //console.dir(choiceProp);
    this.user.setProperties(choiceProp);
  
    this.user.getID().then(inUserID => {
      var strCurUserId = inUserID;
      console.log(`CurUserId ${strCurUserId} Votes ${inChoice}`);
      
      this.user.getProperties('').then(inUserProps => {
        var strjsonCurUserProps = JSON.stringify(inUserProps);
        console.log(`CurUserProps ${strjsonCurUserProps}`);
        //console.dir(inUserProps);
      }).catch(err => {
        console.warn('Error fetching cur user props -- ', err)
      })

      //console.dir(this.user.getProperties(strCurUserId));
      //console.dir(this.user.getProperties(''));
    }).catch(err => {
      console.warn('Error fetching cur user ID in castVote_OfCurUser() -- ', err)
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