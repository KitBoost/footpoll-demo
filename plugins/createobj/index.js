/**
 * Demo: Create Object
 
 A button creates an object in the space
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


module.exports = class CreateObjPlugin extends BasePlugin {

  // Plugin info
  static get id()             { return 'createobj-plugin' };
  static get name()           { return 'CreateObjPlugin' };
  static get description()    { return 'A button creates an object in the space.' };
  
  // declare some constants with a private static property accessible via static getter.
  //    CreateObjPlugin.constAdminOnlyPolling
  //    CreateObjPlugin.constEnableAdminDebugUi
  //
  static    #constAdminOnlyPolling        = false;
  static get constAdminOnlyPolling(){     return CreateObjPlugin.#constAdminOnlyPolling; }
  static    #constEnableAdminDebugUi      = false;
  static get constEnableAdminDebugUi(){   return CreateObjPlugin.#constEnableAdminDebugUi; }
  //
  // declare some constants through class instance
  //    this.constKeyAbstain
  //    this.constDefaultPadRadius
  //
  #constKeyAbstain            = 'abstain';    get constKeyAbstain(){
    return this.#constKeyAbstain; }
  #constDefaultPadRadius      = 3.0;          get constDefaultPadRadius(){
    return this.#constDefaultPadRadius; }
  //
  // Client instance properties
  //myHudState        = null;   // What is currently showing on the hud?
  
  
  onLoad() {
    // Who am I?
    this.user.getID().then(inUserID => {
      console.log(`I am ${inUserID}`);
    }).catch(err => {
      console.warn('Error fetching this.user.getID() in onLoad() -- ', err)
    })
    //
    // Create buttons in the toolbar.
    this.menus.register({
      id: 'menu-clubs',
      icon: this.paths.absolute('BtnClubs.png'),
      text: 'Splash',
      action: () => this.onBtnClubs(),
    });
  }// onLoad()


  onBtnClubs() {
    console.log(`onBtnClubs`);
    //
    let strRespCreate = this.objects.create({ type: 'plane', scale_x: 16 / 9 });
  }

}// class CreateObjPlugin


// EOF