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
    this.choices          = inChoices;
    this.catchAllKey      = inCatchAllKey;
    this.isUsingCatchAll  = isValidPollChoiceName(inCatchAllKey);
    //this.myUserID         = inMyUserID;
    this.tally            = new Object;

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
    this.pollsterUserID      = '';
    this.amIPollster         = false;
    this.isPollInProgress    = false;
    this.isMyBallotSubmitted = false;
    //this.tally               = {};
    
    for (let key in this.tally) {
      this.tally[key] = 0;
    }

    //this.ctPollDiamonds      = 0;
    //this.ctPollHearts        = 0;
    //this.ctPollSpades        = 0;
    //this.ctPollAbstentions   = 0;
    console.log('eo Pollstatus.resetForNextPoll');
    console.dir(this);
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
      
    for (let key in this.tally) {
      if (inChoice == key) {
        retVal = this.tally[key];
        foundKeyMatch = true;
        break;
      }
    }
    
    if (! foundKeyMatch && this.isUsingCatchAll){
      retVal = this.tally[this.catchAllKey];
    }
    
    return retVal;
  }// getCountForSpecificChoice()

  /* --- *
  incrementDiamondsTally(){
    this.ctPollClubs++;
  }
  
  getDiamondsTally(){
  }
  
  incrementHeartsTally(){
    this.ctPollClubs++;
  }
  
  getHeartsTally(){
  }
  
  incrementSpadesTally(){
    this.ctPollClubs++;
  }
  
  getSpadesTally(){
  }
  
  incrementAbstentionsTally(){
  }
  
  getAbstentionsTally(){
  }
  /* --- */
  
}// class PollStatus


module.exports = class PollMenuPlugin extends BasePlugin {

  /** Plugin info */
  static get id()             { return 'pollmenu-plugin' };
  static get name()           { return 'Poll Menu' };
  static get description()    { return 'Presents a menu to query poll results.' };
  
  padList       = [];   // List of pads that trigger a poll choice when near.
  //myUserID      = '';
  myVoterStatus = null; //new VoterStatus();
  myPollStatus  = null; //new PollStatus();
  
  // Status of current or recent poll.
  /* --- *
  pollsterUserID      = '';
  amIPollster         = false;
  isPollInProgress    = false;
  isMyBallotSubmitted = false;
  ctPollClubs         = 0;
  ctPollDiamonds      = 0;
  ctPollHearts        = 0;
  ctPollSpades        = 0;
  ctPollAbstentions   = 0;
  
  pollStatus = {
    pollsterUserID      : '',
    amIPollster         : false;
    isPollInProgress    : false;
    isMyBallotSubmitted : false;
    ctPollClubs         = 0;
    ctPollDiamonds      = 0;
    ctPollHearts        = 0;
    ctPollSpades        = 0;
    ctPollAbstentions   = 0;  
  }
  /* --- */

  /** Called on load */
  onLoad() {

    this.myPollStatus = new PollStatus(
      ['clubs', 'diamonds', 'hearts', 'spades'], 'abstentions');

    // Who am I?
    /* --- */
    this.user.getID().then(inUserID => {
      //this.myUserID = inUserID;
      this.myVoterStatus = new VoterStatus(inUserID);
      console.log(`I am ${this.myVoterStatus.userID}`);
    }).catch(err => {
      console.warn('Error fetching this.user.getID() in onLoad() -- ', err)
    })
    /* --- */

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
  
  onMessage(data) {
    console.log(`I am ${this.myVoterStatus.userID} hearing ${data.action}`);
    //
    if (data.action === 'announcing-poll') {
      const toastID = this.menus.toast({
        icon: this.paths.absolute('pollmenu-btn.png'),
        text: '5 seconds to vote with your feet.',
        textColor: '#2DCA8C',
        // buttonColor: '#FFFFFF',
        // buttonText: ' ', // 'Enable'
        // buttonAction: () => { console.log('clicked ack') },
        // buttonCancelText: ' ', // 'Disable'
        // buttonCancelAction: () => { console.log('clicked cancel') },
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
      console.log(`onMessage increment choice ${data.choice}`);
      this.myPollStatus.incrementCountForSpecificChoice(data.choice);
    } else {
      console.log(`onMessage unrecognized action ${data.action}`);
    }
  }// onMessage

  pollsterRequestBallots(thisPollster) {
    console.log(`I am ${thisPollster.myVoterStatus.userID} in pollsterRequestBallots()`);
    //
    thisPollster.messages.send({ action:'requesting-ballots', pollster: thisPollster.myVoterStatus.userID }, true);
    /* --- *
    thisPollster.user.getID().then(inUserID => {
      console.log(`send requesting-ballots by ${inUserID}`);
      thisPollster.messages.send({ action:'requesting-ballots', pollster: inUserID }, true);
    }).catch(err => {
      console.warn('Error fetching cur user ID -- pollsterRequestBallots -- ', err);
    })
    /* --- */
  }// onRequestPollResults
  
  pollsterTally(thisPollster) {
    console.log(`begin pollsterTally()`);  
  
    const ctClubs     = thisPollster.myPollStatus.getCountForSpecificChoice('clubs');
    const ctDiamonds  = thisPollster.myPollStatus.getCountForSpecificChoice('diamonds');
    const ctHearts    = thisPollster.myPollStatus.getCountForSpecificChoice('hearts');
    const ctSpades    = thisPollster.myPollStatus.getCountForSpecificChoice('spades');
    const strPollResults = "Poll results:<br>"
      + `${ctClubs} \u2663<br>${ctDiamonds} \u2666<br>${ctHearts} \u2665<br>${ctSpades} \u2660`;
    const htmlPollResults = `<div style="color: black; background-color: #ffffff; font-size: 24px; ">${strPollResults}</div>`;
  
    console.log(`I am ${thisPollster.myVoterStatus.userID} in pollsterTally()`);

    console.log(htmlPollResults);
    
    thisPollster.menus.postMessage({ action: 'hud-set', src: htmlPollResults });
  }

  onBtnTriggerPoll() {
    console.log(`onBtnTriggerPoll by ${this.myVoterStatus.userID}`);      
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
    this.messages.send({ action:'announcing-poll' }, true)
    
    // T+5 sec: Pollster broadcast 'requesting-ballots' for all to immediately reply to pollster return address.
    const timeoutID_RequestBallots = setTimeout(this.pollsterRequestBallots, 5000, this);
    
    // 5< T <10: Each user has a chance to reply via 'sending-ballot' message with ballot or abstension.
    // Pollster counts the ballots as they arrive
      
    // T+10 sec: Pollster finalizes tally.
    const timeoutID_Tally = setTimeout(this.pollsterTally, 10000, this);
    
    //console.log(`timeoutID: ${timeoutID_RequestBallots}`);
    //console.log(`timeoutID: ${timeoutID_Tally}`);
  }// onBtnTriggerPoll

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