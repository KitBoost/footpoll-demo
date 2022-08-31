/**
 * Poll Menu
 
 Visitors to a space can vote with their feet.
 This plugin counts the number of visitors standing on each linked polling target.
 *
 * @license MIT
 * @author Joe Sandmeyer
 */


/* --- *
import VoterStatus from './PollingToolsModule.js';
/* --- *
const PollingToolsModule = require("./PollingToolsModule.js");
const VoterStatus = PollingToolsModule.VoterStatus;
/* --- */


function isValidPollChoiceName(inName){
  let isSatisfied = false;
  
  do {
    if (typeof(inName)!=='string') break;
    
    let cleanString = inName.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanString.length < 1) break;
    if (cleanString !== inName) break;
    
    isSatisfied = true;
  } while(false);
  
  return isSatisfied;
}// isValidPollChoiceName


class Position3d {
  constructor(inX = 0.0, inY = 0.0, inZ = 0.0){
    this.assign(inX, inY, inZ);
  }
  assign(inX, inY, inZ){
    this.x = inX;
    this.y = inY;
    this.z = inZ;
  }
}// class Position3d


class LabeledChoiceTriggerPad {

  constructor(inLabel, inPosition, inRadius, inAbstainKey){
    console.log(`LabeledPosition constructor ${inLabel} ${inPosition} ${inRadius}`);
    if (! isValidPollChoiceName(inLabel)){
      throw `Invalid label name :${inLabel}:`;
    }
    //
    this.label = inLabel;
    this.position = inPosition;
    this.radius = inRadius;
    this.abstainKey = inAbstainKey;
  }// constructor()
  
  isPositionOnPad(inPosition){
    // Distance to center of pad.
    const distance = Math.sqrt( // Ignoring Y axis in this version.
      (this.position.x - inPosition.x) ** 2 + (this.position.z - inPosition.z) ** 2);
    return (distance < this.radius);
  }
  
  getLabelIfPositionOnPad(inPosition){
    if (this.isPositionOnPad(inPosition)){
      return this.label;
    }
    return this.abstainKey;
  }// getLabelIfPositionOnPad()

}// class LabeledChoiceTriggerPad


class VoterStatus {

  constructor(inUserID, inAbstainKey, inDefaultOverrideRadius = 0.5){
    console.log(`VoterStatus constructor inUserID ${inUserID}`);
    //
    this.userID = inUserID;
    this.abstainKey = inAbstainKey;
    this.choiceOverridePosition = null;
    this.choiceOverrideRadius = 0;
    this.DefaultOverrideRadius = inDefaultOverrideRadius;
    this.padList = new Array(); // List of pads that trigger a poll choice when near.
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
    this.pollChoice = this.abstainKey;
  }
  
  setChoiceOverride(inChoice, inPosition, inRadius = this.DefaultOverrideRadius){
    console.log(`VoterStatus setChoiceOverride ${inChoice} ${inPosition} ${inRadius}`);
    //
    if (! isValidPollChoiceName(inChoice)){
      throw `Invalid poll choice name :${inChoice}:`;
    }
    //
    this.pollChoice = inChoice;
    this.choiceOverridePosition = inPosition;
    this.choiceOverrideRadius = inRadius;
  }
  
  onUserPositionUpdate(inPosition){
    let hitChoice = this.abstainKey;
    //
    // First check whether an override should maintain current choice.
    if (!! this.choiceOverridePosition){
      const distance
        = Math.sqrt( // Ignoring Y axis in this version.
            (this.choiceOverridePosition.x - inPosition.x) ** 2
          + (this.choiceOverridePosition.z - inPosition.z) ** 2);
      if (distance < this.choiceOverrideRadius){
        hitChoice = this.pollChoice;
        return hitChoice;
      }
      // Just left override area. Time to disable the override.
      this.choiceOverridePosition = null;
      this.resetPollChoice();
    }
    //
    // No override in effect, check pads next.
    //
    // Assert that instance has been initialiazed with pad array as evidence.
    if (! this.padList){ throw 'Unititialized instance.'; }
    /*---*/
    let pad = null;
    for (let padIndex = 0; padIndex < this.padList.length; padIndex++) {
      pad = this.padList[padIndex];
      //
      hitChoice = pad.getLabelIfPositionOnPad(inPosition);
      //
      if (! hitChoice){ throw 'Truthy value assertion failure.'; }
      //
      if (hitChoice != this.abstainKey){
        //this.pollChoice = hitChoice;
        //
        // Optional optimization could be inserted here
        // by calling setChoiceOverride() with this pad center and radius.
        this.setChoiceOverride(hitChoice, pad.position, pad.radius);
        //
        return this.pollChoice;
      }
    }
    /*---*/
    // No pads nor overrides affecting.
    return hitChoice;
  }// onUserPositionUpdate()
  
  pushNewPad(inLabel, inPosition, inRadius){
    let newPad = new LabeledChoiceTriggerPad(inLabel, inPosition, inRadius, this.abstainKey);
    this.padList.push(newPad);
  }
  
  diagnosticCheckAtPosition(inPosition){
    // Figure out why onUserPositionUpdate was failing with TypeError: "x" is not a function
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_function
    let padListLength = (this.padList) ? this.padList.length : 0;
    //
    console.log(`VoterStatus diagnosticCheck padListLength ${padListLength} padList follows`);
    if (!! this.padList){
      console.dir(this.padList);
    }else{
      console.log('padList is null');
    }
    //
    console.log('VoterStatus diagnosticCheck inPosition follows');
    console.dir(inPosition);   
    //
    let label = this.abstainKey;
    let pad = null;
    for (let padIndex = 0; padIndex < this.padList.length; padIndex++) {
      pad = this.padList[padIndex];
      //
      /*---*/
      label = pad.getLabelIfPositionOnPad(inPosition);
      //
      if (! label){ throw 'Truthy value assertion failure.'; }
      //
      console.log(`VoterStatus diagnosticCheck a pad of type ${typeof pad} with ${label} at index ${padIndex} follows`);
      console.dir(pad);
      /*---*/
    }
  }// diagnosticCheckAtPosition
}// class VoterStatus


class PollStatus {

  constructor(inChoices, inCatchAllKey = null){
    this.catchAllKey          = inCatchAllKey;
    this.isUsingCatchAll      = isValidPollChoiceName(inCatchAllKey);
    this.tally                = new Object;
    this.recentPublishedTally = null;
    //
    let needToAddCatchAll = this.isUsingCatchAll;
    //
    for (let index in inChoices) {
      let key = inChoices[index]
      //
      this.tally[key] = 0;
      //
      if (key == inCatchAllKey){
        needToAddCatchAll = false;
      }
    }
    //
    if (needToAddCatchAll){
      this.tally[inCatchAllKey] = 0;
    }
    //
    this.resetForNextPoll();
    console.log('eo Pollstatus.constructor');
  }// constructor()
  
  resetForNextPoll(){
    this.pollsterUserID      = null;
    //
    for (let key in this.tally) {
      this.tally[key] = 0;
    }
    //
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
    let foundKeyMatch = false;
    //
    for (let key in this.tally) {
      if (inChoice == key) {
        this.tally[key]++;
        foundKeyMatch = true;
        break;
      }
    }
    //
    if (! foundKeyMatch && this.isUsingCatchAll){
      this.tally[this.catchAllKey]++;
    }
  }// incrementCountForSpecificChoice()
  
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

  getCountForPublishedCatchall(){
    if (this.isUsingCatchAll){
      return getCountForPublishedChoice(catchAllKey);
    }
    return 0;
  }// getCountForPublishedCatchall()

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
  
  // declare some constants with a private static property accessible via static getter.
  //    PollMenuPlugin.constAdminOnlyPolling
  //    PollMenuPlugin.constEnableAdminDebugUi
  //
  static    #constAdminOnlyPolling        = false;
  static get constAdminOnlyPolling(){     return PollMenuPlugin.#constAdminOnlyPolling; }
  static    #constEnableAdminDebugUi      = true;
  static get constEnableAdminDebugUi(){   return PollMenuPlugin.#constEnableAdminDebugUi; }
  //
  // declare some constants through class instance
  //    this.constKeyAbstain
  //    this.constDefaultPadRadius
  //
  #constKeyAbstain            = 'abstain';    get constKeyAbstain(){
    return this.#constKeyAbstain; }
  #constDefaultPadRadius      = 3.0;          get constDefaultPadRadius(){
    return this.#constDefaultPadRadius; }

  // Experimental Doodad
  myDoodad  = null;
  
  // Client instance properties
  myVoterStatus     = null;   // My status as a voter.
  myPollStatus      = null;   // Status of current or recent poll.
  myHudState        = null;   // What is currently showing on the hud?
  
  // Heartbeat timer counts lifetime of this instance in Bims = BigInt milliseconds.
  myHeartbeatTimer  = null;   // Interval timer triggers this.onHeartbeat()
  myHeartbeatBims   = BigInt(250);
  myLifetimeBims    = BigInt(0);
  
  onLoad() {
    this.myPollStatus = new PollStatus(
      ['clubs', 'diamonds', 'hearts', 'spades'], this.constKeyAbstain );
    //
    // Who am I?
    this.user.getID().then(inUserID => {
      this.myVoterStatus = new VoterStatus(inUserID, this.constKeyAbstain );
      console.log(`Tell new VoterStatus that I am ${this.myVoterStatus.userID}`);
    }).catch(err => {
      console.warn('Error fetching this.user.getID() in onLoad() -- ', err)
    })
    //
    // Register component
    this.objects.registerComponent(PollChoicePadComponent, {
        id:           'poll-choice-pad',
        name:         'Poll Choice Pad',
        description:  'Pad to trigger a poll choice. (version 00-00-01)',
        settings: [
          {   id:     'poll-choice',
              name:   'Choice',
              type:   'select',
              values: [ this.constKeyAbstain,
                        'clubs', 'diamonds', 'hearts', 'spades'],
              help:   'Choosing clubs, diamonds, hearts, or spades'
                  +   ' will cause the pad to trigger this choice.'
                  +   " Choosing 'abstain' will refrain from making a choice."
          },{
              id:      'activation-radius',
              name:    'Activation Radius',
              type:    'number',
              default: 2.0,
              help: 'How far from center of pad will it be triggered by a user?'
                  + ' Default is 2.0 meters.' },
        ]
    });
    // Prepare a HUD display.
    this.menus.register({
      id:       'hud',
      title:    'hudmenu-label',
      text:     'hudmenu-text',
      section:  'overlay-top',
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
      adminOnly: PollMenuPlugin.constAdminOnlyPolling,
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
    //
    if (PollMenuPlugin.constEnableAdminDebugUi){
      this.menus.register({
        id: 'menu-nudge',
        icon: this.paths.absolute('pollmenu-btn.png'),
        text: 'Nudge',
        adminOnly: true,
        // Enable diagnostic method of choice.
        //action: () => this.onBtnTriggerNudge(),
        //action: () => this.onBtnInspectDoodad(),
        action: () => this.onBtnTestDoodad(),
        section: 'controls'
      });
    }
    //
    this.myHeartbeatTimer = setInterval(this.onHeartbeat.bind(this), Number(this.myHeartbeatBims));
  }// onLoad()
  
  onPadEnabled(inLabel, inPosition, inRadius){
    console.log(`Tell VoterStatus about pad with ${inLabel} ${inPosition} ${inRadius}`);
    if (! this.myVoterStatus){ throw 'onPadEnabled fails if this.myVoterStatus is not ready'; }
    //
    this.myVoterStatus.pushNewPad(inLabel, inPosition, inRadius);
  }// onPadEnabled()
  
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
      const theChoice = this.myVoterStatus.pollChoice;
      console.log(`onMessage requesting-ballots send choice ${theChoice} to pollster.`);
      this.messages.send({ action:'sending-ballot', choice: theChoice }, true);
      /* --- *
      this.user.getProperty('', 'choice').then(curChoice => {
        console.log(`onMessage requesting-ballots send choice ${curChoice} to ${data.pollster}`);
        this.messages.send({ action:'sending-ballot', choice: curChoice }, true, data.pollster);
      }).catch(err => {
        console.warn('Error fetching user choice -- onMessage requesting-ballots', err)
      });
      /* --- */
    } else if (data.action === 'sending-ballot') {
      // This message was addressed directly to me as pollster.
      console.log(`onMessage increment choice ${data.choice}`);
      this.myPollStatus.incrementCountForSpecificChoice(data.choice);
    } else if (data.action === 'publishing-results') {
      console.log(`onMessage publishing-results`);
      this.onResultsReceived(data.tally);
    } else if (data.action === 'cleanup-after-poll') {
      console.log(`onMessage cleanup`);
      this.onCleanupAfterPoll();
    } else {
      console.log(`onMessage unrecognized action ${data.action}`);
    }
  }// onMessage

  instanceRequestBallots(thisInstance) {
    // thisInstance param is a workaround for 'this' context getting lost from setTimeout() callback.
    console.log(`I am ${thisInstance.myVoterStatus.userID} in instanceRequestBallots()`);
    //
    thisInstance.messages.send({ action:'requesting-ballots', pollster: thisInstance.myVoterStatus.userID }, true);
  }// onRequestPollResults
  
  instanceTally(thisInstance) {
    // thisInstance param is a workaround for 'this' context getting lost from setTimeout() callback.
    console.log(`begin instanceTally() thisInstance obj follows:`);
    console.dir(thisInstance);
    
    let amIThePollster = thisInstance.myPollStatus.amIThePollster( thisInstance.myVoterStatus.userID );
    
    console.log(`step instanceTally() amIThePollster ${amIThePollster}`);
    if (! amIThePollster) return;
    
    thisInstance.messages.send({ action:'publishing-results', tally: thisInstance.myPollStatus.exportTally_AsJsonString() }, true);
  }// instanceTally()
  
  instanceDoneShowingResults(thisInstance) {
    // thisInstance param is a workaround for 'this' context getting lost from setTimeout() callback.
    thisInstance.messages.send({ action:'cleanup-after-poll' }, true);
  }// instanceDoneShowingResults()
  
  onResultsReceived(inPublishedTally) {
    console.log(`onResultsReceived by ${this.myVoterStatus.userID}`);
    console.dir(inPublishedTally);
    //
    this.myPollStatus.importPublshedTally_FromJsonString(inPublishedTally);
    this.updateHudState('tally-wanted');
    //
    const timeoutID_ShowingResults = setTimeout(this.instanceDoneShowingResults, 5000, this);
  }// onResultsReceived()
  
  onCleanupAfterPoll() {
    this.myPollStatus.resetForNextPoll();
    //this.hudShowChoice( this.myVoterStatus.pollChoice );
    this.updateHudState();
  }// onCleanupAfterPoll()

  onBtnTriggerPoll() {
    console.log(`onBtnTriggerPoll by ${this.myVoterStatus.userID}`);
    
    // Only one poll at a time.
    if (this.myPollStatus.isPollInProgress()){
      console.error('Poll request denied. Gotta clean up the old one first.');
      return;
    }
    
    // T+0 sec: Pollster broadcast 'announcing-poll' so all users can start moving toward a choice.
    this.messages.send({ action:'announcing-poll', pollster: this.myVoterStatus.userID }, true)
    
    // T+5 sec: Pollster broadcast 'requesting-ballots' for all to immediately reply to pollster return address.
    const timeoutID_RequestBallots = setTimeout(this.instanceRequestBallots, 5000, this);
    
    // 5< T <10: Each user has a chance to reply via 'sending-ballot' message with ballot or abstension.
    // Pollster counts the ballots as they arrive
      
    // T+10 sec: Pollster finalizes tally.
    const timeoutID_Tally = setTimeout(this.instanceTally, 10000, this);
    
    // 10< T <15: Publish results.
    // this.messages.send({ action:'publishing-results' }, true);
    
    // T+15 sec: Cleanup after poll
    // this.messages.send({ action:'cleanup-after-poll' }, true);
    
    //console.log(`timeoutID: ${timeoutID_RequestBallots}`);
    //console.log(`timeoutID: ${timeoutID_Tally}`);
  }// onBtnTriggerPoll
  
  onHeartbeat() {
    this.myLifetimeBims += this.myHeartbeatBims;
    //
    this.user.getPosition().then(inPosition => {
      let existingChoice = this.myVoterStatus.onUserPositionUpdate(inPosition);
      //
      this.updateHudView();
    }).catch(err => {
      console.warn('Error fetching cur user position -- ', err)
    });
    
    if ((this.myLifetimeBims % BigInt(2 * 60 * 1000)) < this.myHeartbeatBims){
      console.log(`onHeartbeat ${this.myLifetimeBims} lifetime at a 2 min milestone`);
    }
  }// onHeartbeat()
  
  onBtnTriggerNudge() {
    this.user.getPosition().then(inPosition => {
      this.myVoterStatus.diagnosticCheckAtPosition(inPosition);
    }).catch(err => {
      console.warn('Error in onBtnTriggerNudge getPosition promise -- ', err)
    });
  }
  
  onBtnInspectDoodad() {
    this.myDoodad = this.paths.absolute('doodad.json');
    /* --- */
    console.log(`myDoodad type: ${typeof this.myDoodad}`);
    console.dir(this.myDoodad);
    /* --- */
    const aReq = new XMLHttpRequest();
    /* --- */
    console.log(`aReq type: ${typeof aReq}`);
    console.dir(aReq);
    /* --- */
    // browser
    const nVer = navigator.appVersion;
    const strAgt = navigator.userAgent;
    const strBrowser = navigator.appName;
    /* --- */
    console.log(`strAgt: ${strAgt}`);
    console.log(`strBrowser: ${strBrowser}`);
    console.dir(navigator);
    /* --- */
    const aFileReader = new FileReader();
    console.log(`aFileReader type: ${typeof aFileReader}`);
    console.dir(aFileReader);    
  }// onBtnInspectDoodad

  onDoodadFileLoading(inEvt) {
  }// onDoodadFileLoading

  onDoodadFileLoadSuccess(inEvt) {
    console.log(`onDoodadFileLoadSuccess`);
  }// onDoodadFileLoadSuccess

  onDoodadFileLoadError(inEvt) {
    console.log(`onDoodadFileLoadError`);
  }// onDoodadFileLoadError

  onBtnTestDoodad() {
    const aFileReader = new FileReader();
    
    // Read file into memory as UTF-8
    aFileReader.readAsText(this.paths.absolute('doodad.json'), "UTF-8");

    // Handle progress, success, and errors
    aFileReader.onprogress  = onDoodadFileLoading;
    aFileReader.onload      = onDoodadFileLoadSuccess;
    aFileReader.onerror     = onDoodadFileLoadError;    
  }// onBtnTestDoodad

  onBtnClubs() {
    this.user.getPosition().then(inPosition => {
      console.log(`onBtnClubs isValidPollChoiceName('clubs') ${isValidPollChoiceName('clubs')}`);
      //
      this.myVoterStatus.setChoiceOverride('clubs', inPosition);
      //this.hudShowChoice('clubs');
    }).catch(err => {
      console.warn('Error fetching cur user position -- ', err)
    });
  }
  
  onBtnDiamonds() {
    this.user.getPosition().then(inPosition => {
      console.log(`onBtnClubs isValidPollChoiceName('diamonds') ${isValidPollChoiceName('diamonds')}`);
      //
      this.myVoterStatus.setChoiceOverride('diamonds', inPosition);
      //this.hudShowChoice('diamonds');
    }).catch(err => {
      console.warn('Error fetching cur user position -- ', err)
    });
  }

  onBtnHearts() {
    this.user.getPosition().then(inPosition => {
      console.log(`onBtnClubs isValidPollChoiceName('hearts') ${isValidPollChoiceName('hearts')}`);
      //
      this.myVoterStatus.setChoiceOverride('hearts', inPosition);
      //this.hudShowChoice('hearts');
    }).catch(err => {
      console.warn('Error fetching cur user position -- ', err)
    });
  }

  onBtnSpades() {
    this.user.getPosition().then(inPosition => {
      console.log(`onBtnClubs isValidPollChoiceName('spades') ${isValidPollChoiceName('spades')}`);
      //
      this.myVoterStatus.setChoiceOverride('spades', inPosition);
      //this.hudShowChoice('spades');
    }).catch(err => {
      console.warn('Error fetching cur user position -- ', err)
    });
  }
  
  updateHudView() {
    let previousHudState = this.myHudState;
    //
    if(! previousHudState){
      previousHudState = 'choice-wanted';
    }
    //
    if('showing-tally' == previousHudState){
      return;
    }
    //
    if('tally-wanted' == previousHudState){
      const ctClubs     = this.myPollStatus.getCountForPublishedChoice('clubs');
      const ctDiamonds  = this.myPollStatus.getCountForPublishedChoice('diamonds');
      const ctHearts    = this.myPollStatus.getCountForPublishedChoice('hearts');
      const ctSpades    = this.myPollStatus.getCountForPublishedChoice('spades');
    
      const htmlPollResults
          = '<div style="color: black; background-color: #ffffff; font-size: 24px;">'
              + 'Poll results:'
              + `<br>${ctClubs} \u2663`
              + `<br>${ctDiamonds} <span style="color: red;">\u2666</span>`
              + `<br>${ctHearts} <span style="color: red;">\u2665</span>`
              + `<br>${ctSpades} \u2660`
          + '</div>';

      console.log(htmlPollResults);
    
      this.menus.postMessage({ action: 'hud-set', src: htmlPollResults });
      this.myHudState = 'showing-tally';
      return;
    }
    // Remaining possibilities include:
    //  ||  ('choice-wanted'      == previousHudState)
    //  ||  ('clubs'              == previousHudState)
    //  ||  ('diamonds'           == previousHudState)
    //  ||  ('hearts'             == previousHudState)
    //  ||  ('spades'             == previousHudState)
    //  ||  (this.constKeyAbstain == previousHudState)
    //
    let theChoice = this.myVoterStatus.pollChoice;
    //
    if(     ('choice-wanted'  == previousHudState)
        ||  (theChoice        != previousHudState)
    ){

      if ('clubs' == theChoice){
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&clubs;&nbsp;</div>'
        });
      }else if('diamonds' == theChoice){
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: red; background-color: #ffffff; font-size: 64px; ">&nbsp;&diams;&nbsp;</div>'
        });
      }else if('hearts' == theChoice){
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: red; background-color: #ffffff; font-size: 64px; ">&nbsp;&hearts;&nbsp;</div>'
        });
      }else if('spades' == theChoice){
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&spades;&nbsp;</div>'
        });
      }else {
        if (this.constKeyAbstain != theChoice){
          console.error(`updateHudView expected ${this.constKeyAbstain} but got ${theChoice}`);
        }
        // No choice to show so clear hud.
        this.menus.postMessage({ action: 'hud-clear' });
        //console.log(`updateHudView old new _${}_${}_`);
      }
      //
      this.myHudState = theChoice;
      return;
    }
    //throw 'Unhandled case in updateHudView()';
  }// updateHudView()
  
  updateHudState(inState = 'choice-wanted') {
    this.myHudState = inState;
  }// updateHudState()

}// class PollMenuPlugin


class PollChoicePadComponent extends BaseComponent {

  // Instance properties
  myCenter = null;


  getPadChoice(){
    return this.getField('poll-choice') ?? this.plugin.constKeyAbstain;
  }
  
  getPadCenter(){
    if (! this.myCenter) { throw 'Unititialized property of class instance'; }
    //
    this.myCenter.assign(
      (this.fields.x    ?? 0.0),
      0.0,
      (this.fields.y    ?? 0.0) // Beware that this.fields diabolically swaps y for z.
    );
    return this.myCenter;
  }

  getPadRadius(){
    return this.getField('activation-radius') ?? this.plugin.constDefaultPadRadius;
  }
  
  // Called when the component is loaded
  async onLoad() {
    this.myCenter = new Position3d();
  
    const theChoice   = this.getPadChoice();
    const thePosition = this.getPadCenter();
    const theRadius   = this.getPadRadius();
  
    console.log(`Loading PollChoicePadComponent with ${theChoice} ${thePosition.x} ${thePosition.z} ${theRadius}`);
    console.dir(this);

    // Add this pad to plugin list
    this.plugin.onPadEnabled(theChoice, thePosition, theRadius);
  }

  // Called when the component is unloaded
  onUnload() {
    // This method could be used to disable pad info that was copied.
    // No urgent need to do so because no component ref was shared.
    //
    const theChoice   = this.getPadChoice();
    const thePosition = this.getPadCenter();
    const theRadius   = this.getPadRadius();
  
    console.log(`Unloading PollChoicePadComponent with ${theChoice} ${thePosition.x} ${thePosition.z} ${theRadius}`);
    console.dir(this);
  }// onUnload

  // Called when a remote message is received
  onMessage(msg) {
  }

  onObjectUpdated(newFields){
    const theChoice   = this.getPadChoice();
    const thePosition = this.getPadCenter();
    const theRadius   = this.getPadRadius();
    //
    console.log(`onObjectUpdated with c x z r ${theChoice} ${thePosition.x} ${thePosition.z} ${theRadius} then newFields obj below`);
    console.dir(newFields);
  }// onObjectUpdated()

}// class PollChoicePadComponent


// EOF