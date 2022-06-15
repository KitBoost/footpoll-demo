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

    onBtnTriggerPoll() {
        //this.menus.alert("onBtnTriggerPoll")
        console.log("onBtnTriggerPoll"); 
        this.menus.postMessage({ action: 'hud-clear' })
    }

    onBtnClubs() {
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&clubs;&nbsp;</div>'
        })
    }
    
    onBtnDiamonds() {
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: red; background-color: #ffffff; font-size: 64px; ">&nbsp;&diams;&nbsp;</div>'
        })
    }

    onBtnHearts() {
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: red; background-color: #ffffff; font-size: 64px; ">&nbsp;&hearts;&nbsp;</div>'
        })
    }

    onBtnSpades() {
        this.menus.postMessage({ action: 'hud-set',
          src: '<div style="color: black; background-color: #ffffff; font-size: 64px; ">&nbsp;&spades;&nbsp;</div>'
        })
    }

}
