/**
 * Demo: HTML Splash
 
 A button displays an HTML overlay on the screen
 *
 * @license MIT
 * @author Joe Sandmeyer
 */


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


// Need to purge:
// - myVoterStatus
// - myPollStatus
//

module.exports = class HtmlSplashPlugin extends BasePlugin {

  // Plugin info
  static get id()             { return 'htmlsplash-plugin' };
  static get name()           { return 'HtmlSplashPlugin' };
  static get description()    { return 'Presents an HTML overlay on button press.' };
  
  // declare some constants with a private static property accessible via static getter.
  //    HtmlSplashPlugin.constAdminOnlyPolling
  //    HtmlSplashPlugin.constEnableAdminDebugUi
  //
  static    #constAdminOnlyPolling        = false;
  static get constAdminOnlyPolling(){     return HtmlSplashPlugin.#constAdminOnlyPolling; }
  static    #constEnableAdminDebugUi      = false;
  static get constEnableAdminDebugUi(){   return HtmlSplashPlugin.#constEnableAdminDebugUi; }
  //
  // declare some constants through class instance
  //    this.constKeyAbstain
  //    this.constDefaultPadRadius
  //
  #constKeyAbstain            = 'abstain';    get constKeyAbstain(){
    return this.#constKeyAbstain; }
  #constDefaultPadRadius      = 3.0;          get constDefaultPadRadius(){
    return this.#constDefaultPadRadius; }

  
  // Client instance properties
  myVoterStatus     = null;   // My status as a voter.
  myPollStatus      = null;   // Status of current or recent poll.
  myHudState        = null;   // What is currently showing on the hud?
  mySplashIsVisible = false;
  
  
  onLoad() {
    // Who am I?
    this.user.getID().then(inUserID => {
      console.log(`I am ${inUserID}`);
    }).catch(err => {
      console.warn('Error fetching this.user.getID() in onLoad() -- ', err)
    })
    //
    // Prepare a HUD display.
    this.menus.register({
      id:       'hud',
      title:    'hudmenu-label',
      text:     'hudmenu-text',
      section:  'overlay-top',
      panel: {
          iframeURL: this.paths.absolute('pollhud.html'),
          width: 600,
          height: 600
      }
    });
    //
    // Create buttons in the toolbar.
    this.menus.register({
      id: 'menu-clubs',
      icon: this.paths.absolute('BtnClubs.png'),
      text: 'Splash',
      action: () => this.onBtnClubs(),
    });
  }// onLoad()

  updateHudView() {
    if( this.mySplashIsVisible ){
      const htmlPollResults
          = '<div style="color: black; background-color: #ffffff; font-size: 24px;">'
              + '<br><br><br><br><br><br>'
              + '<br>....................'
              + '<br>You Got It!'
              + '<br>....................'
              + `<br> \u2663`
          + '</div>';

      console.log(htmlPollResults);
    
      this.menus.postMessage({ action: 'hud-set', src: htmlPollResults });
      return;
    }else{
      this.menus.postMessage({ action: 'hud-clear' });
    }
  }// updateHudView()

  onBtnClubs() {
    console.log(`onBtnClubs`);
    //
    this.mySplashIsVisible = !(this.mySplashIsVisible);
    this.updateHudView();
  }

}// class HtmlSplashPlugin


// EOF